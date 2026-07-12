const express = require("express");
const router = express.Router();
const Asset = require("../models/Asset");
const AssetCategory = require("../models/AssetCategory");

// POST /api/assets - Register a new asset
router.post("/", async (req, res) => {
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
      isBookable,
      description,
    } = req.body;

    // Validation
    if (!name || !assetTag || !category) {
      return res.status(400).json({ error: "Name, assetTag, and category are required." });
    }

    // Check if category exists
    const categoryExists = await AssetCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid category ID. Category not found." });
    }

    // Check for duplicate assetTag
    const duplicateTag = await Asset.findOne({ assetTag: assetTag.trim() });
    if (duplicateTag) {
      return res.status(400).json({ error: `Asset with tag ${assetTag} already exists.` });
    }

    const newAsset = new Asset({
      name,
      assetTag: assetTag.trim(),
      category,
      serialNumber,
      status,
      location,
      department: department || null,
      purchaseDate,
      purchaseCost,
      isBookable: isBookable || false,
      description,
    });

    await newAsset.save();
    return res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error registering asset:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// GET /api/assets - Retrieve assets with search and filters
router.get("/", async (req, res) => {
  try {
    const { search, category, status, department, location } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (location) filter.location = { $regex: location, $options: "i" };

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

module.exports = router;
