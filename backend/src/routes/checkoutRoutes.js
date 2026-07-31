'use strict';

const { Router } = require('express');
const { processCheckout } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

const router = Router();

/**
 * POST /api/v1/checkout
 * Flash-sale purchase of exactly one unit.
 * CUSTOMER only – Admins are explicitly blocked.
 */
router.post('/', protect, authorize(ROLES.CUSTOMER), processCheckout);

module.exports = router;
