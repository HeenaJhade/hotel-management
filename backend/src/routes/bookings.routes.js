const express = require('express');
const router = express.Router();
const Booking = require("../models/Booking");
const {
  getBookings,
  getBookingById,
  cancelBooking,
  getUserBookings,
  getDashboardStats,
  checkIn,
  checkOut,
  createBooking,
} = require('../controllers/booking.controller');

const { authMiddleware, requireStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/stats', authMiddleware, requireStaffOrAdmin, getDashboardStats); 

router.get('/userbooking', authMiddleware, getUserBookings);

router.get('/', authMiddleware, getBookings);
router.get('/create', authMiddleware, createBooking);

router.get('/:bookingId', authMiddleware, getBookingById); 

router.patch('/:bookingId/check-in', authMiddleware, checkIn);

router.patch('/:bookingId/check-out', authMiddleware, checkOut);

router.delete('/:bookingId', authMiddleware, cancelBooking);

router.get("/by-payment/:paymentIntentId", async (req, res) => {
  try {
    console.log("pahmentid came...");
    const booking = await Booking.findOne({
      paymentIntentId: req.params.paymentIntentId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found yet",
      });
    }

    res.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;