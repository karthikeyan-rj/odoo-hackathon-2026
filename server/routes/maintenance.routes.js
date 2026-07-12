const express = require("express");
const router = express.Router();
const MaintenanceRequest = require("../models/MaintenanceRequest");
const authMiddleware = require("../middleware/auth.middleware");
const { updateMaintenanceStatus } = require("../services/maintenanceService");
const { createNotification } = require("../services/notification.service");

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
    const { asset, description, priority, attachmentUrl } = req.body;
    if (!asset || !description) {
      return res.status(400).json({ error: "Asset and description are required." });
    }

    const ticket = new MaintenanceRequest({
      asset,
      raisedBy: req.user._id,
      description,
      priority: priority || "Medium",
      attachmentUrl: attachmentUrl || "",
    });

    await ticket.save();
    await createNotification({ userId: req.user._id, type: "Maintenance Submitted", message: `Maintenance request submitted for asset ${asset}.`, entityType: "MaintenanceRequest", entityId: ticket._id });
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
    await createNotification({ userId: request.raisedBy, type: "Maintenance Approved", message: "Your maintenance request was approved.", entityType: "MaintenanceRequest", entityId: request._id });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/maintenance/:id/assign - Assign technician
router.put("/:id/assign", authMiddleware, async (req, res) => {
  try {
    const { technicianName } = req.body;
    const request = await updateMaintenanceStatus({
      requestId: req.params.id,
      newStatus: "TechnicianAssigned",
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
    await createNotification({ userId: request.raisedBy, type: "Maintenance Rejected", message: "Your maintenance request was rejected.", entityType: "MaintenanceRequest", entityId: request._id });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/maintenance/:id/start - Technician starts approved work
router.put("/:id/start", authMiddleware, async (req, res) => {
  try {
    const request = await updateMaintenanceStatus({ requestId: req.params.id, newStatus: "InProgress" });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/maintenance/:id/resolve - Resolve request
router.put("/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const request = await updateMaintenanceStatus({
      requestId: req.params.id,
      newStatus: "Resolved",
    });
    return res.status(200).json(request);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
