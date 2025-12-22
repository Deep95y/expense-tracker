import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../App.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Successfully uploaded ${response.data.transactionCount} transactions!`);
      if (onUploadSuccess) onUploadSuccess();
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please check your CSV format.');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Upload Bank Statement (CSV)</h2>
      
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : 'white',
          opacity: uploading ? 0.6 : 1
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <p>Uploading and processing...</p>
        ) : isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <div>
            <p>Drag & drop a CSV file here, or click to select</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              CSV should contain columns: date, description, amount (or similar variations)
            </p>
          </div>
        )}
      </div>

      {error && <div className="error" style={{ marginTop: '15px' }}>{error}</div>}
      {success && <div className="success" style={{ marginTop: '15px' }}>{success}</div>}
    </div>
  );
};

export default FileUpload;

