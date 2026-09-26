// models/Job.js
// Job Schema representing job listings posted by employers
// Supports all fields specified in PDF: job title, company name, description, location,
// employment type, salary range, required skills, experience requirement, posted date,
// application deadline, and job status.

const mongoose = require('mongoose');

// Embedded Schema for Salary Range
const salarySchema = new mongoose.Schema(
  {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'INR', uppercase: true },
    period: { type: String, enum: ['per month', 'per annum'], default: 'per annum' },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Please provide the company name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the job location (e.g. City or Remote)'],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    salary: {
      type: salarySchema,
      required: [true, 'Please provide salary range'],
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceRequirement: {
      type: String,
      default: 'Fresher',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
    },
    jobStatus: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    category: {
      type: String,
      default: 'Software Development',
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1'],
    },
    // Reference Relationship: Job -> Employer (User)
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job posting must belong to an employer'],
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for compatibility with different property namings
jobSchema.virtual('jobTitle').get(function () {
  return this.title;
});
jobSchema.virtual('companyName').get(function () {
  return this.company;
});
jobSchema.virtual('jobType').get(function () {
  return this.employmentType;
});
jobSchema.virtual('skillsRequired').get(function () {
  return this.requiredSkills;
});
jobSchema.virtual('experienceLevel').get(function () {
  return this.experienceRequirement;
});
jobSchema.virtual('deadline').get(function () {
  return this.applicationDeadline;
});
jobSchema.virtual('status').get(function () {
  return this.jobStatus;
});

// Middleware to normalize aliases before saving
jobSchema.pre('validate', function (next) {
  if (this.jobTitle && !this.title) this.title = this.jobTitle;
  if (this.companyName && !this.company) this.company = this.companyName;
  if (this.jobType && !this.employmentType) this.employmentType = this.jobType;
  if (this.skillsRequired && (!this.requiredSkills || this.requiredSkills.length === 0)) {
    this.requiredSkills = this.skillsRequired;
  }
  if (this.experienceLevel && !this.experienceRequirement) {
    this.experienceRequirement = this.experienceLevel;
  }
  if (this.deadline && !this.applicationDeadline) {
    this.applicationDeadline = this.deadline;
  }
  if (this.status && !this.jobStatus) {
    this.jobStatus = this.status;
  }
  next();
});

// Indexes for text search and filtering
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ employmentType: 1, jobStatus: 1, location: 1 });

module.exports = mongoose.model('Job', jobSchema);
