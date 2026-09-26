// models/User.js
// User Schema supporting Job Seeker, Employer, and Admin roles
// Demonstrates embedded documents (education, experience, companyDetails) and bcrypt password hashing

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Embedded Schema for Education
const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    yearOfPassing: { type: Number },
    gradeOrPercentage: { type: String },
  },
  { _id: false }
);

// Embedded Schema for Experience
const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    years: { type: Number },
    description: { type: String },
  },
  { _id: false }
);

// Embedded Schema for Job Seeker Profile
const seekerProfileSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true },
    bio: { type: String },
    skills: [{ type: String, trim: true }],
    education: [educationSchema],
    experience: [experienceSchema],
    resumeUrl: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
  },
  { _id: false }
);

// Embedded Schema for Employer Company Profile
const companyDetailsSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    aboutCompany: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['job_seeker', 'employer', 'admin'],
        message: '{VALUE} is not a valid user role',
      },
      default: 'job_seeker',
    },
    phone: {
      type: String,
      trim: true,
    },
    // Embedded subdocuments based on role
    profile: {
      type: seekerProfileSchema,
      default: () => ({}),
    },
    companyDetails: {
      type: companyDetailsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcryptjs before saving user
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified or is new
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
