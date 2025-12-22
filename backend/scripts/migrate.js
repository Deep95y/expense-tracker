const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

const migrationSQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_count INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Food & Dining', 'Restaurants, groceries, food delivery'),
  ('Transportation', 'Fuel, public transport, taxi, parking'),
  ('Utilities', 'Electricity, water, gas, internet, phone'),
  ('Shopping', 'Clothing, electronics, general shopping'),
  ('Entertainment', 'Movies, streaming, games, hobbies'),
  ('Healthcare', 'Medical, pharmacy, insurance'),
  ('Education', 'Courses, books, tuition'),
  ('Bills & Payments', 'Credit card, loans, subscriptions'),
  ('Travel', 'Hotels, flights, vacation expenses'),
  ('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;
`;

async function migrate() {
  try {
    console.log('Running database migrations...');
    await pool.query(migrationSQL);
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

