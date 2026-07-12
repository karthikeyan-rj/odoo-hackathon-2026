require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const resetPasswords = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow');
    
    console.log('Fetching all users...');
    const users = await User.find({});
    
    console.log(`Found ${users.length} users. Resetting passwords to "password123"...`);
    
    for (const user of users) {
      user.password = 'password123';
      await user.save();
    }
    
    console.log('✅ All passwords successfully reset to "password123"!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
    process.exit(1);
  }
};

resetPasswords();
