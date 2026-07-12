const express = require("express");
const router = express.Router();
const AssetCategory = require("../models/AssetCategory");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/categories - List all categories
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cats = await AssetCategory.find();
    return res.status(200).json(cats);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/categories - Create a category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, customFields, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const cat = new AssetCategory({
      name,
      description,
      customFields: customFields || [],
      status: status || "Active",
    });

    await cat.save();
    return res.status(201).json(cat);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Category name must be unique" });
    }
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/categories/:id - Update a category
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, customFields, status } = req.body;
    const cat = await AssetCategory.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (customFields !== undefined) cat.customFields = customFields || [];
    if (status) cat.status = status;

    await cat.save();
    return res.status(200).json(cat);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
