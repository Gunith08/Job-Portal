// routes/jobRoutes.js
// Job listing routes for browsing, searching, posting, and managing vacancies

const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view & filter all jobs
router.get('/', getAllJobs);

// Employer route to view only their own posted jobs
router.get('/my/listings', protect, authorize('employer'), getMyJobs);

// Public route to view single job details
router.get('/:id', getJobById);

// Employer route to create new job listing
router.post('/', protect, authorize('employer'), createJob);

// Employer or Admin routes to update or remove job listing
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
