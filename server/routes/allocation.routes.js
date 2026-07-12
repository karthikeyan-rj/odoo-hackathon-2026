const express = require("express");
const router = express.Router();
const Allocation = require("../models/Allocation");
const Asset = require("../models/Asset");
const authMiddleware = require("../middleware/auth.middleware");
const { allocateAsset, returnAsset } = require("../services/allocationService");

// GET /api/allocations - List allocations
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};

    // Role-based filtering
    if (req.user.role === "Employee") {
      filter.assigneeUser = req.user._id;
    } else if (req.user.role === "DepartmentHead" && req.user.department) {
      filter.assigneeDepartment = req.user.department;
    }

    const allocations = await Allocation.find(filter)
      .populate("asset")
      .populate("assigneeUser")
      .populate("assigneeDepartment")
      .populate("allocatedBy");

    return res.status(200).json(allocations);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// GET /api/allocations/department - List department allocations
router.get("/department", authMiddleware, async (req, res) => {
  try {
    if (!req.user.department) {
      return res.status(200).json([]);
    }

    const allocations = await Allocation.find({ assigneeDepartment: req.user.department })
      .populate("asset")
      .populate("assigneeUser")
      .populate("assigneeDepartment")
      .populate("allocatedBy");

    return res.status(200).json(allocations);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/allocations - Allocate an asset
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { asset, assigneeType, assigneeUser, assigneeDepartment, expectedReturnDate } = req.body;

    if (!asset || !assigneeType) {
      return res.status(400).json({ error: "Asset and assigneeType are required." });
    }

    // Check if asset is already allocated
    const activeAlloc = await Allocation.findOne({ asset, status: "Active" })
      .populate("assigneeUser")
      .populate("assigneeDepartment");

    if (activeAlloc) {
      const holderName = activeAlloc.assigneeType === "User" 
        ? (activeAlloc.assigneeUser?.name || "Unknown User")
        : (activeAlloc.assigneeDepartment?.name || "Unknown Department");
      
      return res.status(409).json({
        error: "Conflict",
        message: `Asset is currently held by ${holderName}.`,
        currentHolder: holderName,
        assetId: asset,
      });
    }

    // Allocate
    const allocation = await allocateAsset({
      assetId: asset,
      assigneeType,
      assigneeUser: assigneeType === "User" ? assigneeUser : undefined,
      assigneeDepartment: assigneeType === "Department" ? assigneeDepartment : undefined,
      allocatedBy: req.user._id,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
    });

    return res.status(201).json(allocation);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/allocations/:id/return - Return an asset
router.post("/:id/return", authMiddleware, async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ error: "Allocation record not found" });
    }

    const { returnConditionNotes } = req.body;

    const updatedAlloc = await returnAsset({
      assetId: allocation.asset,
      returnConditionNotes,
    });

    return res.status(200).json(updatedAlloc);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
