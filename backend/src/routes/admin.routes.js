const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllUsers,
  deleteUser,
  toggleUserBlock,
} = require('../controllers/admin.controller');

const { authMiddleware, requireAdmin } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

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



module.exports = router;