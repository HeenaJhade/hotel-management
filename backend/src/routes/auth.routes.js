const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  resetPassword,
  getCurrentUser,
  forgotPassword,
} = require('../controllers/auth.controller');

const { authMiddleware } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

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

module.exports = router;