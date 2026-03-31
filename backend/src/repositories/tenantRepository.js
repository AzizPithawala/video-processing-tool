const Tenant = require('../models/Tenant');

const tenantRepository = {
  create: async (tenantData) => {
    const tenant = new Tenant(tenantData);
    return tenant.save();
  },

  findById: async (id) => {
    return Tenant.findById(id);
  },

  findByName: async (name) => {
    return Tenant.findOne({ name });
  },

  updateOwner: async (id, ownerId) => {
    return Tenant.findByIdAndUpdate(id, { ownerId }, { new: true });
  },
};

module.exports = tenantRepository;
