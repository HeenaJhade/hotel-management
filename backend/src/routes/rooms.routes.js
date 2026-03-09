const express = require('express');
const router = express.Router();
const { checkAvailability } = require("../controllers/room.controller");
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAvailableRooms,
} = require('../controllers/room.controller');

const {
  authMiddleware,
  requireStaffOrAdmin,
  requireAdmin
} = require('../middleware/auth.middleware');

// ✅ ORDER MATTERS — specific routes first

router.get('/all', getAllRooms);
router.get('/', getAvailableRooms);
router.get('/:roomId', getRoomById);


router.get("/:roomId/check-availability", checkAvailability);
// Protected routes
router.post('/', authMiddleware, requireAdmin, createRoom);
router.put('/:roomId/status', authMiddleware, requireStaffOrAdmin, updateRoomStatus);
router.put('/:roomId', authMiddleware, requireAdmin, updateRoom);
router.delete('/:roomId', authMiddleware, requireAdmin, deleteRoom);

module.exports = router;