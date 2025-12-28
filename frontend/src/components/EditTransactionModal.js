import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const EditTransactionModal = ({ transaction, categories, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    categoryId: '',
    transactionType: 'debit',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        date: transaction.date || '',
        description: transaction.description || '',
        amount: transaction.amount || '',
        categoryId: transaction.category_id || '',
        transactionType: transaction.transaction_type || 'debit',
        notes: transaction.notes || ''
      });
      setError('');
    }
  }, [transaction, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        date: formData.date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId || null,
        transactionType: formData.transactionType,
        notes: formData.notes || null
      };

      await axios.put(`/api/transactions/${transaction.id}`, updateData);
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>Edit Transaction</h2>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '5px 15px' }}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="label">Date *</label>
          <input
            type="date"
            name="date"
            className="input"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <label className="label">Description *</label>
          <input
            type="text"
            name="description"
            className="input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Transaction description"
            required
          />

          <label className="label">Amount *</label>
          <input
            type="number"
            name="amount"
            className="input"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />

          <label className="label">Transaction Type *</label>
          <select
            name="transactionType"
            className="input"
            value={formData.transactionType}
            onChange={handleChange}
            required
          >
            <option value="debit">Debit (Expense)</option>
            <option value="credit">Credit (Income)</option>
          </select>

          <label className="label">Category</label>
          <select
            name="categoryId"
            className="input"
            value={formData.categoryId}
            onChange={handleChange}
          >
            <option value="">Select a category (optional)</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label className="label">Notes</label>
          <textarea
            name="notes"
            className="input"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any additional notes about this transaction..."
            rows="4"
            style={{ resize: 'vertical' }}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;

