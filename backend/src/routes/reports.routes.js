import express from 'express';
import { getDashboardStats } from '../controllers/report.controller.js';
const router = express.Router(); 
import { authMiddleware, requireStaffOrAdmin } from '../middleware/auth.middleware.js';

router.get('/dashboard', authMiddleware, requireStaffOrAdmin, getDashboardStats);

export default router;