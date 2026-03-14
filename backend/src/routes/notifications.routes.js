import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import{ authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();


// Get all notifications (with optional ?unreadOnly=true & ?limit=20 & ?skip=0)
router.get('/', authMiddleware, getNotifications);

// Mark single notification as read
router.put('/:notificationId/read', authMiddleware, markNotificationRead);

// Delete single notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

export default router;