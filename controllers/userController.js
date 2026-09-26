// controllers/userController.js
// Handles user profile viewing, profile updates, and password changes

const User = require('../models/User');

// @desc    View own profile
// @route   GET /api/users/profile
// @access  Private (Job Seeker / Employer / Admin)
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Job Seeker profile (skills, education, experience, resume, bio)
// @route   PUT /api/users/profile
// @access  Private (Job Seeker)
exports.updateJobSeekerProfile = async (req, res, next) => {
  try {
    const { headline, bio, skills, education, experience, resumeUrl, githubUrl, linkedinUrl, phone, name } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    user.profile = {
      headline: headline !== undefined ? headline : user.profile.headline,
      bio: bio !== undefined ? bio : user.profile.bio,
      skills: skills !== undefined ? skills : user.profile.skills,
      education: education !== undefined ? education : user.profile.education,
      experience: experience !== undefined ? experience : user.profile.experience,
      resumeUrl: resumeUrl !== undefined ? resumeUrl : user.profile.resumeUrl,
      githubUrl: githubUrl !== undefined ? githubUrl : user.profile.githubUrl,
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : user.profile.linkedinUrl,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employer company profile
// @route   PUT /api/users/company
// @access  Private (Employer)
exports.updateCompanyProfile = async (req, res, next) => {
  try {
    const { companyName, website, industry, location, aboutCompany, phone, name } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    user.companyDetails = {
      companyName: companyName !== undefined ? companyName : user.companyDetails.companyName,
      website: website !== undefined ? website : user.companyDetails.website,
      industry: industry !== undefined ? industry : user.companyDetails.industry,
      location: location !== undefined ? location : user.companyDetails.location,
      aboutCompany: aboutCompany !== undefined ? aboutCompany : user.companyDetails.aboutCompany,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Company details updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
