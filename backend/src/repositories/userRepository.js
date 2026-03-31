const User = require('../models/User');

const userRepository = {
  create: async (userData) => {
    const user = new User(userData);
    return user.save();
  },

  findByEmail: async (email) => {
    return User.findOne({ email });
  },

  findById: async (id) => {
    return User.findById(id).select('-password');
  },

  findByIdWithPassword: async (id) => {
    return User.findById(id);
  },

  findByTenant: async (tenantId) => {
    return User.find({ tenantId }).select('-password');
  },
};

module.exports = userRepository;
