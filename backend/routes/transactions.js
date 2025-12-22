const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transactions for user with filters
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, categoryId, type, limit = 100, offset = 0 } = req.query;

    let query = `
      SELECT 
        t.id,
        t.date,
        t.description,
        t.amount,
        t.transaction_type,
        t.created_at,
        c.id as category_id,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (type) {
      query += ` AND t.transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY t.date DESC, t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countParams = [userId];
    let countParamIndex = 2;

    if (startDate) {
      countQuery += ` AND date >= $${countParamIndex}`;
      countParams.push(startDate);
      countParamIndex++;
    }
    if (endDate) {
      countQuery += ` AND date <= $${countParamIndex}`;
      countParams.push(endDate);
      countParamIndex++;
    }
    if (categoryId) {
      countQuery += ` AND category_id = $${countParamIndex}`;
      countParams.push(categoryId);
      countParamIndex++;
    }
    if (type) {
      countQuery += ` AND transaction_type = $${countParamIndex}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction summary (spending by category)
router.get('/summary', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id) as transaction_count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = $1 AND t.transaction_type = 'debit'
    `;
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY c.id, c.name ORDER BY total_amount DESC`;

    const result = await pool.query(query, params);

    // Get total spending
    let totalQuery = `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND transaction_type = 'debit'
    `;
    const totalParams = [userId];
    let totalParamIndex = 2;

    if (startDate) {
      totalQuery += ` AND date >= $${totalParamIndex}`;
      totalParams.push(startDate);
      totalParamIndex++;
    }
    if (endDate) {
      totalQuery += ` AND date <= $${totalParamIndex}`;
      totalParams.push(endDate);
    }

    const totalResult = await pool.query(totalQuery, totalParams);

    res.json({
      summary: result.rows,
      totalSpending: parseFloat(totalResult.rows[0].total)
    });
  } catch (error) {
    next(error);
  }
});

// Update transaction category
router.put('/:id/category', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;
    const { categoryId } = req.body;

    // Verify transaction belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update category
    const result = await pool.query(
      'UPDATE transactions SET category_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
      [categoryId || null, transactionId, userId]
    );

    res.json({ message: 'Category updated', transaction: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [transactionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

