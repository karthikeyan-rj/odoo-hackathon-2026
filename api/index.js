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

app.use("/auth", require("./routes/auth.routes"));
app.use("/assets", require("./routes/asset.routes"));
app.use("/departments", require("./routes/department.routes"));
app.use("/categories", require("./routes/category.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/allocations", require("./routes/allocation.routes"));
app.use("/bookings", require("./routes/booking.routes"));
app.use("/maintenance", require("./routes/maintenance.routes"));
app.use("/transfers", require("./routes/transfer.routes"));
app.use("/notifications", require("./routes/notification.routes"));
app.use("/audits", require("./routes/audit.routes"));
app.use("/activity-logs", require("./routes/activityLog.routes"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", db: "connected" });
});

module.exports = app;
