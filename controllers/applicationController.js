// controllers/applicationController.js
// Handles applying for jobs, tracking application statuses, and employer candidate review

const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (Job Seeker only)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This job listing is no longer accepting applications',
      });
    }

    // Check if deadline has passed
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this job has expired',
      });
    }

    // Check if candidate already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this job',
      });
    }

    // Determine resume URL (from request body or fallback to profile resume)
    const finalResume = resumeUrl || req.user.profile?.resumeUrl;
    if (!finalResume) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a resume URL in the application or save one in your profile',
      });
    }

    // Build embedded applicant snapshot
    const applicantSnapshot = {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || '',
      headline: req.user.profile?.headline || '',
      skills: req.user.profile?.skills || [],
    };

    // Create the application document
    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      employer: job.employer,
      resumeUrl: finalResume,
      coverLetter,
      status: 'Pending',
      applicantSnapshot,
      statusHistory: [
        {
          status: 'Pending',
          note: 'Application successfully submitted by candidate',
          changedAt: new Date(),
        },
      ],
    });

    // Increment applicants counter on the job document
    job.applicantsCount += 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications submitted by logged-in Job Seeker
// @route   GET /api/applications/my
// @access  Private (Job Seeker only)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location jobType category salary status deadline',
      })
      .populate({
        path: 'employer',
        select: 'name email companyDetails',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker only)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Ensure applicant owns this application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to withdraw this application',
      });
    }

    const jobId = application.job;
    await application.deleteOne();

    // Decrement applicants count on the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer who posted the job or Admin)
exports.getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Verify employer owns the job or user is admin
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view applicants for jobs you have posted',
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email phone profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Shortlist, Interview, Accept, Reject)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer who posted the job or Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, employerNotes } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Choose from: ${validStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this candidate application',
      });
    }

    // Update status and push into status history embedded array
    application.status = status;
    if (employerNotes !== undefined) {
      application.employerNotes = employerNotes;
    }

    application.statusHistory.push({
      status,
      note: note || `Status updated to ${status} by recruiter`,
      changedAt: new Date(),
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: `Candidate application status updated to '${status}'`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
