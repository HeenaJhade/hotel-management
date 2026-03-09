const express = require('express');
const router = express.Router();

const {
  deleteUser,
  toggleUserBlock,
  getAllGuest,
} = require('../controllers/staff.controller');

const { authMiddleware, requireStaffOrAdmin } = require('../middleware/auth.middleware');

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


module.exports = router;