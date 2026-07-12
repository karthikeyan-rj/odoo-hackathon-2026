require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../config/db");

const User = require("../models/User");
const Department = require("../models/Department");
const AssetCategory = require("../models/AssetCategory");
const Asset = require("../models/Asset");

const SALT_ROUNDS = 10;

async function seed() {
  await connectDB();
  console.log("Seeding database…\n");

  const adminEmail =
    process.env.SEED_ADMIN_EMAIL || "admin@assetflow.local";
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD || "change_this_password";

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      $setOnInsert: {
        name: "System Admin",
        email: adminEmail,
        passwordHash,
        role: "Admin",
        status: "Active",
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Admin  → ${admin.email} (${admin._id})`);

  const itDept = await Department.findOneAndUpdate(
    { name: "IT" },
    {
      $setOnInsert: {
        name: "IT",
        status: "Active",
      },
    },
    { upsert: true, new: true }
  );

  const hrDept = await Department.findOneAndUpdate(
    { name: "Human Resources" },
    {
      $setOnInsert: {
        name: "Human Resources",
        status: "Active",
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Dept   → ${itDept.name} (${itDept._id})`);
  console.log(`Dept   → ${hrDept.name} (${hrDept._id})`);

  const laptopCat = await AssetCategory.findOneAndUpdate(
    { name: "Laptop" },
    {
      $setOnInsert: {
        name: "Laptop",
        status: "Active",
        customFields: [
          { key: "ram", label: "RAM (GB)", type: "number", required: false },
          { key: "storage", label: "Storage (GB)", type: "number", required: false },
        ],
      },
    },
    { upsert: true, new: true }
  );

  const projectorCat = await AssetCategory.findOneAndUpdate(
    { name: "Projector" },
    {
      $setOnInsert: {
        name: "Projector",
        status: "Active",
        customFields: [
          { key: "resolution", label: "Resolution", type: "text", required: false },
        ],
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Cat    → ${laptopCat.name} (${laptopCat._id})`);
  console.log(`Cat    → ${projectorCat.name} (${projectorCat._id})`);

  const laptop = await Asset.findOneAndUpdate(
    { assetTag: "AF-0001" },
    {
      $setOnInsert: {
        name: "Dell Latitude 5540",
        category: laptopCat._id,
        assetTag: "AF-0001",
        serialNumber: "DL5540-X9K2",
        condition: "New",
        location: "IT Store Room",
        homeDepartment: itDept._id,
        isBookable: false,
        status: "Available",
      },
    },
    { upsert: true, new: true }
  );

  const projector = await Asset.findOneAndUpdate(
    { assetTag: "AF-0002" },
    {
      $setOnInsert: {
        name: "Epson EB-X51",
        category: projectorCat._id,
        assetTag: "AF-0002",
        condition: "Good",
        location: "Conference Room A",
        homeDepartment: hrDept._id,
        isBookable: true,
        status: "Available",
      },
    },
    { upsert: true, new: true }
  );

  console.log(`Asset  → ${laptop.name} [${laptop.assetTag}]`);
  console.log(`Asset  → ${projector.name} [${projector.assetTag}]`);

  console.log("\nSeed complete ✓");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    mongoose.connection.close();
  });
