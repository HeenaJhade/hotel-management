import express from 'express';
import { checkAvailability } from "../controllers/room.controller.js";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getAvailableRooms,
} from '../controllers/room.controller.js';
import{
  authMiddleware,
  requireStaffOrAdmin,
  requireAdmin
} from '../middleware/auth.middleware.js';
const  router = express.Router();

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

export default router;