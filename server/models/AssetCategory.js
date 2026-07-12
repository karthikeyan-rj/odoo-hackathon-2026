const mongoose = require('mongoose');
const { ASSET_CATEGORY_STATUS } = require('../constants/enums');

const assetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(ASSET_CATEGORY_STATUS),
      default: ASSET_CATEGORY_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
