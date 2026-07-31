'use strict';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../app');
const User = require('../models/User');
const ROLES = require('../constants/roles');

// ─── In-Memory MongoDB Setup ──────────────────────────────────────────────────
let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
}, 30000);

afterEach(async () => {
  // Clean all collections between tests for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Test Fixtures ─────────────────────────────────────────────────────────────
const TEST_USER = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'TestPass@123',
};

// ─── Register ─────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', TEST_USER.email.toLowerCase());
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user.role).toBe(ROLES.CUSTOMER);
  });

  it('should reject registration with a duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(TEST_USER);
    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'missing@example.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(TEST_USER);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', TEST_USER.email.toLowerCase());
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should reject login with an invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with a non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'AnyPass@123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_USER.email });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────

describe('Auth Middleware – protect', () => {
  const { protect } = require('../middleware/authMiddleware');

  it('should return 401 when no token is provided', async () => {
    let status = null;
    let body = null;
    let nextCalled = false;

    const mockReq = { headers: {} };
    const mockRes = {
      status(code) { status = code; return this; },
      json(b) { body = b; return this; },
    };

    await protect(mockReq, mockRes, () => { nextCalled = true; });

    expect(nextCalled).toBe(false);
    expect(status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('should return 401 for an invalid/tampered token', async () => {
    let status = null;
    let body = null;

    const mockReq = { headers: { authorization: 'Bearer invalid.token.here' } };
    const mockRes = {
      status(code) { status = code; return this; },
      json(b) { body = b; return this; },
    };

    await protect(mockReq, mockRes, () => {});

    expect(status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('should call next() and attach req.user with a valid token', async () => {
    // Register a real user first
    const regRes = await request(app).post('/api/v1/auth/register').send(TEST_USER);
    const { token } = regRes.body.data;

    let nextCalled = false;
    const mockReq = { headers: { authorization: `Bearer ${token}` } };
    const mockRes = {
      status() { return this; },
      json() { return this; },
    };

    await protect(mockReq, mockRes, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user.email).toBe(TEST_USER.email.toLowerCase());
  });
});

// ─── Role Middleware ──────────────────────────────────────────────────────────

describe('Role Middleware – authorize', () => {
  const { authorize } = require('../middleware/roleMiddleware');

  it('should return 403 when a CUSTOMER tries to access an ADMIN-only route', () => {
    let status = null;
    let body = null;

    const mockReq = { user: { role: ROLES.CUSTOMER } };
    const mockRes = {
      status(code) { status = code; return this; },
      json(b) { body = b; return this; },
    };

    authorize(ROLES.ADMIN)(mockReq, mockRes, () => {});

    expect(status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('should call next() when the user has the required role', () => {
    let nextCalled = false;

    const mockReq = { user: { role: ROLES.ADMIN } };
    const mockRes = { status() { return this; }, json() { return this; } };

    authorize(ROLES.ADMIN)(mockReq, mockRes, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
  });

  it('should allow access when user has one of multiple allowed roles', () => {
    let nextCalled = false;

    const mockReq = { user: { role: ROLES.CUSTOMER } };
    const mockRes = { status() { return this; }, json() { return this; } };

    authorize(ROLES.ADMIN, ROLES.CUSTOMER)(mockReq, mockRes, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
  });
});
