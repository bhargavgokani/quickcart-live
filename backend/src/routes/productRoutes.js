'use strict';

const { Router } = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ROLES = require('../constants/roles');

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/products
 * Returns all active products sorted newest first.
 */
router.get('/', getProducts);

/**
 * GET /api/v1/products/:id
 * Returns a single active product by ID.
 */
router.get('/:id', getProduct);

// ─── Admin-Only Routes ────────────────────────────────────────────────────────

/**
 * POST /api/v1/products
 * Create a new product. ADMIN only.
 */
router.post('/', protect, authorize(ROLES.ADMIN), createProduct);

/**
 * PUT /api/v1/products/:id
 * Update an existing product. ADMIN only.
 */
router.put('/:id', protect, authorize(ROLES.ADMIN), updateProduct);

/**
 * DELETE /api/v1/products/:id
 * Soft-delete a product (isActive = false). ADMIN only.
 */
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteProduct);

/**
 * PATCH /api/v1/products/:id/stock
 * Update stock only. ADMIN only.
 */
router.patch('/:id/stock', protect, authorize(ROLES.ADMIN), updateStock);

module.exports = router;
