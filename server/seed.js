/**
 * seed.js — Bootstrap script to promote a user to Admin in the database.
 * Run once: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const email = process.argv[2] || 'admin@test.com';
  const role = process.argv[3] || 'Admin';

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role } },
    { new: true }
  );

  if (user) {
    console.log(`✅ User ${user.name} (${user.email}) promoted to ${user.role}`);
  } else {
    console.log(`❌ No user found with email: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
})();
