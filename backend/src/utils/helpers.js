import User from '../models/User.js';

export const getUserFromToken = async (req) => {
  const user = await User.findOne({ email: req.user.email })
    .select('-passwordHash -otp -otpExpiry');
  if (!user) throw new Error('User not found');
  return user;
};
