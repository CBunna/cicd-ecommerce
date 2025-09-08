import request from 'supertest';
import app from '../src/app';
import { clearDatabase, closeDatabase } from './utils';

describe('Authentication Integration Tests', () => {
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

  describe('Complete Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        email: 'flowtest@example.com',
        password: 'password123',
        firstName: 'Flow',
        lastName: 'Test'
      };

      // Step 1: Register
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.user.email).toBe(userData.email.toLowerCase());
      expect(registerResponse.body.token).toBeDefined();

      const registrationToken = registerResponse.body.token;

      // Step 2: Access protected endpoint with registration token
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registrationToken}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe(userData.email.toLowerCase());

      // Step 3: Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.user.email).toBe(userData.email.toLowerCase());
      expect(loginResponse.body.token).toBeDefined();

      const loginToken = loginResponse.body.token;

      // Step 4: Access protected endpoint with login token
      const secondProfileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);

      expect(secondProfileResponse.body.user.email).toBe(userData.email.toLowerCase());

      // Step 5: Verify both tokens work for protected endpoints
      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${registrationToken}`)
        .expect(200);

      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200);
    });

    it('should handle multiple users with different roles', async () => {
      const timestamp = Date.now();
      
      // Register admin user
      const adminData = {
        email: `multiadmin${timestamp}@example.com`,
        password: 'admin123',
        firstName: 'Multi',
        lastName: 'Admin'
      };

      // Register customer user
      const customerData = {
        email: `multicustomer${timestamp}@example.com`,
        password: 'customer123',
        firstName: 'Multi',
        lastName: 'Customer'
      };

      // Register both users
      const adminRegister = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      const customerRegister = await request(app)
        .post('/api/auth/register')
        .send(customerData)
        .expect(201);

      // Both should have customer role by default
      expect(adminRegister.body.user.role).toBe('customer');
      expect(customerRegister.body.user.role).toBe('customer');

      // Both should be able to access customer endpoints
      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${adminRegister.body.token}`)
        .expect(200);

      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${customerRegister.body.token}`)
        .expect(200);

      // Neither should be able to access admin endpoints (both are customers)
      await request(app)
        .get('/api/users/admin')
        .set('Authorization', `Bearer ${adminRegister.body.token}`)
        .expect(403);

      await request(app)
        .get('/api/users/admin')
        .set('Authorization', `Bearer ${customerRegister.body.token}`)
        .expect(403);
    });

    it('should maintain session state across multiple requests', async () => {
      const timestamp = Date.now();
      
      // Register user
      const userData = {
        email: `sessiontest${timestamp}@example.com`,
        password: 'password123',
        firstName: 'Session',
        lastName: 'Test'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const token = registerResponse.body.token;

      // Make multiple requests with same token
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body.user.email).toBe(userData.email.toLowerCase());
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent registration attempts', async () => {
      const timestamp = Date.now();
      const userData = {
        email: `concurrent${timestamp}@example.com`,
        password: 'password123',
        firstName: 'Concurrent',
        lastName: 'Test'
      };

      // Make two simultaneous registration requests
      const [response1, response2] = await Promise.allSettled([
        request(app).post('/api/auth/register').send(userData),
        request(app).post('/api/auth/register').send(userData)
      ]);

      // One should succeed, one should fail
      const responses = [response1, response2]
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as any).value);

      const successfulResponses = responses.filter(r => r.status === 201);
      const failedResponses = responses.filter(r => r.status === 409);

      expect(successfulResponses.length).toBe(1);
      expect(failedResponses.length).toBe(1);
    });

    it('should validate all authentication endpoints exist', async () => {
      // Test that all expected endpoints exist
      await request(app).post('/api/auth/register').expect(400); // Missing body
      await request(app).post('/api/auth/login').expect(400); // Missing body
      await request(app).get('/api/auth/me').expect(401); // Missing token
      await request(app).get('/api/users/profile').expect(401); // Missing token
      await request(app).get('/api/users/admin').expect(401); // Missing token
    });
  });
});