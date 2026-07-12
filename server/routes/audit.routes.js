const express = require("express");
const router = express.Router();
const AuditCycle = require("../models/AuditCycle");
const AuditItem = require("../models/AuditItem");
const Asset = require("../models/Asset");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { ROLES } = require('../constants/enums');

// GET /api/audits - List all audit cycles
router.get("/", requireAuth, async (req, res) => {
  try {
    const cycles = await AuditCycle.find()
      .populate("scopeDepartment")
      .populate("auditors")
      .populate("createdBy");
    return res.status(200).json(cycles);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/audits - Create new audit cycle and populate its items
router.post("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.ASSET_MANAGER), async (req, res) => {
  try {
    const { title, scopeDepartment, scopeLocation, startDate, endDate, auditors } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    // Create cycle
    const cycle = new AuditCycle({
      title,
      scopeDepartment: scopeDepartment || null,
      scopeLocation: scopeLocation || "",
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      auditors: auditors || [],
      createdBy: req.user._id,
      status: "Open",
    });
    await cycle.save();

    // Find assets in scope
    const filter = {};
    if (scopeDepartment) filter.department = scopeDepartment;
    if (scopeLocation) filter.location = { $regex: scopeLocation, $options: "i" };

    const assets = await Asset.find(filter);

    // Create audit items
    const items = assets.map(asset => ({
      auditCycle: cycle._id,
      asset: asset._id,
      result: "Pending",
    }));

    if (items.length > 0) {
      await AuditItem.insertMany(items);
    }

    return res.status(201).json({ cycle, itemsCount: items.length });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// GET /api/audits/:id - Get audit cycle details with items
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id)
      .populate("scopeDepartment")
      .populate("auditors")
      .populate("createdBy");

    if (!cycle) {
      return res.status(404).json({ error: "Audit cycle not found." });
    }

    const items = await AuditItem.find({ auditCycle: cycle._id })
      .populate({
        path: "asset",
        populate: { path: "category" }
      })
      .populate("auditor");

    return res.status(200).json({ cycle, items });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/audits/:id/items/:itemId - Mark audit item result
router.put("/:id/items/:itemId", requireAuth, async (req, res) => {
  try {
    const item = await AuditItem.findOne({ _id: req.params.itemId, auditCycle: req.params.id });
    if (!item) {
      return res.status(404).json({ error: "Audit item not found." });
    }

    const { result, notes } = req.body;
    if (result) item.result = result;
    if (notes !== undefined) item.notes = notes;
    item.auditor = req.user._id;
    item.checkedAt = new Date();

    await item.save();
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// PUT /api/audits/:id/close - Close audit cycle and apply asset lifecycle changes
router.put("/:id/close", requireAuth, requireRole(ROLES.ADMIN, ROLES.ASSET_MANAGER), async (req, res) => {
  try {
    const cycle = await AuditCycle.findById(req.params.id);
    if (!cycle) {
      return res.status(404).json({ error: "Audit cycle not found." });
    }

    if (cycle.status === "Closed") {
      return res.status(400).json({ error: "Audit cycle is already closed." });
    }

    cycle.status = "Closed";
    cycle.closedAt = new Date();
    await cycle.save();

    // Get all items in this cycle to update asset statuses
    const items = await AuditItem.find({ auditCycle: cycle._id });
    for (const item of items) {
      let targetStatus;
      if (item.result === "Missing") {
        targetStatus = "Lost";
      } else if (item.result === "Damaged") {
        targetStatus = "UnderMaintenance";
      } else if (item.result === "Verified") {
        targetStatus = "Available";
      }

      if (targetStatus) {
        await Asset.findByIdAndUpdate(item.asset, { status: targetStatus });
      }
    }

    return res.status(200).json(cycle);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

module.exports = router;
