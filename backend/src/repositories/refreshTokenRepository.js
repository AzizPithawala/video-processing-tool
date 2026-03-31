const RefreshToken = require('../models/RefreshToken');

const refreshTokenRepository = {
  create: async (tokenData) => {
    const token = new RefreshToken(tokenData);
    return token.save();
  },

  findByToken: async (token) => {
    return RefreshToken.findOne({ token });
  },

  deleteByUserId: async (userId) => {
    return RefreshToken.deleteMany({ userId });
  },

  deleteByToken: async (token) => {
    return RefreshToken.findOneAndDelete({ token });
  },
};

module.exports = refreshTokenRepository;
