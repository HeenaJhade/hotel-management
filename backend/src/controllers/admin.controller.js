import User from '../models/User.js';
import{ hashPassword} from '../middleware/auth.middleware.js'; // or from auth service
import { validationResult } from 'express-validator';

export const createStaff = async (req, res) => {
  const errors = validationResult(req);
  const { name, email, password, phone_number, role } = req.body;

    if (!email || !password || !name || !phone_number) {
      return res.status(400).json({ detail: "All fields are required" });
    }
  if (!errors.isEmpty()) {
    return res.status(400).json({ detail: 'Invalid input data' });
  }

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);

    const staff = new User({
      id: email,
      name,
      email,
      passwordHash,
      phone:phone_number,
      role: 'staff',
      isVerified: true,
      createdBy: req.user.email
    });

    await staff.save();

    res.json({ message: 'Staff account created. OTP sent for verification.', email });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
  detail: "Failed to create room",
  error: error.message
});
  }
};

export  const getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', role } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = { role: { $in: [ 'staff'] } };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (role && ['user', 'staff'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-passwordHash -otp -otpExpiry -__v -createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('[getAllUsers]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};


export  const deleteUser = async (req, res) => {
  const { userEmail } = req.params;

  try {
    const result = await User.deleteOne({
      email: userEmail,
      role: { $ne: 'admin' }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ detail: 'User not found or cannot be deleted' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ detail: 'Failed to delete user' });
  }
};
// controllers/admin.controller.js
export  const toggleUserBlock = async (req, res) => {
  const { userEmail } = req.params;
  const { isBlocked } = req.body;

  if (typeof isBlocked !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isBlocked must be boolean' });
  }

  try {
    const updateData = {
      isBlocked,
    };

    if (isBlocked) {
      updateData.blockedAt = new Date();
      updateData.blockedBy = req.user.email;   // ← current admin who is blocking
    } else {
      updateData.blockedAt = null;
      updateData.blockedBy = null;             // or keep last blocker for history
    }

    const user = await User.findOneAndUpdate(
      {
        email: userEmail,
        role: { $ne: 'admin' }
      },
      { $set: updateData },
      { new: true, select: 'email name role isBlocked isVerified blockedAt blockedBy' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot modify (admin protected)'
      });
    }

    return res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });
  } catch (err) {
    console.error('[toggleUserBlock]', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};
