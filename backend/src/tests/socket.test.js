'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock Socket.IO config module before importing app or services
jest.mock('../config/socket', () => {
  const originalModule = jest.requireActual('../config/socket');
  return {
    ...originalModule,
    emitEvent: jest.fn(),
  };
});

const app = require('../../app');
const User = require('../models/User');
const Product = require('../models/Product');
const { Order } = require('../models/Order');
const ROLES = require('../constants/roles');
const SOCKET_EVENTS = require('../constants/socketEvents');
const { emitEvent } = require('../config/socket');
const { signToken } = require('../utils/jwt');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 30000);

beforeEach(() => {
  // Clear mock call history before each test
  emitEvent.mockClear();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAdminToken = async () => {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Password@123',
    role: ROLES.ADMIN,
  });
  return signToken({ userId: admin._id, role: admin.role });
};

const getCustomerToken = async () => {
  const customer = await User.create({
    name: 'Customer User',
    email: 'customer@test.com',
    password: 'Password@123',
    role: ROLES.CUSTOMER,
  });
  return signToken({ userId: customer._id, role: customer.role });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Socket.IO Event Emissions', () => {
  it('should emit PRODUCT_CREATED when an admin creates a product', async () => {
    const token = await getAdminToken();
    const productData = {
      name: 'Socket Product',
      description: 'A product for testing socket emissions',
      price: 99.99,
      stock: 10,
    };

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData);

    expect(res.statusCode).toBe(201);
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(
      SOCKET_EVENTS.PRODUCT_CREATED,
      expect.objectContaining({
        product: expect.objectContaining({
          name: productData.name,
        }),
      })
    );
  });

  it('should emit PRODUCT_UPDATED when an admin updates a product', async () => {
    const token = await getAdminToken();
    const product = await Product.create({
      name: 'Original Name',
      description: 'Original Desc',
      price: 10,
      stock: 5,
    });

    const res = await request(app)
      .put(`/api/v1/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Socket Name' });

    expect(res.statusCode).toBe(200);
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(
      SOCKET_EVENTS.PRODUCT_UPDATED,
      expect.objectContaining({
        product: expect.objectContaining({
          name: 'Updated Socket Name',
        }),
      })
    );
  });

  it('should emit PRODUCT_DELETED when an admin soft-deletes a product', async () => {
    const token = await getAdminToken();
    const product = await Product.create({
      name: 'Delete Me',
      description: 'To be deleted',
      price: 10,
      stock: 5,
    });

    const res = await request(app)
      .delete(`/api/v1/products/${product._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(
      SOCKET_EVENTS.PRODUCT_DELETED,
      { productId: String(product._id) }
    );
  });

  it('should emit STOCK_UPDATED when a customer places a successful order', async () => {
    const token = await getCustomerToken();
    const product = await Product.create({
      name: 'Checkout Item',
      description: 'Flash sale item',
      price: 5.0,
      stock: 10,
    });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(201);
    expect(emitEvent).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(
      SOCKET_EVENTS.STOCK_UPDATED,
      {
        productId: String(product._id),
        stock: 9,
      }
    );
  });

  it('should NOT emit STOCK_UPDATED if checkout fails (e.g. out of stock)', async () => {
    const token = await getCustomerToken();
    const product = await Product.create({
      name: 'No Stock Item',
      description: 'Sold out',
      price: 5.0,
      stock: 0,
    });

    const res = await request(app)
      .post('/api/v1/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: String(product._id) });

    expect(res.statusCode).toBe(409);
    expect(emitEvent).not.toHaveBeenCalled();
  });
});
