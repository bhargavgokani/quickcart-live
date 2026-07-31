'use strict';

const ROLES = require('../constants/roles');

/**
 * Authorization middleware factory.
 * Call with one or more allowed role constants from constants/roles.js.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize(ROLES.ADMIN), handler);
 *   router.get('/staff',      protect, authorize(ROLES.ADMIN, ROLES.CUSTOMER), handler);
 *
 * Must be used AFTER the protect middleware so req.user is populated.
 * Returns 403 if the authenticated user's role is not in the allowed list.
 *
 * @param {...string} allowedRoles - Role values from constants/roles.js.
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  // Validate at startup that only known roles are used
  const validRoles = Object.values(ROLES);
  allowedRoles.forEach((role) => {
    if (!validRoles.includes(role)) {
      throw new Error(`authorize() received unknown role: "${role}". Use constants from constants/roles.js.`);
    }
  });

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }

    return next();
  };
};

module.exports = { authorize };
