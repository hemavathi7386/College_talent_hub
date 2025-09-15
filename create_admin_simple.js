const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Insert admin directly
    const adminData = {
      name: 'System Administrator',
      email: 'admin@cutmap.ac.in',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').insertOne(adminData);
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@cutmap.ac.in');
    console.log('Password: admin123');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin user already exists');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();
