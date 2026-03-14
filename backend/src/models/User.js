import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  phone: String,
  role: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  createdBy: String,
  isBlocked:{type: Boolean, default: false},
  blockedAt: {
    type: Date,
    default: null
  },
  blockedBy: {
    type: String,            // admin email who blocked
    default: null
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

export default mongoose.model('User', userSchema);