const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const createAccessToken = (payload) => {
  const expiresIn = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440') * 60; // convert to seconds
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn,
    algorithm: process.env.JWT_ALGORITHM || 'HS256'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin access required' });
  }
  next();
};

const requireStaffOrAdmin = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ detail: 'Staff or Admin access required' });
  }
  next();
};

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  verifyToken,
  authMiddleware,
  requireAdmin,
  requireStaffOrAdmin
};