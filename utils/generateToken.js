// utils/generateToken.js
// Utility function to generate JWT and send it as an httpOnly cookie

const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'jobportal_supersecret_jwt_key_2026_dev',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 7;

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (https)
    sameSite: 'lax',
  };

  // Send cookie and JSON response
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also returned in body so it's easy to test in Postman / mobile clients
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile: user.profile,
        companyDetails: user.companyDetails,
      },
    });
};

module.exports = sendTokenResponse;
