// controllers/jobController.js
// Handles CRUD operations for Job Listings, filtering, search, and pagination

const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs with filtering, search, and pagination
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      jobType,
      employmentType,
      location,
      minSalary,
      maxSalary,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { jobStatus: 'Open' };

    // Search by title, description, or company
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Employment / Job Type
    const typeFilter = employmentType || jobType;
    if (typeFilter) {
      query.employmentType = typeFilter;
    }

    // Filter by Location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Salary range
    if (minSalary || maxSalary) {
      query['salary.max'] = {};
      if (minSalary) query['salary.max'].$gte = Number(minSalary);
      if (maxSalary) query['salary.min'] = { $lte: Number(maxSalary) };
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;

    // Sorting
    let sortBy = { postedDate: -1 };
    if (sort === 'oldest') sortBy = { postedDate: 1 };
    if (sort === 'salaryHigh') sortBy = { 'salary.max': -1 };
    if (sort === 'salaryLow') sortBy = { 'salary.min': 1 };

    const totalJobs = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .populate('employer', 'name email companyDetails')
      .sort(sortBy)
      .skip(startIndex)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: jobs.length,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limitNum),
      currentPage: pageNum,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'employer',
      'name email phone companyDetails'
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

// @desc    Create a new job listing
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res, next) => {
  try {
    const {
      title,
      jobTitle,
      company,
      companyName,
      description,
      location,
      employmentType,
      jobType,
      category,
      experienceRequirement,
      experienceLevel,
      requiredSkills,
      skillsRequired,
      salary,
      openings,
      applicationDeadline,
      deadline,
    } = req.body;

    const finalTitle = title || jobTitle;
    const finalCompany =
      company || companyName || req.user.companyDetails?.companyName || req.user.name;
    const finalEmploymentType = employmentType || jobType || 'Full-time';
    const finalSkills = requiredSkills || skillsRequired || [];
    const finalExperience = experienceRequirement || experienceLevel || 'Fresher';
    const finalDeadline = applicationDeadline || deadline;

    if (!finalTitle || !description || !location || !salary) {
      return res.status(400).json({
        success: false,
        message: 'Please provide job title, description, location, and salary range',
      });
    }

    const job = await Job.create({
      title: finalTitle,
      company: finalCompany,
      description,
      location,
      employmentType: finalEmploymentType,
      category: category || 'Software Development',
      experienceRequirement: finalExperience,
      requiredSkills: finalSkills,
      salary,
      openings: openings || 1,
      applicationDeadline: finalDeadline,
      jobStatus: 'Open',
      employer: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Job listing posted successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job listing
// @route   PUT /api/jobs/:id
// @access  Private (Employer who posted the job or Admin)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id: ${req.params.id}`,
      });
    }

    // Authorization rule: employer can update only their own job; admin can update any
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to edit this job posting',
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job listing updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job listing
// @route   DELETE /api/jobs/:id
// @access  Private (Employer who posted the job or Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id: ${req.params.id}`,
      });
    }

    // Authorization rule: employer can delete only their own job; admin can delete any
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to delete this job posting',
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job and all its applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs posted by the currently logged-in employer
// @route   GET /api/jobs/my/listings
// @access  Private (Employer only)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};
