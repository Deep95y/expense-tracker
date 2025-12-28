import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditTransactionModal from './EditTransactionModal';
import '../App.css';

const TransactionList = ({ transactions, loading, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setSelectedCategory(transaction.category_id || '');
  };

  const handleFullEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDuplicate = async (transaction) => {
    if (!window.confirm('Duplicate this transaction?')) {
      return;
    }

    try {
      await axios.post(`/api/transactions/${transaction.id}/duplicate`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error duplicating transaction:', error);
      alert('Failed to duplicate transaction');
    }
  };

  const handleSave = async (transactionId) => {
    try {
      await axios.put(`/api/transactions/${transactionId}/category`, {
        categoryId: selectedCategory || null
      });
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleEditModalSave = () => {
    if (onUpdate) onUpdate();
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await axios.delete(`/api/transactions/${transactionId}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Recent Transactions</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Recent Transactions</h2>
      
      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No transactions found. Upload a CSV file to get started.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Notes</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{txn.date}</td>
                  <td style={{ padding: '12px', maxWidth: '250px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={txn.description}>
                      {txn.description}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: txn.transaction_type === 'debit' ? '#dc3545' : '#28a745' }}>
                    ₹{parseFloat(txn.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: txn.transaction_type === 'debit' ? '#fee' : '#efe',
                      color: txn.transaction_type === 'debit' ? '#c33' : '#3c3'
                    }}>
                      {txn.transaction_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === txn.id ? (
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="">Uncategorized</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{txn.category_name || 'Uncategorized'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', maxWidth: '200px' }}>
                    {txn.notes ? (
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        color: '#666'
                      }} title={txn.notes}>
                        {txn.notes}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingId === txn.id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleSave(txn.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleFullEdit(txn)}
                          title="Edit full transaction"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleDuplicate(txn)}
                          title="Duplicate this transaction"
                        >
                          Duplicate
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          onClick={() => handleDelete(txn.id)}
                          title="Delete transaction"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditTransactionModal
        transaction={editingTransaction}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSave={handleEditModalSave}
      />
    </div>
  );
};

export default TransactionList;

