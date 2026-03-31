const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

tenantSchema.index({ name: 1 });
tenantSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Tenant', tenantSchema);
