import express from 'express';
import {
  createStaff,
  getAllUsers,
  deleteUser,
  toggleUserBlock,
} from '../controllers/admin.controller.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
const router = express.Router();

router.post(
  '/staff',
  authMiddleware,
  requireAdmin,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone_number').trim().notEmpty()
  ],
  createStaff
);

router.get('/users', authMiddleware, requireAdmin, getAllUsers);
router.put(
  '/users/:userEmail/block',
  authMiddleware,
  requireAdmin,
  toggleUserBlock
);
router.delete('/users/:userEmail', authMiddleware, requireAdmin, deleteUser);



export default router;