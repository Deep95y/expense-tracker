const { pool } = require('../config/database');

const migrationSQL = `
-- Add notes column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for better search performance (if needed in future)
-- CREATE INDEX IF NOT EXISTS idx_transactions_notes ON transactions USING gin(to_tsvector('english', notes));
`;

async function migrate() {
  try {
    console.log('Running transaction notes migration...');
    await pool.query(migrationSQL);
    console.log('Transaction notes column added successfully!');
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

