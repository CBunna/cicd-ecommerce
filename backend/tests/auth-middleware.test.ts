import request from 'supertest';
import app from '../src/app';
import { clearDatabase, generateTestUsers, closeDatabase } from './utils';
import jwt from 'jsonwebtoken';

describe('Authentication Middleware', () => {
  let adminUser: any;
  let customerUser: any;
  let adminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    const users = await generateTestUsers();
    adminUser = users.adminUser;
    customerUser = users.customerUser;

    // Generate tokens with correct secret
    adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: customerUser.id, email: customerUser.email, role: customerUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await clearDatabase();
    await closeDatabase();
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('id', adminUser.id);
      expect(response.body.user).toHaveProperty('email', adminUser.email);
      expect(response.body.user).toHaveProperty('role', adminUser.role);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
      expect(response.body.code).toBe('NO_TOKEN');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Access denied. Invalid token.');
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.code).toBe('NO_TOKEN');
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' } // expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should access user profile with valid customer token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.message).toBe('Profile accessed successfully');
      expect(response.body.user).toHaveProperty('id', customerUser.id);
      expect(response.body.user).toHaveProperty('role', 'customer');
    });

    it('should access user profile with valid admin token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('GET /api/users/admin (Role-based Authorization)', () => {
    it('should allow admin access to admin endpoint', async () => {
      const response = await request(app)
        .get('/api/users/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin data accessed successfully');
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data.adminUser).toHaveProperty('role', 'admin');
    });

    it('should deny customer access to admin endpoint', async () => {
      const response = await request(app)
        .get('/api/users/admin')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Insufficient permissions.');
      expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(response.body.required).toContain('admin');
      expect(response.body.current).toBe('customer');
    });

    it('should deny access without authentication', async () => {
      const response = await request(app)
        .get('/api/users/admin')
        .expect(401);

      expect(response.body.code).toBe('NO_TOKEN');
    });
  });
});