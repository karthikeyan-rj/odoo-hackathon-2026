const express = require("express");
const connectDB = require("../server/config/db");

require("../server/models/User");
require("../server/models/Department");
require("../server/models/AssetCategory");
require("../server/models/Asset");
require("../server/models/Allocation");
require("../server/models/TransferRequest");
require("../server/models/Booking");
require("../server/models/MaintenanceRequest");
require("../server/models/Notification");
require("../server/models/AuditCycle");
require("../server/models/AuditItem");
require("../server/models/ActivityLog");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

let isConnected = false;

async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api/auth", require("../server/routes/auth.routes"));
app.use("/api/assets", require("../server/routes/asset.routes"));
app.use("/api/departments", require("../server/routes/department.routes"));
app.use("/api/categories", require("../server/routes/category.routes"));
app.use("/api/users", require("../server/routes/user.routes"));
app.use("/api/allocations", require("../server/routes/allocation.routes"));
app.use("/api/bookings", require("../server/routes/booking.routes"));
app.use("/api/maintenance", require("../server/routes/maintenance.routes"));
app.use("/api/transfers", require("../server/routes/transfer.routes"));
app.use("/api/notifications", require("../server/routes/notification.routes"));
app.use("/api/audits", require("../server/routes/audit.routes"));
app.use("/api/activity-logs", require("../server/routes/activityLog.routes"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "connected" });
});

module.exports = app;
