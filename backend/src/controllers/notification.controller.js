import Notification from '../models/Notification.js';
import { getUserFromToken } from '../utils/helpers.js';

export const getNotifications = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ detail: 'Authentication required' });
    }

    const { limit = 50, skip = 0, unreadOnly = 'false' } = req.query;

    const query = { userId: user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    const total = await Notification.countDocuments({ userId: user.id });
    const unreadCount = await Notification.countDocuments({
      userId: user.id,
      isRead: false,
    });
    res.json({
      notifications,
      pagination: {
        total,
        unreadCount,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ detail: 'Failed to get notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ detail: 'Unauthorized' });

    const notificationId = req.params.notificationId;
    console.log("markread called", notificationId);

    const updated = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user.id },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        detail: 'Notification not found or not owned by you' 
      });
    }

    // ────────────────────────────────────────────────
    // ADD THIS: Emit real-time update to the user's room
    // ────────────────────────────────────────────────
    const io = req.app.get('io');
    io.to(`user_${user.id}`).emit('notificationUpdated', {
      _id: notificationId,
      isRead: true,
      readAt: new Date()
    });

    console.log(`Emitted notificationUpdated for ${notificationId} to user_${user.id}`);

    res.json({ 
      message: 'Notification marked as read',
      notification: updated 
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ detail: 'Failed to mark notification as read' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ detail: 'Authentication required' });
    }
     console.log("deletenotificatincalled",req.params.notificationId);
    const result = await Notification.deleteOne({
      _id: req.params.notificationId,
      userId: user.id,
    });
   
    if (result.deletedCount === 0) {
      return res.status(404).json({
        detail: 'Notification not found or does not belong to you',
      });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ detail: 'Failed to delete notification' });
  }
};

