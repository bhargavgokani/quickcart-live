'use strict';

const { Router } = require('express');
const { getMyOrders, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

const router = Router();

/**
 * GET /api/v1/orders/all
 * Returns ALL orders in the system.
 * ADMIN only.
 * NOTE: This route must be declared BEFORE /:id style routes to avoid
 * 'all' being interpreted as a dynamic segment.
 */
router.get('/all', protect, authorize(ROLES.ADMIN), getAllOrders);

/**
 * GET /api/v1/orders
 * Returns the authenticated customer's own orders, newest first.
 * CUSTOMER only.
 */
router.get('/', protect, authorize(ROLES.CUSTOMER), getMyOrders);

module.exports = router;
