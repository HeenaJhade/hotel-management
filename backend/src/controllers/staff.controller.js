import User from '../models/User.js';

export const getAllGuest = async (req, res) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      search = '' 
    } = req.query;

    page  = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = { role: 'user' };   

    if (search?.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name:  searchRegex },
        { email: searchRegex },
        { phone: searchRegex },  
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash -otp -otpExpiry -__v -createdBy')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages:  Math.ceil(total / limit),
        totalItems:  total,
        limit,
        hasNext:     skip + users.length < total,
        hasPrev:     page > 1,
      },
    });
  } catch (err) {
    console.error('[getAllGuest]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guests',
    });
  }
};
export const deleteUser = async (req, res) => {
  const { guestId } = req.params;

  try {
    const result = await User.deleteOne({
      _id: guestId,
      role: { $ne: 'admin' }
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot be deleted'
      });
    }

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};
// controllers/admin.controller.js
export const toggleUserBlock = async (req, res) => {
  const { guestId } = req.params;
  const { isBlocked } = req.body;

  if (typeof isBlocked !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isBlocked must be boolean'
    });
  }

  try {
    const updateData = {
      isBlocked,
      blockedAt: isBlocked ? new Date() : null,
      blockedBy: isBlocked ? req.user.email : null
    };

    const user = await User.findOneAndUpdate(
      {
        _id: guestId,
        role: { $ne: 'admin' }
      },
      { $set: updateData },
      {
        new: true,
        select: 'email name role isBlocked isVerified blockedAt blockedBy'
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot modify'
      });
    }

    return res.json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });

  } catch (err) {
    console.error('[toggleUserBlock]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};
