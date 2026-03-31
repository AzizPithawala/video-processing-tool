const { authService } = require('../services/authService');
const { success, error } = require('../utils/responseFormatter');

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, role, tenantName } = req.body;

      if (!name || !email || !password) {
        return error(res, 'Name, email, and password are required', 'VALIDATION_ERROR', 400);
      }

      if (password.length < 6) {
        return error(res, 'Password must be at least 6 characters', 'VALIDATION_ERROR', 400);
      }

      const result = await authService.register({ name, email, password, role, tenantName });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return success(res, {
        token: result.token,
        user: result.user,
      }, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return error(res, 'Email and password are required', 'VALIDATION_ERROR', 400);
      }

      const result = await authService.login({ email, password });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return success(res, {
        token: result.token,
        user: result.user,
      }, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      const result = await authService.refresh(refreshToken);

      // Set new refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return success(res, {
        accessToken: result.accessToken,
      }, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
