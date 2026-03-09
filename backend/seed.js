require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { hashPassword } = require('./src/middleware/auth.middleware');
const connectDB = require('./src/config/db');

const seedAdmin = async () => {
  await connectDB();  // only this

  const exists = await User.findOne({ email: 'admin@hotel.com' });

  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const passwordHash = await hashPassword("Admin@123#Admin");

  await User.create({
    name: "Admin User",
    email: "admin@hotel.com",
    passwordHash,
    phone: "+916261295530",
    role: "admin",
    isVerified: true
  });

  console.log("Admin created successfully");
  process.exit();
};

seedAdmin();