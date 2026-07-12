const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");
const authMiddleware = require("../middleware/auth.middleware");

// GET /api/activity-logs - Get list of recent logs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("actor")
      .sort({ createdAt: -1 })
      .limit(30);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
