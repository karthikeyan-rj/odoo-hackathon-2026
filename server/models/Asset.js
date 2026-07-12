const mongoose = require('mongoose');
const { ASSET_STATUS } = require('../constants/enums');

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    serialNumber: { type: String, trim: true },
    condition: { type: String, trim: true, default: "Good" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },
    location: { type: String, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    purchaseDate: { type: Date },
    purchaseCost: { type: Number },
    isBookable: { type: Boolean, default: false },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

// Text index for search (assetTag, serialNumber, name)
assetSchema.index({ assetTag: 'text', serialNumber: 'text', name: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
