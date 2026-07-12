const express = require("express");
const router = express.Router();
const MaintenanceRequest = require("../models/MaintenanceRequest");
const authMiddleware = require("../middleware/auth.middleware");
const { updateMaintenanceStatus } = require("../services/maintenanceService");

// GET /api/maintenance - List requests
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const requests = await MaintenanceRequest.find(filter)
      .populate("asset")
      .populate("raisedBy")
      .populate("approvedBy");

    return res.status(200).json(requests);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/maintenance - Create ticket
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { asset, description, priority } = req.body;
    if (!asset || !description) {
      return res.status(400).json({ error: "Asset and description are required." });
    }

    const ticket = new MaintenanceRequest({
      asset,
      raisedBy: req.user._id,
      description,
      priority: priority || "Medium",
    });

    await ticket.save();
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/maintenance/:id/approve - Approve request
router.put("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const { technicianName } = req.body;
    const request = await updateMaintenanceStatus({
      requestId: req.params.id,
      newStatus: "Approved",
      approvedBy: req.user._id,
      technicianName,
    });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/maintenance/:id/reject - Reject request
router.put("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const request = await updateMaintenanceStatus({
      requestId: req.params.id,
      newStatus: "Rejected",
    });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
