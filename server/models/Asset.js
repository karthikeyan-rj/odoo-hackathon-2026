const mongoose = require("mongoose");
const {
  ASSET_CONDITIONS,
  ASSET_STATUSES,
} = require("../constants/enums");

const assetFileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
    },

    assetTag: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    serialNumber: {
      type: String,
      trim: true,
      set(value) {
        // Store undefined instead of empty strings so the partial
        // unique index ignores documents without a serial number.
        if (!value || !value.trim()) {
          return undefined;
        }

        return value.trim();
      },
    },

    acquisitionDate: {
      type: Date,
      default: null,
    },

    acquisitionCost: {
      type: Number,
      min: 0,
      default: null,
    },

    condition: {
      type: String,
      enum: ASSET_CONDITIONS,
      default: "Good",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    homeDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    files: {
      type: [assetFileSchema],
      default: [],
    },

    customValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isBookable: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

// unique assetTag index is created automatically by { unique: true } on the field

// Partial unique index — only enforces uniqueness when serialNumber exists
// as a string. Documents without a serial number are ignored.
assetSchema.index(
  { serialNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      serialNumber: { $type: "string" },
    },
  }
);

assetSchema.index({ category: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ homeDepartment: 1 });
assetSchema.index({ isBookable: 1 });

module.exports =
  mongoose.models.Asset || mongoose.model("Asset", assetSchema);
