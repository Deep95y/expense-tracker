const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { categorizeTransaction } = require('../services/categorizer');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Upload and parse CSV
router.post('/', authenticateToken, upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const userId = req.user.id;
  const filename = req.file.originalname;
  let transactionCount = 0;
  const errors = [];

  try {
    // Parse CSV
    const transactions = [];
    const buffer = req.file.buffer;
    const stream = Readable.from(buffer.toString());

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Handle different CSV formats
            // Expected columns: date, description, amount (or similar variations)
            const dateStr = row.date || row.Date || row.DATE || row.transaction_date || row['Transaction Date'];
            const desc = row.description || row.Description || row.DESCRIPTION || row.narration || row.Narration || row.remarks || '';
            const amountStr = row.amount || row.Amount || row.AMOUNT || row.debit || row.Debit || row.credit || row.Credit || row.balance || row.Balance;
            
            if (!dateStr || !amountStr) {
              errors.push(`Row skipped: Missing date or amount - ${JSON.stringify(row)}`);
              return;
            }

            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              errors.push(`Row skipped: Invalid date format - ${dateStr}`);
              return;
            }

            // Determine transaction type and amount
            let amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
            let transactionType = 'debit';
            
            // If amount is negative, it's a debit; positive might be credit
            if (amount > 0 && (row.credit || row.Credit)) {
              transactionType = 'credit';
            } else if (amount < 0) {
              amount = Math.abs(amount);
              transactionType = 'debit';
            } else if (amount > 0 && (row.debit || row.Debit)) {
              transactionType = 'debit';
            }

            if (isNaN(amount) || amount === 0) {
              errors.push(`Row skipped: Invalid amount - ${amountStr}`);
              return;
            }

            // Categorize transaction
            const categoryName = categorizeTransaction(desc);

            transactions.push({
              date: date.toISOString().split('T')[0],
              description: desc.trim() || 'Unknown',
              amount,
              transactionType,
              categoryName
            });
          } catch (error) {
            errors.push(`Row parsing error: ${error.message}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (transactions.length === 0) {
      return res.status(400).json({ 
        message: 'No valid transactions found in CSV',
        errors 
      });
    }

    // Get category IDs
    const categoryMap = new Map();
    const categoryResult = await pool.query('SELECT id, name FROM categories');
    categoryResult.rows.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // Insert transactions in a transaction (database transaction)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert upload record
      const uploadResult = await client.query(
        'INSERT INTO uploads (user_id, filename, transaction_count) VALUES ($1, $2, $3) RETURNING id',
        [userId, filename, transactions.length]
      );
      const uploadId = uploadResult.rows[0].id;

      // Insert transactions (skip duplicates based on user_id, date, description, amount)
      for (const txn of transactions) {
        const categoryId = categoryMap.get(txn.categoryName) || null;
        
        // Check if transaction already exists
        const existing = await client.query(
          `SELECT id FROM transactions 
           WHERE user_id = $1 AND date = $2 AND description = $3 AND amount = $4`,
          [userId, txn.date, txn.description, txn.amount]
        );
        
        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO transactions (user_id, date, description, amount, category_id, transaction_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, txn.date, txn.description, txn.amount, categoryId, txn.transaction_type]
          );
        }
      }

      await client.query('COMMIT');
      transactionCount = transactions.length;

      res.json({
        message: 'File uploaded and processed successfully',
        uploadId,
        transactionCount,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Upload error:', error);
    next(new Error(`Failed to process CSV: ${error.message}`));
  }
});

module.exports = router;

