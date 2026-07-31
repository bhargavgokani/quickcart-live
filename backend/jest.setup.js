'use strict';

/**
 * Jest global setup file.
 * Injects required environment variables for the test environment.
 * These values are for testing only – never use in production.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_jest_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.COOKIE_SECRET = 'test_cookie_secret_for_jest_only';
