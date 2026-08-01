'use strict';

/**
 * Seed Script – inserts the default admin account and a realistic product catalog.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Safe to run multiple times – idempotent by design.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const ROLES = require('../src/constants/roles');

const ADMIN_SEED = {
  name: 'Administrator',
  email: 'admin@quickcart.com',
  password: 'Admin@123',
  role: ROLES.ADMIN,
  isActive: true,
};

const PRODUCTS_SEED = [
  {
    name: 'Quantum Sound Wireless Headphones',
    description: 'Experience premium high-fidelity audio with active noise cancellation and 40-hour battery life. Category: Electronics.',
    price: 199.99,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    isActive: true,
  },
  {
    name: 'UltraWide 4K Curved Monitor',
    description: 'Immersive 34-inch curved display with 144Hz refresh rate, perfect for productivity and multimedia editing. Category: Electronics.',
    price: 499.99,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
    isActive: true,
  },
  {
    name: 'Mini HD Portable Projector',
    description: 'Compact outdoor projector supporting full HD playback, built-in dual speakers, and screen mirroring. Category: Electronics.',
    price: 129.99,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500',
    isActive: true,
  },
  {
    name: 'SuperCharge 100W Power Bank',
    description: 'Massive 25,000mAh capacity power bank with triple USB-C power delivery ports to charge laptops on the go. Category: Electronics.',
    price: 79.99,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=500',
    isActive: true,
  },
  {
    name: 'Smart Home Hub Speaker',
    description: 'Voice-controlled smart assistant speaker with rich 360-degree sound output and smart home integration. Category: Electronics.',
    price: 59.99,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=500',
    isActive: true,
  },
  {
    name: 'Mechanical RGB Gaming Keyboard',
    description: 'Tactile mechanical blue switches with customizable per-key chroma backlight and dedicated media keys. Category: Gaming.',
    price: 89.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
    isActive: true,
  },
  {
    name: 'Pro Precision Wireless Gaming Mouse',
    description: 'Ultra-lightweight wireless gaming mouse with 20,000 DPI optical sensor and zero latency connection. Category: Gaming.',
    price: 74.99,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
    isActive: true,
  },
  {
    name: 'Virtual Reality Pro Headset',
    description: 'Standalone VR headset with 128GB storage, high-resolution optics, and immersive spatial audio feedback. Category: Gaming.',
    price: 399.99,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=500',
    isActive: true,
  },
  {
    name: 'Ergonomic Gaming Desk Chair',
    description: 'Premium PU leather high-back chair with adjustable lumbar support, 3D armrests, and 135-degree recline. Category: Gaming.',
    price: 249.99,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=500',
    isActive: true,
  },
  {
    name: 'Console Controller Charger Dock',
    description: 'Fast charging cradle charging two wireless gamepads simultaneously with LED status indicators. Category: Gaming.',
    price: 24.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500',
    isActive: true,
  },
  {
    name: 'Fitness Track Pro Smartwatch',
    description: 'Advanced fitness smartwatch featuring heart rate tracker, blood oxygen sensor, and built-in GPS mapping. Category: Wearables.',
    price: 149.99,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    isActive: true,
  },
  {
    name: 'ActiveFit Wireless Earbuds',
    description: 'IPX7 waterproof sports wireless earbuds with snug ear hook design and dynamic deep bass profiles. Category: Wearables.',
    price: 49.99,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500',
    isActive: true,
  },
  {
    name: 'GPS Tracking Sports Smart Band',
    description: 'Slim and lightweight activity tracker band with auto-sleep metrics and call notification reminders. Category: Wearables.',
    price: 34.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
    isActive: true,
  },
  {
    name: 'Smart Health Rings Tracker',
    description: 'Titanium smart ring measuring daily recovery, temperature variations, and cardiovascular parameters. Category: Wearables.',
    price: 299.99,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500',
    isActive: true,
  },
  {
    name: 'Premium Leather Laptop Sleeve',
    description: 'Handcrafted scratch-resistant genuine leather cover custom-fit for 13-14 inch modern notebooks. Category: Accessories.',
    price: 45.00,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    isActive: true,
  },
  {
    name: 'Anti-Glare Blue Light Glasses',
    description: 'Stylish lightweight screen protective spectacles blocking harmful blue light rays from computer monitors. Category: Accessories.',
    price: 19.99,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=500',
    isActive: true,
  },
  {
    name: 'Desktop Aluminum Organizer Stand',
    description: 'Sturdy space-saving vertical stand raising monitors or laptops to improve neck alignment ergonomics. Category: Accessories.',
    price: 29.99,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
    isActive: true,
  },
  {
    name: 'Ultra-Speed USB-C Hub Adapter',
    description: 'Premium aluminum hub expanding a single USB-C port to HDMI, card reader slots, and triple USB 3.0 ports. Category: Accessories.',
    price: 39.99,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500',
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed Admin Account
    const existingAdmin = await User.findOne({ email: ADMIN_SEED.email });
    if (existingAdmin) {
      console.log(`ℹ️  Admin already exists (${ADMIN_SEED.email}). No changes made.`);
    } else {
      await User.create(ADMIN_SEED);
      console.log(`✅ Admin seeded successfully: ${ADMIN_SEED.email}`);
    }

    // 2. Seed Realistic Products Catalog
    let createdCount = 0;
    let skippedCount = 0;

    for (const productInfo of PRODUCTS_SEED) {
      const existingProduct = await Product.findOne({ name: productInfo.name });
      if (existingProduct) {
        skippedCount++;
      } else {
        await Product.create(productInfo);
        createdCount++;
      }
    }

    console.log(`📊 Seeding report: ${createdCount} products created, ${skippedCount} products skipped.`);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected.');
  }
};

seed();
