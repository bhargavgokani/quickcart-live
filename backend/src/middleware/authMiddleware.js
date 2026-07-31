'use strict';

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication middleware.
 * Expects: Authorization: Bearer <token>
 *
 * On success, attaches the authenticated user document to req.user.
 * On failure, returns 401.
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User not found or account inactive.' });
  }

  req.user = user;
  return next();
};

module.exports = { protect };
