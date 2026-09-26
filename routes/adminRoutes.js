// routes/adminRoutes.js
// Admin-only management routes as per PDF Section 6

const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getAllJobsAdmin,
  getJobByIdAdmin,
  deleteJobAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here require authentication and Admin role
router.use(protect);
router.use(authorize('admin'));

// Platform metrics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Job moderation
router.get('/jobs', getAllJobsAdmin);
router.get('/jobs/:id', getJobByIdAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

module.exports = router;
