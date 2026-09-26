// models/Application.js
// Application Schema connecting Job Seekers with Jobs and Employers
// Demonstrates both referenced documents (job, applicant, employer) and embedded documents (statusHistory, applicantSnapshot)

const mongoose = require('mongoose');

// Embedded Schema to track status transition history
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// Embedded Schema for snapshot of applicant profile at time of application
const applicantSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    headline: { type: String },
    skills: [{ type: String }],
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    // Referenced Document: The job being applied for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    // Referenced Document: The candidate applying
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    // Referenced Document: The employer who posted the job
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer reference is required'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Please provide your resume URL (e.g. Google Drive link or PDF URL)'],
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    employerNotes: {
      type: String,
      trim: true,
    },
    // Embedded subdocuments
    applicantSnapshot: applicantSnapshotSchema,
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Prevent multiple applications by the same applicant for the same job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
