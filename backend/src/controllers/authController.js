'use strict';

const { registerUser, loginUser } = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Register a new customer account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const { token, user } = await registerUser({ name, email, password });

  return successResponse(res, 201, 'Account created successfully.', { token, user });
};

/**
 * @desc    Login with existing credentials
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const { token, user } = await loginUser({ email, password });

  return successResponse(res, 200, 'Login successful.', { token, user });
};

module.exports = { register, login };
