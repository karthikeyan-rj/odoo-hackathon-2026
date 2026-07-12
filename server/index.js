/**
 * AssetFlow — Minimal server entry point.
 *
 * Connects to MongoDB, registers all Mongoose models (so indexes are
 * created), and starts an Express server.  Routes and controllers will
 * be added in later tasks.
 */

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

// Import every model so Mongoose creates the collections and indexes.
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

  const assetRoutes = require("./routes/asset.routes");
  app.use("/api/assets", assetRoutes);

  // Health-check endpoint
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
