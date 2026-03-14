import express from 'express';
import {
  signup,
  verifyOtp,
  resendOtp,
  login,
  resetPassword,
  getCurrentUser,
  forgotPassword,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { body } from'express-validator';
const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty()
  ],
  signup
);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.get('/me', authMiddleware, getCurrentUser);

export default router;