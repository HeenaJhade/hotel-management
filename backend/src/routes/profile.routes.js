import express from 'express';
import { updateProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/', authMiddleware, updateProfile);

export default router;