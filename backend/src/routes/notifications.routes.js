const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} = require('../controllers/notification.controller');

const { authMiddleware } = require('../middleware/auth.middleware');

// Get all notifications (with optional ?unreadOnly=true & ?limit=20 & ?skip=0)
router.get('/', authMiddleware, getNotifications);

// Mark single notification as read
router.put('/:notificationId/read', authMiddleware, markNotificationRead);

// Delete single notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

module.exports = router;