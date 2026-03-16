import express from 'express';
import Booking from "../models/Booking.js";
import {
  getBookings,
  getBookingById,
  cancelBooking,
  getUserBookings,
  getDashboardStats,
  checkIn,
  checkOut,
  createBookingAfterPayment,
} from '../controllers/booking.controller.js';

import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, requireStaffOrAdmin, getDashboardStats);
router.get('/userbooking', authMiddleware, getUserBookings);
router.post("/create-after-payment",authMiddleware, createBookingAfterPayment);
router.get('/', authMiddleware, getBookings);
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

export default router;