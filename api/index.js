const express = require("express");
const connectDB = require("./config/db");

require("./models/User");
require("./models/Department");
require("./models/AssetCategory");
require("./models/Asset");
require("./models/Allocation");
require("./models/TransferRequest");
require("./models/Booking");
require("./models/MaintenanceRequest");
require("./models/Notification");
require("./models/AuditCycle");
require("./models/AuditItem");
require("./models/ActivityLog");

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

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/assets", require("./routes/asset.routes"));
app.use("/api/departments", require("./routes/department.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/allocations", require("./routes/allocation.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/maintenance", require("./routes/maintenance.routes"));
app.use("/api/transfers", require("./routes/transfer.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/audits", require("./routes/audit.routes"));
app.use("/api/activity-logs", require("./routes/activityLog.routes"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", db: "connected" });
});

module.exports = app;
