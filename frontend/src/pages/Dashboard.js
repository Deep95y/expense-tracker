import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import ExpenseChart from '../components/ExpenseChart';
import TransactionList from '../components/TransactionList';
import DateFilter from '../components/DateFilter';
import '../App.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [transactionsRes, summaryRes] = await Promise.all([
        axios.get('/api/transactions', { params }),
        axios.get('/api/transactions/summary', { params })
      ]);

      setTransactions(transactionsRes.data.transactions);
      setSummary(summaryRes.data.summary);
      setTotalSpending(summaryRes.data.totalSpending);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUploadSuccess = () => {
    setMessage('File uploaded successfully!');
    fetchData();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/api/reports/export/csv', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get('/api/reports/export/pdf', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting PDF');
    }
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Expense Tracker</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span>Welcome, {user?.name}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {message && (
          <div className={`card ${message.includes('Error') ? 'error' : 'success'}`} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Spending Summary</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleExportCSV}>
                Export CSV
              </button>
              <button className="btn btn-primary" onClick={handleExportPDF}>
                Export PDF
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#667eea' }}>
                Total Spending: ₹{totalSpending.toFixed(2)}
              </div>
              <ExpenseChart data={summary} />
            </>
          )}
        </div>

        <TransactionList
          transactions={transactions}
          loading={loading}
          onUpdate={fetchData}
        />
      </div>
    </div>
  );
};

export default Dashboard;

