import request from 'supertest';
import app from '../src/app';
import { clearDatabase, createTestUser, closeDatabase } from './utils';

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(validUserData.email.toLowerCase());
      expect(response.body.user.firstName).toBe(validUserData.firstName);
      expect(response.body.user.lastName).toBe(validUserData.lastName);
      expect(response.body.user.role).toBe('customer');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should not register user with invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toContain('Please provide a valid email address');
    });

    it('should not register user with short password', async () => {
      const invalidData = { ...validUserData, password: '123' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toContain('Password must be at least 6 characters long');
    });

    it('should not register user with missing fields', async () => {
      const incompleteData = { email: 'test@example.com' };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should not register user with duplicate email', async () => {
      // Create a user first
      await createTestUser({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User'
      });

      // Try to register with same email
      const duplicateData = {
        ...validUserData,
        email: 'existing@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should handle case-insensitive email registration', async () => {
      // Register with specific test email to avoid conflicts
      const testEmail = `casesensitive${Date.now()}@example.com`;
      const userData1 = { ...validUserData, email: testEmail };
      
      // Register with lowercase email
      await request(app)
        .post('/api/auth/register')
        .send(userData1)
        .expect(201);

      // Try to register with uppercase email
      const uppercaseEmailData = {
        ...validUserData,
        email: testEmail.toUpperCase(),
        firstName: 'Another',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(uppercaseEmailData)
        .expect(409);

      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test users for login tests
      await createTestUser({
        email: 'logintest@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'Test'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(loginData.email.toLowerCase());
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
    });

    it('should handle case-insensitive email login', async () => {
      const loginData = {
        email: 'LOGINTEST@EXAMPLE.COM', // uppercase
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('logintest@example.com');
    });

    it('should not login with wrong email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with wrong password', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });

    it('should not login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });
  });
});