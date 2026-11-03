import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import User from '../models/User.js';
import Analysis from '../models/Analysis.js';

dotenv.config();

const TEST_MONGO_URI =
  process.env.MONGO_URI_TEST ||
  'mongodb://127.0.0.1:27017/fake_job_detector_test';

describe('Analysis API Endpoints', () => {
  let authToken = '';

  beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    await User.deleteMany({});
    await Analysis.deleteMany({});

    // Register user for test context
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Analysis Tester',
      email: 'analysistester@example.com',
      password: 'password123',
    });
    authToken = regRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Analysis.deleteMany({});
    await mongoose.connection.close();
  });

  it('POST /api/analysis - should reject unauthenticated requests', async () => {
    const res = await request(app).post('/api/analysis').send({
      title: 'Junior Web Developer',
    });

    expect(res.status).toBe(401);
  });

  it('POST /api/analysis - should reject request missing required title', async () => {
    const res = await request(app)
      .post('/api/analysis')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Some job description with no title',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/title is required/i);
  });

  it('GET /api/analysis - should return empty array when user has no analyses', async () => {
    const res = await request(app)
      .get('/api/analysis')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBe(0);
  });

  it('GET /api/analysis/:id - should return 400 for invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/analysis/invalid-id-format')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid analysis id/i);
  });
});
