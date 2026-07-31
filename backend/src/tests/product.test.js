'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app');
const User = require('../models/User');
const Product = require('../models/Product');
const ROLES = require('../constants/roles');

// ─── In-Memory MongoDB Setup ──────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ADMIN_CREDS = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'Admin@123',
};

const CUSTOMER_CREDS = {
  name: 'Test Customer',
  email: 'customer@test.com',
  password: 'Customer@123',
};

const VALID_PRODUCT = {
  name: 'Test Widget',
  description: 'A reliable test widget for unit testing.',
  price: 29.99,
  stock: 100,
};

/**
 * Creates a user directly in the DB with the given role and returns a JWT via login.
 */
const getToken = async (creds, role = ROLES.CUSTOMER) => {
  await User.create({ ...creds, role });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: creds.email, password: creds.password });
  return res.body.data.token;
};

/**
 * Creates a product via the API using an admin token and returns the created document.
 */
const createProductAsAdmin = async (adminToken, data = VALID_PRODUCT) => {
  const res = await request(app)
    .post('/api/v1/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(data);
  return res;
};

// ─── GET /api/v1/products ─────────────────────────────────────────────────────

describe('GET /api/v1/products', () => {
  it('should return an empty list when no products exist', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return only active products sorted newest first', async () => {
    // Seed directly so we can control isActive
    await Product.create({ ...VALID_PRODUCT, name: 'Product A' });
    await Product.create({ ...VALID_PRODUCT, name: 'Product B' });
    await Product.create({ ...VALID_PRODUCT, name: 'Inactive', isActive: false });

    const res = await request(app).get('/api/v1/products');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
    // Newest first – Product B was inserted last
    expect(res.body.data[0].name).toBe('Product B');
    // Inactive product must not be included
    expect(res.body.data.some((p) => p.name === 'Inactive')).toBe(false);
  });
});

// ─── GET /api/v1/products/:id ─────────────────────────────────────────────────

describe('GET /api/v1/products/:id', () => {
  it('should return a product by valid ID', async () => {
    const product = await Product.create(VALID_PRODUCT);
    const res = await request(app).get(`/api/v1/products/${product._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(String(product._id));
  });

  it('should return 404 for a non-existent product ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/products/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for an inactive product', async () => {
    const product = await Product.create({ ...VALID_PRODUCT, isActive: false });
    const res = await request(app).get(`/api/v1/products/${product._id}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/v1/products ────────────────────────────────────────────────────

describe('POST /api/v1/products', () => {
  it('should allow an ADMIN to create a product', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const res = await createProductAsAdmin(adminToken);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.name).toBe(VALID_PRODUCT.name);
    expect(res.body.data.isActive).toBe(true);
  });

  it('should forbid a CUSTOMER from creating a product (403)', async () => {
    const customerToken = await getToken(CUSTOMER_CREDS, ROLES.CUSTOMER);
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(VALID_PRODUCT);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).post('/api/v1/products').send(VALID_PRODUCT);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject product creation with missing required fields', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Incomplete Product' }); // missing description, price, stock

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject a product with price <= 0', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...VALID_PRODUCT, price: 0 });

    expect(res.statusCode).toBe(500); // Mongoose validation error caught by error handler
    expect(res.body.success).toBe(false);
  });

  it('should reject a product with negative stock', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...VALID_PRODUCT, stock: -1 });

    expect(res.statusCode).toBe(500); // Mongoose validation error caught by error handler
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/v1/products/:id ─────────────────────────────────────────────────

describe('PUT /api/v1/products/:id', () => {
  it('should allow an ADMIN to update a product', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name', price: 49.99 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.price).toBe(49.99);
  });

  it('should return 404 when updating a non-existent product', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/v1/products/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost Product' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should forbid a CUSTOMER from updating a product', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const customerToken = await getToken(CUSTOMER_CREDS, ROLES.CUSTOMER);
    const res = await request(app)
      .put(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Hacked Name' });

    expect(res.statusCode).toBe(403);
  });
});

// ─── DELETE /api/v1/products/:id ─────────────────────────────────────────────

describe('DELETE /api/v1/products/:id', () => {
  it('should soft-delete a product (isActive becomes false)', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify the product is now inactive in the DB
    const inDB = await Product.findById(productId);
    expect(inDB.isActive).toBe(false);
  });

  it('should make a soft-deleted product invisible in GET /products', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const listRes = await request(app).get('/api/v1/products');
    expect(listRes.body.data).toHaveLength(0);
  });

  it('should forbid a CUSTOMER from deleting a product', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const customerToken = await getToken(CUSTOMER_CREDS, ROLES.CUSTOMER);
    const res = await request(app)
      .delete(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

// ─── PATCH /api/v1/products/:id/stock ────────────────────────────────────────

describe('PATCH /api/v1/products/:id/stock', () => {
  it('should allow an ADMIN to update stock', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 250 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stock).toBe(250);
  });

  it('should allow stock to be set to 0 (out of stock)', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.stock).toBe(0);
  });

  it('should reject negative stock values', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: -5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should forbid a CUSTOMER from updating stock', async () => {
    const adminToken = await getToken(ADMIN_CREDS, ROLES.ADMIN);
    const createRes = await createProductAsAdmin(adminToken);
    const productId = createRes.body.data._id;

    const customerToken = await getToken(CUSTOMER_CREDS, ROLES.CUSTOMER);
    const res = await request(app)
      .patch(`/api/v1/products/${productId}/stock`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ stock: 999 });

    expect(res.statusCode).toBe(403);
  });
});
