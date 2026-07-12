const mongoose = require("mongoose");

/**
 * Connect to MongoDB.
 * Re-uses the existing connection when called more than once.
 */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/assetflow";

  await mongoose.connect(uri);
  console.log(`MongoDB connected → ${mongoose.connection.name}`);
  return mongoose.connection;
}

module.exports = connectDB;
