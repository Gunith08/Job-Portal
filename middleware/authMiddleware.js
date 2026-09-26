// middleware/authMiddleware.js
// Authentication & Role-Based Access Control (RBAC) middleware
// Supports JWT via httpOnly cookies and Authorization Bearer header for easy API/Postman testing

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in httpOnly cookies (preferred for browser security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Also check Authorization header for Postman / mobile client testing
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in first.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'jobportal_supersecret_jwt_key_2026_dev'
    );

    // Find the user associated with this token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// Grant access to specific roles (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route. Required roles: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
