// routes/adminRoutes.js
// Admin-only management routes for platform analytics and moderation

const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes in this file are restricted to admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
