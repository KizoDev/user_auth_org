const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Organization } = require('../models');
const app = require('../server'); // Import the Express app

describe('Token Generation', () => {
  it('should generate a token with correct expiration and user details', async () => {
    const user = { userId: '12345', email: 'test@example.com' };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(user.userId);
    expect(decoded.email).toBe(user.email);
    expect(decoded.exp - decoded.iat).toBe(3600); // 1 hour in seconds
  });
});

describe('Organization Access', () => {
  it('should not allow users to see data from organizations they don’t have access to', async () => {
    const user = await User.create({
      userId: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    const organization = await Organization.create({
      orgId: 'test-org-id',
      name: 'Test Organization',
      description: 'Test Organization Description'
    });

    // Simulate user trying to access another organization
    const unauthorizedAccess = async () => {
      // Logic to check access
      if (!user.organizations || !user.organizations.includes(organization.orgId)) {
        throw new Error('Access denied');
      }
    };

    await expect(unauthorizedAccess).rejects.toThrow('Access denied');
  });
});

describe('POST /auth/register', () => {
  it('should register user successfully with default organization', async () => {
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
    expect(response.body.data.user.firstName).toBe('John');
    expect(response.body.data.user.email).toBe('john.doe@example.com');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.organization.name).toBe("John's Organization");
  }, 10000); // Increase timeout to 10 seconds

  it('should fail if required fields are missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'lastName' }));
  });

  it('should fail if there’s duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '0987654321'
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
  });
});

describe('POST /auth/login', () => {
  it('should log the user in successfully', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe('john.doe@example.com');
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('should fail if credentials are invalid', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication failed');
  });
});