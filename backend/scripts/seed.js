// Script to create a default admin user for testing
// Run with: node scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai_solutions_db');
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@ai-solutions.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create default admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const admin = new Admin({
      name: 'Admin User',
      email: 'admin@ai-solutions.com',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('✅ Default admin created');
    console.log('Email: admin@ai-solutions.com');
    console.log('Password: Admin@123');
    console.log('⚠️  CHANGE THIS PASSWORD IN PRODUCTION');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
