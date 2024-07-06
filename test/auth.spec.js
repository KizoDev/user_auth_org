const request = require('supertest');
const app = require('../app');
const db = require('../models');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  it('Should register user successfully with default organization', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.user).toHaveProperty('userId');
    expect(res.body.data.user).toHaveProperty('firstName', 'John');
  });

  it('Should log the user in successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.user).toHaveProperty('userId');
  });

  it('Should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('Should fail if there’s duplicate email or userId', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('errors');
  });
});
