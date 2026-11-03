import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import User from '../models/User.js';

dotenv.config();

const TEST_MONGO_URI =
  process.env.MONGO_URI_TEST ||
  'mongodb://127.0.0.1:27017/fake_job_detector_test';

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // Connect to isolated test database
    await mongoose.connect(TEST_MONGO_URI);
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  const testUser = {
    name: 'Test Candidate',
    email: 'candidate.test@example.com',
    password: 'securePassword123',
  };

  let authToken = '';

  it('POST /api/auth/register - should create a new user and return a token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body.user).toHaveProperty('role', 'jobseeker');
    authToken = res.body.token;
  });

  it('POST /api/auth/register - should reject duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('POST /api/auth/register - should reject short password (< 6 chars)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'short@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });

  it('POST /api/auth/login - should authenticate valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('GET /api/auth/me - should return current user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('GET /api/auth/me - should reject request without authorization token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/no token provided/i);
  });
});
