'use strict';

const request = require('supertest');
const app = require('../../app');

describe('GET /api/v1/health', () => {
  it('should return 200 with the expected payload', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('QuickCart Live Backend Running');
    expect(res.body.environment).toBeDefined();
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.timestamp).toBeDefined();
  });
});
