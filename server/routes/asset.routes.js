const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const AssetCategory = require("../models/AssetCategory");
const Allocation = require("../models/Allocation");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const ActivityLog = require("../models/ActivityLog");
const authMiddleware = require("../middleware/auth.middleware");
const { logActivity } = require("../services/activityLog.service");

// POST /api/assets - Register a new asset
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      assetTag,
      category,
      serialNumber,
      status,
      location,
      department,
      purchaseDate,
      purchaseCost,
      acquisitionDate,
      acquisitionCost,
      condition,
      isBookable,
      description,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "Name and category are required." });
    }

    const categoryExists = await AssetCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category ID. Category not found." });
    }

    let tagValue = (assetTag || "").trim();
    if (!tagValue) {
      let counter = (await Asset.countDocuments()) + 1;
      while (true) {
        tagValue = `AF-${String(counter).padStart(4, "0")}`;
        const exists = await Asset.findOne({ assetTag: tagValue });
        if (!exists) break;
        counter += 1;
      }
    } else {
      const duplicateTag = await Asset.findOne({ assetTag: tagValue });
      if (duplicateTag) {
        return res.status(400).json({ error: `Asset with tag ${tagValue} already exists.` });
      }
    }

    const newAsset = new Asset({
      name,
      assetTag: tagValue,
      category,
      serialNumber,
      condition: condition || "Good",
      status: status || "Available",
      location,
      department: department || null,
      purchaseDate: purchaseDate || acquisitionDate || null,
      purchaseCost: purchaseCost || acquisitionCost || null,
      isBookable: isBookable || false,
      description,
    });

    await newAsset.save();

    await logActivity({
      actor: req.user?._id,
      action: "Asset Registered",
      entityType: "Asset",
      entityId: newAsset._id,
      details: { name: newAsset.name, tag: newAsset.assetTag }
    });

    return res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error registering asset:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// GET /api/assets - Retrieve assets with search and filters
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search, category, status, department, location, isBookable } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (location) filter.location = { $regex: location, $options: "i" };
    
    if (isBookable !== undefined) {
      filter.isBookable = isBookable === "true" || isBookable === true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { assetTag: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } }
      ];
    }

    const assets = await Asset.find(filter).populate("category").populate("department");
    return res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const allocations = await Allocation.find({ asset: req.params.id }).sort({ allocatedAt: -1 }).limit(10);
    const maintenance = await MaintenanceRequest.find({ asset: req.params.id }).sort({ createdAt: -1 }).limit(10);
    const logs = await ActivityLog.find({ entityType: "Asset", entityId: req.params.id }).sort({ createdAt: -1 }).limit(10);

    const history = [
      ...allocations.map((item) => ({
        type: "Allocation",
        description: `Allocation ${item.status}`,
        date: item.allocatedAt || item.createdAt,
      })),
      ...maintenance.map((item) => ({
        type: "Maintenance",
        description: `${item.status}: ${item.description}`,
        date: item.createdAt,
      })),
      ...logs.map((item) => ({
        type: item.action,
        description: item.details?.name || item.details?.assetName || "Activity logged",
        date: item.createdAt,
      })),
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return res.status(200).json(history.slice(0, 20));
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
