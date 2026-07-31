'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app');
const User = require('../models/User');
const Product = require('../models/Product');
const { Order } = require('../models/Order');
const ROLES = require('../constants/roles');

// ─── In-Memory MongoDB ────────────────────────────────────────────────────────
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const CUSTOMER_DATA = { name: 'Test Customer', email: 'customer@test.com', password: 'Pass@123' };
const ADMIN_DATA    = { name: 'Test Admin',    email: 'admin@test.com',    password: 'Admin@123' };

const PRODUCT_DATA = {
  name: 'Flash Widget',
  description: 'Hot flash-sale item.',
  price: 19.99,
  stock: 10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createUserAndLogin = async (creds, role = ROLES.CUSTOMER) => {
  await User.create({ ...creds, role });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: creds.email, password: creds.password });
  return res.body.data.token;
};

const createProduct = async (overrides = {}) => {
  return Product.create({ ...PRODUCT_DATA, ...overrides });
};

// ─── POST /api/v1/checkout ────────────────────────────────────────────────────

describe('POST /api/v1/checkout', () => {
  it('should allow a CUSTOMER to purchase a product successfully', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 5 });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.remainingStock).toBe(4);

    // Verify stock actually decremented in DB
    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(4);
  });

  it('should create an order with correct fields', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 5 });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(201);
    const { order } = res.body.data;
    expect(order.quantity).toBe(1);
    expect(order.unitPrice).toBe(product.price);
    expect(order.totalPrice).toBe(product.price * 1);
    expect(order.status).toBe('SUCCESS');
  });

  it('should reject ADMIN purchase with 403', async () => {
    const adminToken = await createUserAndLogin(ADMIN_DATA, ROLES.ADMIN);
    const product = await createProduct({ stock: 5 });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should reject unauthenticated request with 401', async () => {
    const product = await createProduct({ stock: 5 });

    const res = await request(app)
      .post('/api/v1/checkout')
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when productId is missing', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when product does not exist', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(fakeId) });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 when product is out of stock', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 0 });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/out of stock/i);
  });

  it('should return 400 for an inactive product', async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 5, isActive: false });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/v1/orders ───────────────────────────────────────────────────────

describe('GET /api/v1/orders', () => {
  it("should return the customer's own orders newest first", async () => {
    const token = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 5 });

    // Place two orders
    await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    // Newest first
    expect(new Date(res.body.data[0].purchasedAt).getTime())
      .toBeGreaterThanOrEqual(new Date(res.body.data[1].purchasedAt).getTime());
  });

  it("should return only the current customer's orders (not others)", async () => {
    const token1 = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const product = await createProduct({ stock: 5 });

    await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: String(product._id) });

    // Second customer
    await User.create({ name: 'Other', email: 'other@test.com', password: 'Other@123', role: ROLES.CUSTOMER });
    const res2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'other@test.com', password: 'Other@123' });
    const token2 = res2.body.data.token;

    const ordersRes = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token2}`);

    expect(ordersRes.statusCode).toBe(200);
    expect(ordersRes.body.data).toHaveLength(0);
  });

  it('should reject ADMIN from GET /api/v1/orders with 403', async () => {
    const adminToken = await createUserAndLogin(ADMIN_DATA, ROLES.ADMIN);

    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(403);
  });
});

// ─── GET /api/v1/orders/all ───────────────────────────────────────────────────

describe('GET /api/v1/orders/all', () => {
  it('should return all orders for ADMIN', async () => {
    const customerToken = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);
    const adminToken    = await createUserAndLogin(ADMIN_DATA,    ROLES.ADMIN);
    const product = await createProduct({ stock: 5 });

    await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: String(product._id) });

    const res = await request(app)
      .get('/api/v1/orders/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    // Should have user and product populated
    expect(res.body.data[0].user).toHaveProperty('email');
    expect(res.body.data[0].product).toHaveProperty('name');
  });

  it('should reject CUSTOMER from GET /api/v1/orders/all with 403', async () => {
    const customerToken = await createUserAndLogin(CUSTOMER_DATA, ROLES.CUSTOMER);

    const res = await request(app)
      .get('/api/v1/orders/all')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

// ─── CONCURRENCY TEST (MANDATORY) ────────────────────────────────────────────
// Scenario: 10 units of stock, 100 simultaneous purchase requests.
// Expected: exactly 10 succeed, exactly 90 fail with Out Of Stock,
//           final stock = 0, exactly 10 orders in DB, stock never negative.

describe('Concurrency – Anti-Oversell Guarantee', () => {
  it(
    'should allow exactly 10 purchases when stock=10 and 100 requests fire simultaneously',
    async () => {
      // ── Setup: 100 unique customers ──────────────────────────────────────────
      const customerCount = 100;
      const initialStock  = 10;

      // Create all customers directly in DB (bypasses hashing delay for speed)
      const customers = [];
      for (let i = 0; i < customerCount; i++) {
        customers.push({
          name: `Customer ${i}`,
          email: `customer${i}@test.com`,
          password: 'Pass@123',
          role: ROLES.CUSTOMER,
        });
      }
      const insertedUsers = await User.insertMany(customers);

      // Sign tokens directly to bypass HTTP roundtrips and password hashing delay
      const { signToken } = require('../utils/jwt');
      const tokens = insertedUsers.map((u) => signToken({ userId: u._id, role: u.role }));

      // Create the product with exactly initialStock units
      const product = await createProduct({ stock: initialStock });

      // ── Fire all 100 requests simultaneously ─────────────────────────────────
      const purchasePromises = tokens.map((token) =>
        request(app)
          .post('/api/v1/checkout')
          .set('Authorization', `Bearer ${token}`)
          .send({ productId: String(product._id) })
      );

      const results = await Promise.all(purchasePromises);

      // ── Assertions ────────────────────────────────────────────────────────────
      const successes = results.filter((r) => r.statusCode === 201);
      const outOfStock = results.filter((r) => r.statusCode === 409);

      // Exactly 10 must succeed
      expect(successes.length).toBe(initialStock);

      // Exactly 90 must be out of stock
      expect(outOfStock.length).toBe(customerCount - initialStock);

      // All failures must be 409 (out of stock), none should be 5xx errors
      const errors = results.filter((r) => r.statusCode >= 500);
      expect(errors.length).toBe(0);

      // ── Database verification ─────────────────────────────────────────────────
      const finalProduct = await Product.findById(product._id);

      // Stock must be exactly 0 – never negative
      expect(finalProduct.stock).toBe(0);
      expect(finalProduct.stock).toBeGreaterThanOrEqual(0);

      // Exactly initialStock orders must exist in the DB
      const orderCount = await Order.countDocuments({ product: product._id });
      expect(orderCount).toBe(initialStock);
    },
    60000 // Allow up to 60s for this concurrency test
  );
});
