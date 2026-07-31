'use strict';

const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const ROLES = require('../constants/roles');

/**
 * Registers a new CUSTOMER account.
 *
 * @param {{ name: string, email: string, password: string }} body
 * @returns {{ user: object, token: string }}
 * @throws {Error} 409 if email is already in use.
 */
const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // Role is always CUSTOMER on public registration
  const user = await User.create({ name, email, password, role: ROLES.CUSTOMER });

  const token = signToken({ userId: user._id, role: user.role });

  return {
    token,
    user: _sanitize(user),
  };
};

/**
 * Authenticates an existing user.
 *
 * @param {{ email: string, password: string }} body
 * @returns {{ user: object, token: string }}
 * @throws {Error} 401 for invalid credentials or inactive account.
 */
const loginUser = async ({ email, password }) => {
  // password field is excluded by default – select it explicitly
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatch = await user.comparePassword(password);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Your account has been deactivated. Please contact support.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user._id, role: user.role });

  return {
    token,
    user: _sanitize(user),
  };
};

// ─── Private Helpers ──────────────────────────────────────────────────────────

/**
 * Returns a plain object with only the fields safe to expose to the client.
 * Password is never included.
 */
const _sanitize = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

module.exports = { registerUser, loginUser };
