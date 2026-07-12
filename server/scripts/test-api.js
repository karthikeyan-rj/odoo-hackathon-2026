require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

// Register all models first to prevent population schema errors
require("../models/User");
require("../models/Department");
require("../models/AssetCategory");
const Asset = require("../models/Asset");
const AssetCategory = require("../models/AssetCategory");

// Mock Express request/response helpers
function makeMockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

async function test() {
  await connectDB();
  console.log("Connected to DB for testing.");

  // Clean up any old test assets
  await Asset.deleteMany({ assetTag: "AF-TEST-001" });

  const laptopCat = await AssetCategory.findOne({ name: "Laptop" });
  if (!laptopCat) {
    throw new Error("Laptop category not found. Run seed script first!");
  }

  // Load the route handler
  const router = require("../routes/asset.routes");
  
  // Find the POST handler and GET handler
  const postHandler = router.stack.find(s => s.route.path === "/" && s.route.methods.post).route.stack[0].handle;
  const getHandler = router.stack.find(s => s.route.path === "/" && s.route.methods.get).route.stack[0].handle;

  // Test 1: Register asset successfully
  console.log("1. Testing asset registration (POST /api/assets)...");
  const req1 = {
    body: {
      name: "MacBook Pro 16",
      assetTag: "AF-TEST-001",
      category: laptopCat._id.toString(),
      serialNumber: "SN-MBP16-TEST",
      location: "IT Office",
    },
  };
  const res1 = makeMockResponse();

  await postHandler(req1, res1);

  if (res1.statusCode === 201 && res1.body.assetTag === "AF-TEST-001") {
    console.log("  ✓ Asset registered successfully");
  } else {
    console.error("  ✗ Asset registration failed", res1.statusCode, res1.body);
    process.exitCode = 1;
    return;
  }

  // Test 2: Reject duplicate assetTag
  console.log("2. Testing duplicate assetTag rejection...");
  const req2 = {
    body: {
      name: "Another MacBook",
      assetTag: "AF-TEST-001",
      category: laptopCat._id.toString(),
    },
  };
  const res2 = makeMockResponse();

  await postHandler(req2, res2);

  if (res2.statusCode === 400 && res2.body.error.includes("already exists")) {
    console.log("  ✓ Duplicate assetTag rejected correctly");
  } else {
    console.error("  ✗ Duplicate assetTag test failed", res2.statusCode, res2.body);
    process.exitCode = 1;
    return;
  }

  // Test 3: GET /api/assets with filter
  console.log("3. Testing GET /api/assets...");
  const req3 = {
    query: { search: "MacBook" },
  };
  const res3 = makeMockResponse();

  await getHandler(req3, res3);

  if (res3.statusCode === 200 && res3.body.length > 0 && res3.body[0].assetTag === "AF-TEST-001") {
    console.log("  ✓ GET assets with search and population works");
  } else {
    console.error("  ✗ GET assets check failed", res3.statusCode, res3.body);
    process.exitCode = 1;
    return;
  }

  // Clean up
  await Asset.deleteMany({ assetTag: "AF-TEST-001" });
  console.log("\nAll Asset Registration tests passed successfully!");
}

test()
  .catch((err) => {
    console.error("Test execution crashed:", err);
    process.exitCode = 1;
  })
  .finally(() => {
    mongoose.connection.close();
  });
