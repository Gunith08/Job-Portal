// routes/userRoutes.js
// User profile routes for viewing profile, updating details, and changing password

const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateJobSeekerProfile,
  updateCompanyProfile,
  changePassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// View own profile
router.get('/profile', protect, getMyProfile);

// Update Job Seeker profile
router.put('/profile', protect, authorize('job_seeker'), updateJobSeekerProfile);

// Update Employer company details
router.put('/company', protect, authorize('employer'), updateCompanyProfile);

// Change password
router.put('/change-password', protect, changePassword);

module.exports = router;
