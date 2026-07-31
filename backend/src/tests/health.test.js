'use strict';

const request = require('supertest');
const app = require('../../app');

describe('GET /api/v1/health', () => {
  it('should return 200 with the expected payload', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'QuickCart Live Backend Running',
    });
  });
});
