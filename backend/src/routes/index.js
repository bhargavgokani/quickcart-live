'use strict';

const { Router } = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const orderRoutes = require('./orderRoutes');

const router = Router();

// ─── Module Routes ────────────────────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
