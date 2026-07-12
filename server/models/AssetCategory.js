const mongoose = require("mongoose");
const { ACTIVE_STATUS } = require("../constants/enums");

const customFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "number", "date"],
      default: "text",
    },

    required: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },

    status: {
      type: String,
      enum: ACTIVE_STATUS,
      default: "Active",
    },

    customFields: {
      type: [customFieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// unique name index is created automatically by { unique: true } on the field
assetCategorySchema.index({ status: 1 });

module.exports =
  mongoose.models.AssetCategory ||
  mongoose.model("AssetCategory", assetCategorySchema);
