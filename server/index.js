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

  // CORS Middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount API Routes
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
