// controllers/adminController.js
// Handles administrative features as specified in PDF Section 6:
// - View all registered users
// - View a user by ID
// - Update user status when required
// - Delete a user when required
// - View all job postings
// - View a job posting by ID
// - Remove inappropriate or invalid job postings
// - Review platform data through protected admin APIs (stats)

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get aggregate platform metrics and statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'job_seeker' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ jobStatus: 'Open' });
    const closedJobs = await Job.countDocuments({ jobStatus: 'Closed' });

    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });
    const shortlistedApplications = await Application.countDocuments({ status: 'Shortlisted' });
    const acceptedApplications = await Application.countDocuments({ status: 'Accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'Rejected' });

    res.status(200).json({
      success: true,
      message: 'Platform statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          jobSeekers: totalJobSeekers,
          employers: totalEmployers,
          admins: totalAdmins,
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          shortlisted: shortlistedApplications,
          accepted: acceptedApplications,
          rejected: rejectedApplications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View all registered users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View a user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate or role update)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role && ['job_seeker', 'employer', 'admin'].includes(role)) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user when required
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Cascade delete user jobs and applications
    if (user.role === 'employer') {
      const jobs = await Job.find({ employer: user._id });
      const jobIds = jobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ employer: user._id });
    }

    if (user.role === 'job_seeker') {
      const applications = await Application.find({ applicant: user._id });
      for (const app of applications) {
        await Job.findByIdAndUpdate(app.job, { $inc: { applicantsCount: -1 } });
      }
      await Application.deleteMany({ applicant: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View all job postings (platform-wide)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAllJobsAdmin = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('employer', 'name email companyDetails')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View a job posting by ID
// @route   GET /api/admin/jobs/:id
// @access  Private (Admin only)
exports.getJobByIdAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name email companyDetails'
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove inappropriate or invalid job postings
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
exports.deleteJobAdmin = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id: ${req.params.id}`,
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job posting removed by administrator',
    });
  } catch (error) {
    next(error);
  }
};
