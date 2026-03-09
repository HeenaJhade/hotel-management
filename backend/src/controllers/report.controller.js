const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    // Room statistics
    const totalRooms = await Room.countDocuments({});
    const availableRooms = await Room.countDocuments({ status: 'available' });
    const occupiedRooms = await Room.countDocuments({ status: 'occupied' });

    // Booking statistics
    const totalBookings = await Booking.countDocuments({});
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const checkedIn = await Booking.countDocuments({ status: 'checked_in' });
    const checkedOut = await Booking.countDocuments({ status: 'checked_out' });

    // User statistics (guests only)
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Revenue calculation (from completed or in-progress stays)
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['checked_in', 'checked_out'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.json({
      total_rooms: totalRooms,
      available_rooms: availableRooms,
      occupied_rooms: occupiedRooms,
      total_bookings: totalBookings,
      confirmed_bookings: confirmedBookings,
      checked_in: checkedIn,
      checked_out: checkedOut,
      total_users: totalUsers,
      total_revenue: totalRevenue
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ detail: 'Failed to get dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};