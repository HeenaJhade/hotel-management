import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {

    // ─────────────────────────────
    // ROOM STATS
    // ─────────────────────────────
    const occupied = await Room.countDocuments({ status: "occupied" });
    const available = await Room.countDocuments({ status: "available" });
    const reserved = await Room.countDocuments({ status: "reserved" });
    const notReady = await Room.countDocuments({ status: "not_ready" });

    const totalRooms = occupied + available + reserved + notReady;

    const occupancyRate = totalRooms
      ? Math.round((occupied / totalRooms) * 100)
      : 0;

    // ─────────────────────────────
    // BOOKING STATS
    // ─────────────────────────────
    const totalBookings = await Booking.countDocuments({});

    const checkIns = await Booking.countDocuments({ status: "checked_in" });

    const checkOuts = await Booking.countDocuments({ status: "checked_out" });

    // ─────────────────────────────
    // REVENUE
    // ─────────────────────────────
    const revenueResult = await Booking.aggregate([
      {
        $match: { status: { $in: ["checked_in", "checked_out"] } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // ─────────────────────────────
    // REVENUE TREND (MONTHLY)
    // ─────────────────────────────
    const revenueData = await Booking.aggregate([
  {
    $group: {
      _id: { $month: "$createdAt" },
      revenue: { $sum: "$totalAmount" }
    }
  }
]);

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const formattedRevenue = months.map((month, index) => {
  const found = revenueData.find(r => r._id === index + 1);
  return {
    month,
    revenue: found ? found.revenue : 0
  };
});

    // ─────────────────────────────
    // BOOKING TREND
    // ─────────────────────────────
    const bookingTrends = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const formattedBookings = bookingTrends.map(b => ({
      month: months[b._id - 1],
      bookings: b.bookings
    }));


    // ─────────────────────────────
    // TODAY CHECK INS
    // ─────────────────────────────
    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayCheckIns = await Booking.find({
  checkIn: { $gte: today, $lt: tomorrow }
});

    const todayCheckOuts = await Booking.find({
  checkOut: { $gte: today, $lt: tomorrow }
});

    // ─────────────────────────────
    // RECENT BOOKINGS
    // ─────────────────────────────
    const recentBookings = await Booking
  .find()
  .sort({ createdAt: -1 })
  .limit(5);

    // ─────────────────────────────
    // RESPONSE
    // ─────────────────────────────
    res.json({
      stats: {
        totalBookings,
        checkIns,
        checkOuts,
        totalRevenue,
        occupancyRate,
        occupied,
        reserved,
        available,
        notReady,

        // fake changes for now
        newBookingsChange: 5.2,
        checkInsChange: 2.3,
        checkOutsChange: -1.2,
        revenueChange: 4.5,
        occupancyChange: 3.1,

        overallRating: 4.6,
        ratingCounts: {
          facilities: 4.4,
          cleanliness: 4.7,
          services: 4.6,
          comfort: 4.8,
          location: 4.5
        }
      },

      revenueTrends: formattedRevenue,
      bookingTrends: formattedBookings,
      todayCheckIns,
      todayCheckOuts,
      recentBookings
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Dashboard failed" });
  }
};