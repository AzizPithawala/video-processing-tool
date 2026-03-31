const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const tenantRepository = require('../repositories/tenantRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const env = require('../config/env');
const { ERROR_CODES } = require('../constants/errorCodes');
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tenantId: user.tenantId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRY }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const authService = {
  register: async ({ name, email, password, role, tenantName }) => {
    // Check duplicate email
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already exists', ERROR_CODES.DUPLICATE_EMAIL, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create or find tenant
    let tenant;
    if (tenantName) {
      tenant = await tenantRepository.findByName(tenantName);
      if (!tenant) {
        tenant = await tenantRepository.create({ name: tenantName });
      }
    } else {
      // Create a default tenant for the user
      tenant = await tenantRepository.create({ name: `${name}'s Organization` });
    }

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      tenantId: tenant._id,
    });

    // If admin, set as tenant owner
    if (user.role === 'admin' && !tenant.ownerId) {
      await tenantRepository.updateOwner(tenant._id, user._id);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token (hashed)
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshTokenRepository.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt,
    });

    logger.info('USER_REGISTERED', { userId: user._id, email });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token (hashed)
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshTokenRepository.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt,
    });

    logger.info('USER_LOGIN', { userId: user._id, email });

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw new AppError('Refresh token required', ERROR_CODES.INVALID_TOKEN, 401);
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await refreshTokenRepository.findByToken(hashedToken);

    if (!storedToken) {
      throw new AppError('Invalid refresh token', ERROR_CODES.INVALID_TOKEN, 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(hashedToken);
      throw new AppError('Refresh token expired', ERROR_CODES.TOKEN_EXPIRED, 401);
    }

    const user = await userRepository.findById(storedToken.userId);
    if (!user) {
      throw new AppError('User not found', ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Delete old refresh token
    await refreshTokenRepository.deleteByToken(hashedToken);

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    const hashedNewRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await refreshTokenRepository.create({
      userId: user._id,
      token: hashedNewRefreshToken,
      expiresAt,
    });

    logger.info('TOKEN_REFRESHED', { userId: user._id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },
};

module.exports = { authService, AppError };
