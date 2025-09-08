import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
config({ path: resolve(__dirname, '../../../.env') });

// Verify environment variables are loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Current working directory:', process.cwd());
  console.log('Looking for .env file at:', resolve(__dirname, '../../../.env'));
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL);

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
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

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']);

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
    `, ['customer@example.com', customerPassword, 'Test', 'Customer', 'customer']);

    // Create categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets', slug: 'electronics' },
      { name: 'Clothing', description: 'Fashion and apparel', slug: 'clothing' },
      { name: 'Books', description: 'Books and educational materials', slug: 'books' },
      { name: 'Home & Garden', description: 'Home improvement and garden supplies', slug: 'home-garden' }
    ];

    for (const category of categories) {
      await pool.query(`
        INSERT INTO categories (name, description, slug)
        VALUES ($1, $2, $3)
      `, [category.name, category.description, category.slug]);
    }

    // Create sample products
    const products = [
      {
        name: 'Wireless Headphones',
        description: 'High-quality wireless bluetooth headphones with noise cancellation',
        price: 199.99,
        sku: 'WH-001',
        category_id: 1,
        stock_quantity: 50,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
      },
      {
        name: 'Smartphone',
        description: 'Latest model smartphone with advanced features',
        price: 699.99,
        sku: 'SP-001',
        category_id: 1,
        stock_quantity: 25,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors',
        price: 24.99,
        sku: 'TS-001',
        category_id: 2,
        stock_quantity: 100,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'
      },
      {
        name: 'Programming Book',
        description: 'Learn modern web development with this comprehensive guide',
        price: 49.99,
        sku: 'BK-001',
        category_id: 3,
        stock_quantity: 30,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
      },
      {
        name: 'Garden Tools Set',
        description: 'Complete set of essential garden tools for home gardening',
        price: 89.99,
        sku: 'GT-001',
        category_id: 4,
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300'
      }
    ];

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (name, description, price, sku, category_id, stock_quantity, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [product.name, product.description, product.price, product.sku, product.category_id, product.stock_quantity, product.image_url]);
    }

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin login: admin@example.com / admin123');
    console.log('👤 Customer login: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedDatabase();
}