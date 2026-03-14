import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  type: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'notifications' });

export default mongoose.model('Notification', notificationSchema);