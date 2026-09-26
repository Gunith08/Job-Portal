// models/Job.js
// Job Schema representing job listings posted by employers
// Demonstrates referenced documents (employer referencing User) and embedded subdocuments

const mongoose = require('mongoose');

// Embedded Schema for Salary Details
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
    description: {
      type: String,
      required: [true, 'Please provide a detailed job description'],
    },
    company: {
      type: String,
      required: [true, 'Please provide the hiring company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide job location or specify Remote'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    category: {
      type: String,
      required: [true, 'Please select a job category'],
      trim: true,
      enum: [
        'Software Engineering',
        'Frontend Development',
        'Backend Development',
        'Full Stack Development',
        'DevOps & Cloud',
        'Data Science & AI',
        'Mobile App Development',
        'Cybersecurity',
        'UI/UX Design',
        'Other',
      ],
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', 'Junior (1-3 yrs)', 'Mid-level (3-5 yrs)', 'Senior (5+ yrs)'],
      default: 'Fresher',
    },
    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],
    salary: {
      type: salarySchema,
      required: true,
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Openings must be at least 1'],
    },
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Paused'],
      default: 'Open',
    },
    deadline: {
      type: Date,
    },
    // Referenced Document: The employer user who posted this job
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A job listing must belong to an employer'],
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
jobSchema.index({ title: 'text', description: 'text', company: 'text' });
jobSchema.index({ category: 1, jobType: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
