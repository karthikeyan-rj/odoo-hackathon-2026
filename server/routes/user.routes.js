const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/users - List all users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().populate("department");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/users/:id - Update user profile fields
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { role, department, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (role) {
      user.role = role;
      user.roleAssignedAt = new Date();
      user.roleAssignedBy = req.user?._id || null;
    }
    if (department !== undefined) user.department = department || null;
    if (status) user.status = status;

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/users/:id/role - Update user role
router.put("/:id/role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    user.roleAssignedAt = new Date();
    user.roleAssignedBy = req.user?._id || null;
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
