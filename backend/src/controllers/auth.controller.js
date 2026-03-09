const { validationResult } = require('express-validator');
const User = require('../models/User');
const { hashPassword, verifyPassword, createAccessToken } = require('../middleware/auth.middleware'); // or move to service
const { sendOtpEmail, generateOtp, getOtpExpiry } = require('../services/email.service');

const signup = async (req, res) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ detail: 'Invalid input data' });
  }

  const { name, email, password, phone, role = 'user' } = req.body;
  console.log("body",req.body);
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();
    const passwordHash = await hashPassword(password);

    const user = new User({
      id: email,
      name,
      email,
      passwordHash,
      phone,
      role,
      isVerified: false,
      blocked: false,
      otp,
      otpExpiry
    });

    await user.save();

    await sendOtpEmail(email, otp, name);

    res.json({ message: 'OTP sent to email. Please verify to complete registration.', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ detail: 'Signup failed' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ detail: 'User not found' });
    if (user.isVerified) return res.status(400).json({ detail: 'User already verified' });
    if (user.otp !== otp) return res.status(400).json({ detail: 'Invalid OTP' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ detail: 'OTP expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = createAccessToken({ email: user.email, role: user.role });

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ detail: 'Verification failed' });
  }
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ detail: 'User not found' });
    if (user.isVerified) return res.status(400).json({ detail: 'User already verified' });

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(email, otp, user.name);

    res.json({ message: 'New OTP sent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ detail: 'Failed to resend OTP' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ detail: 'Invalid credentials' });
     

    if (user.isBlocked) {
      return res.status(403).json({ detail: 'Your account has been blocked' });
    }
    
    if (!(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ detail: 'Please verify your email first' });
    }

    const token = createAccessToken({ email: user.email, role: user.role });

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email })
      .select('-passwordHash -otp -otpExpiry');

    if (!user) return res.status(404).json({ detail: 'User not found' });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_verified: user.isVerified
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ detail: 'Failed to get user' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password) {
    return res.status(400).json({ detail: 'Email, OTP, and new password are required' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ detail: 'New password must be at least 8 characters long' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ detail: 'No reset OTP found. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ detail: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ detail: 'OTP has expired' });
    }

    // All good → update password
    user.passwordHash = await hashPassword(new_password);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ detail: 'Failed to reset password' });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ detail: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // For security: don't tell if email exists or not
      return res.json({ message: 'If the email exists, a reset OTP has been sent.' });
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send reset-specific email (you can modify sendOtpEmail to accept purpose)
    await sendOtpEmail(email, otp, user.name, 'password reset');

    return res.json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ detail: 'Failed to process request' });
  }
};




module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  resetPassword,
  forgotPassword,
  getCurrentUser
};