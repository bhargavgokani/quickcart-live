'use strict';

const { Router } = require('express');
const { getHealth } = require('../controllers/healthController');

const router = Router();

/**
 * GET /health
 * Public health-check endpoint.
 */
router.get('/', getHealth);

module.exports = router;
