const express = require("express");
const router = express.Router();
const AssetCategory = require("../models/AssetCategory");

// GET /api/categories - List all categories
router.get("/", async (req, res) => {
  try {
    const cats = await AssetCategory.find();
    return res.status(200).json(cats);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/categories - Create a category
router.post("/", async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const cat = new AssetCategory({
      name,
      description,
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

module.exports = router;
