const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Export transactions as CSV
router.get('/export/csv', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, categoryId } = req.query;

    let query = `
      SELECT 
        t.date,
        t.description,
        t.amount,
        t.transaction_type,
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
    }

    query += ` ORDER BY t.date DESC`;

    const result = await pool.query(query, params);

    // Generate CSV
    const csvHeader = 'Date,Description,Amount,Type,Category\n';
    const csvRows = result.rows.map(row => {
      return [
        row.date,
        `"${row.description.replace(/"/g, '""')}"`,
        row.amount,
        row.transaction_type,
        row.category_name || 'Uncategorized'
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Export transactions as PDF
router.get('/export/pdf', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        t.date,
        t.description,
        t.amount,
        t.transaction_type,
        c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.transaction_type = 'debit'
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
    }

    query += ` ORDER BY t.date DESC`;

    const result = await pool.query(query, params);

    // Get summary by category
    let summaryQuery = `
      SELECT 
        c.name as category_name,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = $1 AND t.transaction_type = 'debit'
    `;
    const summaryParams = [userId];
    let summaryParamIndex = 2;

    if (startDate) {
      summaryQuery += ` AND t.date >= $${summaryParamIndex}`;
      summaryParams.push(startDate);
      summaryParamIndex++;
    }
    if (endDate) {
      summaryQuery += ` AND t.date <= $${summaryParamIndex}`;
      summaryParams.push(endDate);
    }

    summaryQuery += ` GROUP BY c.name HAVING COALESCE(SUM(t.amount), 0) > 0 ORDER BY total_amount DESC`;

    const summaryResult = await pool.query(summaryQuery, summaryParams);

    // Generate PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expense-report-${Date.now()}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Expense Report', { align: 'center' });
    doc.moveDown();

    if (startDate || endDate) {
      doc.fontSize(12).text(`Period: ${startDate || 'Beginning'} to ${endDate || 'Today'}`, { align: 'center' });
      doc.moveDown();
    }

    // Summary
    doc.fontSize(16).text('Summary by Category', { underline: true });
    doc.moveDown(0.5);

    let totalSpending = 0;
    summaryResult.rows.forEach(row => {
      totalSpending += parseFloat(row.total_amount);
      doc.fontSize(10).text(`${row.category_name}: ₹${parseFloat(row.total_amount).toFixed(2)}`);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total Spending: ₹${totalSpending.toFixed(2)}`, { bold: true });
    doc.moveDown(2);

    // Transactions
    doc.fontSize(16).text('Transaction Details', { underline: true });
    doc.moveDown(0.5);

    result.rows.forEach((row, index) => {
      if (index > 0 && index % 20 === 0) {
        doc.addPage();
      }
      doc.fontSize(9).text(
        `${row.date} | ${row.description.substring(0, 40)} | ₹${row.amount} | ${row.category_name || 'Uncategorized'}`,
        { width: 500 }
      );
    });

    doc.end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

