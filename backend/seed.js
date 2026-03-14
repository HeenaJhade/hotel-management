import 'dotenv/config';
import User from './src/models/User';
import { hashPassword } from './src/middleware/auth.middleware';
import connectDB from './src/config/db';

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