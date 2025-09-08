import { pool } from '../src/config/database';
import bcrypt from 'bcryptjs';

export const clearDatabase = async () => {
  // Clear ALL data in proper order (respecting foreign key constraints)
  await pool.query('DELETE FROM cart_items');
  await pool.query('DELETE FROM order_items'); 
  await pool.query('DELETE FROM orders');
  await pool.query('DELETE FROM products');
  await pool.query('DELETE FROM categories');
  await pool.query('DELETE FROM users');
  
  // Reset sequences
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE categories_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE products_id_seq RESTART WITH 1');
};

export const createTestUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'admin';
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const result = await pool.query(
    `INSERT INTO users (email, password, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
    [
      userData.email.toLowerCase(),
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.role || 'customer'
    ]
  );
  return result.rows[0];
};

export const generateTestUsers = async () => {
  const adminUser = await createTestUser({
    email: 'testadmin@example.com',
    password: 'admin123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin'
  });

  const customerUser = await createTestUser({
    email: 'testcustomer@example.com',
    password: 'customer123',
    firstName: 'Test',
    lastName: 'Customer',
    role: 'customer'
  });

  return { adminUser, customerUser };
};

// Helper to close database connections properly in tests
export const closeDatabase = async () => {
  await pool.end();
};