const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// GET /api/departments - List all departments
router.get("/", async (req, res) => {
  try {
    const depts = await Department.find().populate("head").populate("parentDepartment");
    return res.status(200).json(depts);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/departments - Create a department
router.post("/", async (req, res) => {
  try {
    const { name, parentDepartment, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    const dept = new Department({
      name,
      parentDepartment: parentDepartment || null,
      status: status || "Active",
    });

    await dept.save();
    return res.status(201).json(dept);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Department name must be unique" });
    }
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/departments/:id - Update department
router.put("/:id", async (req, res) => {
  try {
    const { name, head, parentDepartment, status } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (name) dept.name = name;
    if (head !== undefined) dept.head = head || null;
    if (parentDepartment !== undefined) dept.parentDepartment = parentDepartment || null;
    if (status) dept.status = status;

    await dept.save();
    return res.status(200).json(dept);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
