import React from 'react';
import '../App.css';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '15px' }}>Filter by Date Range</h3>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <div style={{ alignSelf: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleClear}>
            Clear Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;

