const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const { getUserFromToken } = require('../utils/helpers');
const { sendBookingConfirmationEmail,sendBookingCancellationEmail } = require('../services/email.service');

const createBooking = async (req, res) => {
  const { roomId, checkIn, checkOut, guests, specialRequests = "" } = req.body;

  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ detail: "Authentication required" });
    }

    // Find the room by _id (assuming roomId is MongoDB _id)
    const room = await Room.findById(roomId);
    console.log("User:", user, "Room:", room);

    if (!room) {
      return res.status(404).json({ detail: 'Room not found' });
    }

    // Validate dates
    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ detail: "Invalid date format" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ detail: "Check-out must be after check-in" });
    }

    // Check for overlapping bookings for this specific room
    const overlapping = await Booking.findOne({
      roomId: room._id,
      $or: [
        // Any booking that starts before requested check-out AND ends after requested check-in
        { checkIn: { $lt: checkOutDate }, checkOut: { $gte: checkInDate } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        detail: "Room is already booked for the selected dates",
        conflictingBookingId: overlapping.bookingId,
      });
    }

    // Calculate nights and total
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price * nights;

    const bookingId = `BK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;

    const booking = new Booking({
      bookingId,
      paymentIntentId: req.body.paymentIntentId || null,
      userId:      user.id,
      userEmail:   user.email,
      userName:    user.name,
      roomId:      room._id,           // store ObjectId
      roomNumber:  room.roomNumber,
      roomType:    room.roomType,
      checkIn:     checkInDate,
      checkOut:    checkOutDate,
      guests:      Number(guests),
      nights,
      totalAmount,
      status:      'confirmed',
      paymentStatus: 'paid',        // or 'paid' if mock payment succeeds
      specialRequests,
    });
    
    await booking.save();
    // Create notification
    const notification = new Notification({
      id: `NT${Date.now()}`,
      userId: user.id,
      message: `Booking confirmed for ${room.roomType} - Room ${room.roomNumber}`,
      type: 'booking',
      isRead: false,
    });
await notification.save();

//After saving notification
await notification.save();

//Emit real-time event
const io = req.app.get('io'); // or your io instance
io.to(`user_${user.id}`).emit('newNotification', {
  _id: notification._id,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  createdAt: notification.createdAt
});

console.log(`Emitted newNotification to user_${user.id}`);

    // Send email (with error handling)
    try {
      await sendBookingConfirmationEmail(user.email, {
        guestName: user.name,
        bookingId,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount,
      });
    } catch (emailErr) {
      console.error('Booking email failed:', emailErr);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ detail: 'Failed to create booking' });
  }
};

// src/controllers/booking.controller.js

const getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Users can only see their own bookings
    if (req.user.role === 'user') {
      const user = await getUserFromToken(req);
      query.userId = user.id;
    }

    // Get total count for pagination info
    const totalBookings = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })           // newest first
      .skip(skip)
      .limit(limit)
      .lean();                           // faster, plain JS objects

    res.json({
      bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        hasNext: page * limit < totalBookings,
        hasPrev: page > 1,
        limit,
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ detail: 'Failed to get bookings' });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    console.log(user);
    if (!user) return res.status(401).json({ detail: "Please login" });

    const bookings = await Booking.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();
    console.log({bookings});
    res.json({ bookings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: "Server error" });
  }
};
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });

    if (req.user.role === 'user' && booking.userEmail !== req.user.email) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ detail: 'Failed to get booking' });
  }
};

const checkIn = async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ detail: 'Booking cannot be checked in' });
    }

    booking.status = 'checked_in';
    booking.checkedInAt = new Date();
    await booking.save();

    await Room.updateOne(
      { _id: booking.roomId },
      { $set: { status: 'occupied' } }
    );

    // ✅ CREATE NOTIFICATION
    const notification = new Notification({
      id: `NT${Date.now()}`,
      userId: booking.userId,
      message: `You have successfully checked in to Room ${booking.roomNumber}. Enjoy your stay!`,
      type: 'check_in',
      isRead: false,
      metadata: { bookingId: booking.bookingId }
    });

    await notification.save();

    // ✅ Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('newNotification', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    }

    res.json({ message: 'Check-in successful' });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ detail: 'Check-in failed' });
  }
};

const checkOut = async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ detail: 'Booking not found' });

    if (booking.status !== 'checked_in') {
      return res.status(400).json({ detail: 'Guest must be checked in first' });
    }

    booking.status = 'checked_out';
    booking.paymentStatus = 'completed';
    booking.checkedOutAt = new Date();
    await booking.save();

    await Room.updateOne(
      { _id: booking.roomId },
      { $set: { status: 'available' } }
    );

    // ✅ CREATE NOTIFICATION
    const notification = new Notification({
      id: `NT${Date.now()}`,
      userId: booking.userId,
      message: `You have successfully checked out from Room ${booking.roomNumber}. Thank you for staying with us!`,
      type: 'check_out',
      isRead: false,
      metadata: { bookingId: booking.bookingId }
    });

    await notification.save();

    // ✅ Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('newNotification', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    }

    res.json({ message: 'Check-out successful' });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ detail: 'Check-out failed' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

// UTC start of today
const todayUTC = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate()
));

// UTC start of tomorrow
const tomorrowUTC = new Date(todayUTC);
tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

console.log("Today UTC:", todayUTC);
console.log("Tomorrow UTC:", tomorrowUTC);

    const totalRooms = await Room.countDocuments();

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked_in'] } });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Today's check-ins
    const todayCheckIns = await Booking.find({
      checkIn: { $gte: todayUTC, $lt: tomorrowUTC },
      status: 'confirmed',
    })
      .populate('userId', 'name')          // ← changed from guestId → userId
      .populate('roomId', 'roomNumber')
      .select('userId roomId userName roomNumber status bookingId')  // removed guestId
      .lean();

    // Today's check-outs
    const todayCheckOuts = await Booking.find({
      checkOut: { $gte: todayUTC, $lt: tomorrowUTC },
      status: 'checked_in',
    })
      .populate('userId', 'name')          // ← changed from guestId → userId
      .populate('roomId', 'roomNumber')
      .select('userId roomId userName roomNumber status bookingId')
      .lean();

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('bookingId userName roomNumber checkIn totalAmount status')
      .lean();

    const occupiedRooms = await Booking.countDocuments({
  status: 'checked_in',
  checkIn: { $lte: todayUTC },
  checkOut: { $gt: todayUTC },
});
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      stats: {
        totalRooms,
        totalBookings,
        totalRevenue,
        activeBookings,
        cancelledBookings,
        occupancyRate,
      },
      todayCheckIns,
      todayCheckOuts,
      recentBookings,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ detail: 'Failed to load dashboard data' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ detail: 'Booking not found' });
    }

    if (req.user.role === 'user' && booking.userEmail !== req.user.email) {
      return res.status(403).json({ detail: 'Access denied' });
    }

    if (['checked_in', 'checked_out'].includes(booking.status)) {
      return res.status(400).json({ detail: 'Cannot cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ detail: 'Booking is already cancelled' });
    }

    // Perform cancellation
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = req.user.role;

    await booking.save();

    // Free room
    await Room.updateOne(
      { _id: booking.roomId },
      { $set: { status: 'available' } }
    );

    // Notification
    const notification = new Notification({
      id: `NT${Date.now()}`,
      userId: booking.userId,
      message: `Your booking ${booking.bookingId} has been cancelled. Refund (if applicable) will be processed shortly.`,
      type: 'booking_cancelled',
      isRead: false,
      metadata: { bookingId: booking.bookingId },
    });
    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.userId}`).emit('newNotification', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    }

    // Send cancellation email with refund info
    try {
      await sendBookingCancellationEmail(booking.userEmail, {
        guestName: booking.userName,
        bookingId: booking.bookingId,
        roomType: booking.roomType,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        // Pass totalAmount if you want to show refund amount in email
        totalAmount: booking.totalAmount,
      });
    } catch (emailErr) {
      console.error('Cancellation email failed:', emailErr);
    }

    // Response includes refund reassurance
    res.json({ 
      message: 'Booking cancelled successfully. Your refund  will be processed and reflected in your account within 12 hours to 7 business days, depending on your payment method and bank.',
      booking 
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ detail: 'Failed to cancel booking' });
  }
};


module.exports = {
  getUserBookings,
  getBookings,
  getBookingById,
  getDashboardStats,
  checkIn,
  checkOut,
  createBooking,
  cancelBooking
};