const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/report.controller');

const { authMiddleware, requireStaffOrAdmin } = require('../middleware/auth.middleware');

router.get('/dashboard', authMiddleware, requireStaffOrAdmin, getDashboardStats);

module.exports = router;