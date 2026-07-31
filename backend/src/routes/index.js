'use strict';

const { Router } = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');

const router = Router();

// ─── Module Routes ────────────────────────────────────────────────────────────
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Future modules are registered here:
// router.use('/orders', orderRoutes);

module.exports = router;
