const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ detail: 'No data to update' });
    }

    await User.updateOne({ email: req.user.email }, { $set: updateData });

    const updatedUser = await User.findOne({ email: req.user.email })
      .select('-passwordHash -otp -otpExpiry');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ detail: 'Failed to update profile' });
  }
};

module.exports = { updateProfile };