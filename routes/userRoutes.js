// routes/userRoutes.js
// User profile update routes for Job Seekers and Employers

const express = require('express');
const router = express.Router();
const {
  updateJobSeekerProfile,
  updateCompanyProfile,
  changePassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Update Job Seeker profile
router.put('/profile', protect, authorize('job_seeker'), updateJobSeekerProfile);

// Update Employer company details
router.put('/company', protect, authorize('employer'), updateCompanyProfile);

// Change user password
router.put('/change-password', protect, changePassword);

module.exports = router;
