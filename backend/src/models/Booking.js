const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: String,
  paymentIntentId: { type: String, unique: true },
  bookingId: { type: String, unique: true },
  userId: String,
  userEmail: String,
  userName: String,
  roomId: String,
  roomNumber: String,
  roomType: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  nights: Number,
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  specialRequests: String,
  checkedInAt: Date,
  checkedOutAt: Date,
  cancelledAt: { type: Date },
  cancelledBy: { type: String, enum: ['user', 'staff', 'admin'] },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'bookings' });

module.exports = mongoose.model('Booking', bookingSchema);