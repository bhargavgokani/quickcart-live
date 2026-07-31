'use strict';

const { Router } = require('express');
const { register, login } = require('../controllers/authController');

const router = Router();

/**
 * POST /api/v1/auth/register
 * Public – creates a new CUSTOMER account.
 */
router.post('/register', register);

/**
 * POST /api/v1/auth/login
 * Public – authenticates an existing user.
 */
router.post('/login', login);

module.exports = router;
