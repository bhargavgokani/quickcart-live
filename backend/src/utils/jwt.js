'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Signs a JWT containing userId and role.
 *
 * @param {{ userId: string, role: string }} payload
 * @returns {string} Signed JWT token.
 */
const signToken = ({ userId, role }) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables.');
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verifies and decodes a JWT.
 *
 * @param {string} token
 * @returns {{ userId: string, role: string, iat: number, exp: number }}
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyToken = (token) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables.');
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };
