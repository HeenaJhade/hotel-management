import express from 'express';
const router = express.Router();
import {
  deleteUser,
  toggleUserBlock,
  getAllGuest,
} from '../controllers/staff.controller.js';
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth.middleware.js';

// Get all guests
router.get(
  '/guest',
  authMiddleware,
  requireStaffOrAdmin,
  getAllGuest
);

// Block / Unblock guest
router.patch(
  '/guest/:guestId/block',
  authMiddleware,
  requireStaffOrAdmin,
  toggleUserBlock   // ✅ FIXED HERE
);

// Delete guest
router.delete(
  '/guest/:guestId',
  authMiddleware,
  requireStaffOrAdmin,
  deleteUser
);


export default router;