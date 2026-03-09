const User = require('../models/User');

const getUserFromToken = async (req) => {
  console.log("und",req);
  const user = await User.findOne({ email: req.user.email })
    .select('-passwordHash -otp -otpExpiry');
  if (!user) throw new Error('User not found');
  console.log(user);
  return user;
};

module.exports = { getUserFromToken };