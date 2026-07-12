/**
 * Verification script — tests the database foundation.
 *
 * Checks:
 *  1. MongoDB connection
 *  2. Seed script ran correctly
 *  3. Indexes exist
 *  4. Duplicate email is rejected
 *  5. Duplicate assetTag is rejected
 *  6. Two Active allocations for the same asset are rejected
 *  7. Cancelled booking does not block a new booking
 *  8. Overlapping active booking is rejected by bookingService
 *  9. Allocation service works
 * 10. Maintenance service works
 *
 * Usage:
 *   node scripts/verify.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Department = require("../models/Department");
const AssetCategory = require("../models/AssetCategory");
const Asset = require("../models/Asset");
const Allocation = require("../models/Allocation");
const Booking = require("../models/Booking");
const MaintenanceRequest = require("../models/MaintenanceRequest");

const { allocateAsset, returnAsset } = require("../services/allocationService");
const { checkBookingOverlap, createBooking } = require("../services/bookingService");
const { updateMaintenanceStatus } = require("../services/maintenanceService");

let passed = 0;
let failed = 0;

function ok(label) {
  passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

async function run() {
  await connectDB();
  console.log("\n── Verification ────────────────────────────\n");

  // 1. DB connection
  if (mongoose.connection.readyState === 1) {
    ok("MongoDB connected");
  } else {
    fail("MongoDB connected", "readyState=" + mongoose.connection.readyState);
  }

  // 2. Seed data present
  const admin = await User.findOne({ role: "Admin" });
  admin ? ok("Admin user exists") : fail("Admin user exists", "not found");

  const depts = await Department.countDocuments();
  depts >= 2
    ? ok(`Departments seeded (${depts})`)
    : fail("Departments seeded", `only ${depts}`);

  const cats = await AssetCategory.countDocuments();
  cats >= 2
    ? ok(`Asset categories seeded (${cats})`)
    : fail("Asset categories seeded", `only ${cats}`);

  const assets = await Asset.countDocuments();
  assets >= 2
    ? ok(`Assets seeded (${assets})`)
    : fail("Assets seeded", `only ${assets}`);

  // 3. Check indexes
  const userIndexes = await User.collection.indexes();
  const emailIdx = userIndexes.find((i) => i.key && i.key.email === 1 && i.unique);
  emailIdx ? ok("Unique email index exists") : fail("Unique email index", "not found");

  const assetIndexes = await Asset.collection.indexes();
  const tagIdx = assetIndexes.find((i) => i.key && i.key.assetTag === 1 && i.unique);
  tagIdx ? ok("Unique assetTag index exists") : fail("Unique assetTag index", "not found");

  const allocIndexes = await Allocation.collection.indexes();
  const activeIdx = allocIndexes.find(
    (i) =>
      i.key &&
      i.key.asset === 1 &&
      i.unique &&
      i.partialFilterExpression &&
      i.partialFilterExpression.status === "Active"
  );
  activeIdx
    ? ok("Partial unique active allocation index exists")
    : fail("Partial unique active allocation index", "not found");

  // 4. Duplicate email rejected
  try {
    await User.create({
      name: "Duplicate",
      email: admin.email,
      passwordHash: "x",
    });
    fail("Duplicate email rejected", "insert succeeded");
  } catch (err) {
    err.code === 11000
      ? ok("Duplicate email rejected")
      : fail("Duplicate email rejected", err.message);
  }

  // 5. Duplicate assetTag rejected
  const existingAsset = await Asset.findOne();
  try {
    await Asset.create({
      name: "Dup Tag Asset",
      category: existingAsset.category,
      assetTag: existingAsset.assetTag,
    });
    fail("Duplicate assetTag rejected", "insert succeeded");
  } catch (err) {
    err.code === 11000
      ? ok("Duplicate assetTag rejected")
      : fail("Duplicate assetTag rejected", err.message);
  }

  // 6. Two Active allocations for the same asset rejected
  // First clean up any existing allocations from previous test runs
  await Allocation.deleteMany({ asset: existingAsset._id });
  await Asset.findByIdAndUpdate(existingAsset._id, { status: "Available" });

  const alloc1 = await allocateAsset({
    assetId: existingAsset._id,
    assigneeType: "User",
    assigneeUser: admin._id,
    allocatedBy: admin._id,
  });
  ok("First allocation created");

  try {
    await Allocation.create({
      asset: existingAsset._id,
      assigneeType: "User",
      assigneeUser: admin._id,
      allocatedBy: admin._id,
      status: "Active",
    });
    fail("Second Active allocation rejected", "insert succeeded");
  } catch (err) {
    err.code === 11000 || err.message.includes("already has an active")
      ? ok("Second Active allocation rejected (index enforced)")
      : fail("Second Active allocation rejected", err.message);
  }

  // Return the asset so we can continue testing
  await returnAsset({ assetId: existingAsset._id });
  ok("returnAsset service works");

  // 7. Cancelled booking does not block a new booking
  const bookableAsset = await Asset.findOne({ isBookable: true });

  if (bookableAsset) {
    // Clean up bookings from previous test runs
    await Booking.deleteMany({ resource: bookableAsset._id });

    const start1 = new Date("2026-08-01T09:00:00Z");
    const end1 = new Date("2026-08-01T11:00:00Z");

    // Create a booking and cancel it
    const cancelledBooking = await Booking.create({
      resource: bookableAsset._id,
      requestedBy: admin._id,
      startTime: start1,
      endTime: end1,
      status: "Cancelled",
    });

    // Try to create a new booking in the same slot
    const newBooking = await createBooking({
      resourceId: bookableAsset._id,
      requestedBy: admin._id,
      startTime: start1,
      endTime: end1,
    });
    ok("Cancelled booking does not block new booking");

    // 8. Overlapping active booking is rejected
    try {
      await createBooking({
        resourceId: bookableAsset._id,
        requestedBy: admin._id,
        startTime: new Date("2026-08-01T10:00:00Z"),
        endTime: new Date("2026-08-01T12:00:00Z"),
      });
      fail("Overlapping booking rejected", "insert succeeded");
    } catch (err) {
      err.message.includes("overlap")
        ? ok("Overlapping booking rejected by service")
        : fail("Overlapping booking rejected", err.message);
    }

    // 8b. Back-to-back booking is allowed
    const backToBack = await createBooking({
      resourceId: bookableAsset._id,
      requestedBy: admin._id,
      startTime: end1,
      endTime: new Date("2026-08-01T13:00:00Z"),
    });
    ok("Back-to-back booking allowed (starts when another ends)");

    // Cleanup test bookings
    await Booking.deleteMany({ resource: bookableAsset._id });
  } else {
    fail("Booking tests", "no bookable asset found");
  }

  // 9. Maintenance service
  const mReq = await MaintenanceRequest.create({
    asset: existingAsset._id,
    raisedBy: admin._id,
    description: "Test maintenance",
    priority: "High",
  });

  await updateMaintenanceStatus({
    requestId: mReq._id,
    newStatus: "Approved",
    approvedBy: admin._id,
  });

  let assetAfterApprove = await Asset.findById(existingAsset._id);
  assetAfterApprove.status === "UnderMaintenance"
    ? ok("Maintenance approval → Asset UnderMaintenance")
    : fail("Maintenance approval", `status=${assetAfterApprove.status}`);

  await updateMaintenanceStatus({
    requestId: mReq._id,
    newStatus: "Resolved",
  });

  let assetAfterResolve = await Asset.findById(existingAsset._id);
  assetAfterResolve.status === "Available"
    ? ok("Maintenance resolved → Asset Available")
    : fail("Maintenance resolved", `status=${assetAfterResolve.status}`);

  // Cleanup test maintenance
  await MaintenanceRequest.findByIdAndDelete(mReq._id);

  // Summary
  console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run()
  .catch((err) => {
    console.error("Verification crashed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    mongoose.connection.close();
  });
