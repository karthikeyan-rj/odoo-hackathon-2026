
require("dotenv").config();
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

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", db: "connected" });
  });

  app.listen(PORT, () => {
    console.log(`AssetFlow server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
