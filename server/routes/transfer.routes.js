const express = require("express");
const router = express.Router();
const TransferRequest = require("../models/TransferRequest");
const authMiddleware = require("../middleware/auth.middleware");
const { approveTransfer } = require("../services/allocationService");

// GET /api/transfers - List transfers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const transfers = await TransferRequest.find(filter)
      .populate("asset")
      .populate("requestedBy")
      .populate("reviewedBy")
      .populate("targetUser")
      .populate("targetDepartment");

    return res.status(200).json(transfers);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// GET /api/transfers/department - Department head approvals
router.get("/department", authMiddleware, async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(200).json([]);
    }

    const transfers = await TransferRequest.find({ targetDepartment: req.user.department })
      .populate("asset")
      .populate("requestedBy")
      .populate("reviewedBy");

    return res.status(200).json(transfers);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/transfers - Create transfer request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { asset, targetType, targetUser, targetDepartment, reason } = req.body;
    if (!asset || !targetType) {
      return res.status(400).json({ error: "Asset and targetType are required." });
    }

    const transfer = new TransferRequest({
      asset,
      requestedBy: req.user._id,
      targetType,
      targetUser: targetType === "User" ? targetUser : undefined,
      targetDepartment: targetType === "Department" ? targetDepartment : undefined,
      reason,
      status: "Requested",
    });

    await transfer.save();
    return res.status(201).json(transfer);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/transfers/:id/approve - Approve transfer request
router.put("/:id/approve", authMiddleware, async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id);
    if (!transferRequest) {
      return res.status(404).json({ error: "Transfer request not found" });
    }

    // Call service to close old and open new allocation
    await approveTransfer({
      transferRequest,
      reviewedBy: req.user._id,
    });

    transferRequest.status = "Approved";
    transferRequest.reviewedBy = req.user._id;
    transferRequest.reviewedAt = new Date();
    await transferRequest.save();

    return res.status(200).json(transferRequest);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/transfers/:id/reject - Reject transfer request
router.put("/:id/reject", authMiddleware, async (req, res) => {
  try {
    const transferRequest = await TransferRequest.findById(req.params.id);
    if (!transferRequest) {
      return res.status(404).json({ error: "Transfer request not found" });
    }

    transferRequest.status = "Rejected";
    transferRequest.reviewedBy = req.user._id;
    transferRequest.reviewedAt = new Date();
    await transferRequest.save();

    return res.status(200).json(transferRequest);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
