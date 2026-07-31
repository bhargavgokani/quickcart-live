'use strict';

/**
 * Seed Script – inserts the default admin account if it doesn't exist.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Safe to run multiple times – idempotent by design.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const ROLES = require('../src/constants/roles');

const ADMIN_SEED = {
  name: 'Administrator',
  email: 'admin@quickcart.com',
  password: 'Admin@123',
  role: ROLES.ADMIN,
  isActive: true,
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_SEED.email });

    if (existing) {
      console.log(`ℹ️  Admin already exists (${ADMIN_SEED.email}). No changes made.`);
    } else {
      await User.create(ADMIN_SEED);
      console.log(`✅ Admin seeded successfully: ${ADMIN_SEED.email}`);
    }
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected.');
  }
};

seed();
