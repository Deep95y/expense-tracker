# Expense Tracker - Fintech Expense Classification & Reporting Tool

A full-stack web application for uploading bank statements (CSV), automatically categorizing expenses, and visualizing spending patterns.

## Features

- 🔐 User Authentication (Sign-up, Login, Logout)
- 📤 CSV Upload with drag-and-drop support
- 🤖 Automatic Expense Categorization
- 📊 Interactive Dashboard with Charts
- 📅 Date Range Filtering
- 📥 Export to CSV/PDF
- 🎨 Responsive Design
- 🐳 Dockerized Application

## Tech Stack

### Frontend
- React 18
- React Router
- Axios
- Recharts (for visualizations)
- React Dropzone

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Multer (file upload)
- CSV Parser
- PDFKit (PDF generation)

### Infrastructure
- Docker & Docker Compose
- Nginx (for frontend serving)

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼─────────────────┐
│   Nginx (Frontend)      │
│   - Serves React App    │
│   - Proxies API calls   │
└──────┬──────────────────┘
       │
       │ /api/*
       │
┌──────▼──────────────────┐
│   Express Backend       │
│   - REST API            │
│   - JWT Auth            │
│   - File Processing     │
└──────┬──────────────────┘
       │
       │ SQL Queries
       │
┌──────▼──────────────────┐
│   PostgreSQL Database   │
│   - Users               │
│   - Transactions        │
│   - Categories          │
└─────────────────────────┘
```

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `name` (VARCHAR)
- `created_at`, `updated_at` (TIMESTAMP)

### Categories Table
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR, UNIQUE)
- `description` (TEXT)

### Transactions Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `date` (DATE)
- `description` (TEXT)
- `amount` (DECIMAL)
- `category_id` (INTEGER, FK to categories)
- `transaction_type` (VARCHAR: 'debit' or 'credit')
- `created_at`, `updated_at` (TIMESTAMP)

### Uploads Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER, FK to users)
- `filename` (VARCHAR)
- `uploaded_at` (TIMESTAMP)
- `transaction_count` (INTEGER)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Transactions
- `GET /api/transactions` - Get transactions (with filters: startDate, endDate, categoryId, type)
- `GET /api/transactions/summary` - Get spending summary by category
- `PUT /api/transactions/:id/category` - Update transaction category
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories

### Upload
- `POST /api/upload` - Upload CSV file (multipart/form-data)

### Reports
- `GET /api/reports/export/csv` - Export transactions as CSV
- `GET /api/reports/export/pdf` - Export transactions as PDF

## Setup & Installation

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
cd expense-tracker
```

2. Create environment file:
```bash
cp backend/.env.example backend/.env
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Local Development

1. Install dependencies:
```bash
npm run install-all
```

2. Set up PostgreSQL database:
- Create database: `expense_tracker`
- Update `backend/.env` with your database credentials

3. Run migrations:
```bash
cd backend
npm run migrate
```

4. Start backend:
```bash
cd backend
npm run dev
```

5. Start frontend (in another terminal):
```bash
cd frontend
npm start
```

## CSV Format

The application accepts CSV files with the following expected columns (flexible naming):
- **Date**: `date`, `Date`, `DATE`, `transaction_date`, `Transaction Date`
- **Description**: `description`, `Description`, `DESCRIPTION`, `narration`, `Narration`, `remarks`
- **Amount**: `amount`, `Amount`, `AMOUNT`, `debit`, `Debit`, `credit`, `Credit`, `balance`, `Balance`

Example CSV:
```csv
date,description,amount
2024-01-15,Grocery Store,1500.00
2024-01-16,Uber Ride,250.00
2024-01-17,Restaurant,800.00
```

## Edge Cases Handled

1. **Malformed CSV**: Validates date formats, amounts, and required fields
2. **Duplicate Transactions**: Uses `ON CONFLICT DO NOTHING` to prevent duplicates
3. **Session Expiration**: JWT token validation with proper error messages
4. **Large Files**: 10MB file size limit with streaming processing
5. **Missing Categories**: Transactions without matches default to "Other"
6. **Invalid Data**: Skips invalid rows and reports errors

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] CSV file upload
- [ ] Transaction categorization
- [ ] Date range filtering
- [ ] Category editing
- [ ] Transaction deletion
- [ ] CSV export
- [ ] PDF export
- [ ] Chart visualization

## Deployment

### Environment Variables
Update `docker-compose.yml` or create `.env` files with production values:
- `JWT_SECRET`: Strong secret key
- `DB_PASSWORD`: Secure database password
- `NODE_ENV`: Set to `production`

### Production Considerations
1. Use environment-specific configuration
2. Enable HTTPS/SSL
3. Set up database backups
4. Configure CORS properly
5. Use secrets management
6. Set up monitoring and logging

## Self-Assessment

### Key Design Choices

1. **Simple Keyword-Based Categorization**: Chose a straightforward approach over ML for MVP, making it easy to extend later
2. **RESTful API**: Standard REST endpoints for simplicity and ease of integration
3. **PostgreSQL**: Relational database for structured financial data with ACID compliance
4. **JWT Authentication**: Stateless authentication suitable for scalable applications
5. **Docker Compose**: Single-command deployment for all services

### What Worked Well

- Clean separation of concerns (frontend/backend)
- Flexible CSV parsing handles various formats
- Responsive UI with good UX
- Comprehensive error handling
- Docker setup simplifies deployment

### Areas for Improvement

1. **Categorization**: Implement ML-based categorization for better accuracy
2. **Testing**: Add automated unit and integration tests
3. **Performance**: Add pagination, caching, and database query optimization
4. **Security**: Add rate limiting, input sanitization, and security headers
5. **Features**: Budget tracking, recurring expenses, multi-currency support
6. **Monitoring**: Add logging, error tracking (e.g., Sentry), and analytics

### Difficulties & Solutions

1. **CSV Format Variations**: Solved by flexible column name matching
2. **Transaction Deduplication**: Used database constraints and conflict handling
3. **File Upload Size**: Implemented streaming and file size limits
4. **Date Parsing**: Added multiple date format support with validation

## License

ISC

## Author

Created as a full-stack fintech application demonstration.

