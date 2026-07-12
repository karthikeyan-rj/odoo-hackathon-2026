const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * requireAuth — verifies JWT from Authorization: Bearer <token>
 * Attaches req.user (full user document, no passwordHash)
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'No token provided. Access denied.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'User not found. Token invalid.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Your account is deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * requireRole(...roles) — factory, checks req.user.role is in allowed list
 * Must be used AFTER requireAuth middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Not authenticated.',
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
