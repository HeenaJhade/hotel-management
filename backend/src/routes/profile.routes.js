const express = require('express');
const router = express.Router();
const { updateProfile } = require('../controllers/profile.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/', authMiddleware, updateProfile);

module.exports = router;