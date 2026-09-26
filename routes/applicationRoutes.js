// routes/applicationRoutes.js
// Application lifecycle routes (applying, viewing candidate lists, status changes)

const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  withdrawApplication,
  getJobApplicants,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Job Seeker routes
router.post('/apply/:jobId', protect, authorize('job_seeker'), applyForJob);
router.get('/my', protect, authorize('job_seeker'), getMyApplications);
router.delete('/:id', protect, authorize('job_seeker'), withdrawApplication);

// Employer / Admin routes
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
