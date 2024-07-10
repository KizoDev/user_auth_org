// tests/auth.spec.js
const request = require('supertest');
const app = require('../server');
const { User, Organization } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('POST /auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should Register User Successfully with Default Organisation', async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashedpassword');
    User.create.mockResolvedValue({
      userId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
      phone: '1234567890',
      addOrganization: jest.fn()
    });
    Organization.create.mockResolvedValue({
      orgId: '1',
      name: "John's Organization",
      description: 'Organization for John'
    });
    jwt.sign.mockReturnValue('someaccesstoken');

    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('accessToken', 'someaccesstoken');
    expect(response.body.data.user).toHaveProperty('firstName', 'John');
    expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
    expect(response.body.data.user).toHaveProperty('email', 'john.doe@example.com');
    expect(response.body.data.user).toHaveProperty('phone', '1234567890');
    expect(response.body.data.user).toHaveProperty('organisation', "John's Organization");
  });

  it('Should fail registration with validation errors', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
      });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
  });

  it('Should fail registration if email already exists', async () => {
    User.findOne.mockResolvedValue({
      email: 'john.doe@example.com'
    });

    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('errors');
    expect(response.body.errors[0]).toHaveProperty('field', 'email');
    expect(response.body.errors[0]).toHaveProperty('message', 'Email already in use');
  });

  it('Should fail registration if userId already exists', async () => {
    User.create.mockImplementation(() => {
      throw new Error('User ID already exists');
    });

    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe2@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Internal server error');
  });
});

describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Should Log the user in successfully', async () => {
    User.findOne.mockResolvedValue({
      userId: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'hashedpassword',
      phone: '1234567890'
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('someaccesstoken');

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body.data).toHaveProperty('accessToken', 'someaccesstoken');
    expect(response.body.data.user).toHaveProperty('firstName', 'Jane');
    expect(response.body.data.user).toHaveProperty('lastName', 'Doe');
    expect(response.body.data.user).toHaveProperty('email', 'jane.doe@example.com');
    expect(response.body.data.user).toHaveProperty('phone', '1234567890');
  });

  it('Should fail login with invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'Bad request');
    expect(response.body).toHaveProperty('message', 'Authentication failed');
  });

  it('Should fail login with incorrect password', async () => {
    User.findOne.mockResolvedValue({
      userId: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'hashedpassword',
      phone: '1234567890'
    });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('status', 'Bad request');
    expect(response.body).toHaveProperty('message', 'Authentication failed');
  });
});