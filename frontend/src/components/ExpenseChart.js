import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

const ExpenseChart = ({ data }) => {
  const chartData = data.filter(item => parseFloat(item.total_amount) > 0);

  if (chartData.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No expense data available</div>;
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>By Category (Pie)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>By Category (Bar)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category_name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
              <Bar dataKey="total_amount" fill="#667eea">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Category Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {chartData.map((item, index) => (
            <div
              key={item.category_id}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: COLORS[index % COLORS.length],
                color: 'white'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.category_name}</div>
              <div>₹{parseFloat(item.total_amount).toFixed(2)}</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                {item.transaction_count} transaction{item.transaction_count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;

