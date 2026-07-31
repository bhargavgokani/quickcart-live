'use strict';

/**
 * Catch-all 404 handler.
 * Registered after all routes so any unmatched request reaches this handler.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = notFound;
