'use strict';

/**
 * Global error handler middleware.
 * Catches all errors passed via next(err) and returns a structured JSON response.
 * Must be registered LAST in the Express middleware chain.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error server-side (morgan already logs requests; this logs error detail)
  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);
  if (!isProduction) {
    console.error(err.stack);
  }

  const message = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
