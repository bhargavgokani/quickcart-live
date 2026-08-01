'use strict';

/**
 * Required environment variables for the production environment.
 * If any of these are missing, the server will crash on startup
 * with a descriptive error message.
 */
const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'COOKIE_SECRET',
];

/**
 * Validates that all required environment variables are set.
 * Exits the process if any are missing.
 */
const validateEnv = () => {
  // Skip environment validation in testing environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const missing = [];
  REQUIRED_ENV_VARS.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Environment Configuration Error:');
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please define these variables in your .env file or production host environment settings.');
    process.exit(1);
  }
};

module.exports = validateEnv;
