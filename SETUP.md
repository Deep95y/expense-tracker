# Setup Guide

## Quick Start with Docker

1. **Clone/Navigate to the project directory:**
   ```bash
   cd expense-tracker
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Wait for services to be ready** (you'll see "Server running on port 5000" in logs)

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. **Create your first account:**
   - Click "Register" on the login page
   - Fill in name, email, and password
   - You'll be automatically logged in

6. **Upload a CSV file:**
   - Use the drag-and-drop area on the dashboard
   - CSV should have columns: date, description, amount

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Update .env with your database credentials:**
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expense_tracker
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

5. **Create the database:**
   ```bash
   # Using psql
   createdb expense_tracker
   
   # Or using PostgreSQL client
   psql -U postgres
   CREATE DATABASE expense_tracker;
   ```

6. **Run migrations:**
   ```bash
   npm run migrate
   ```

7. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **The app will open at http://localhost:3000**

## CSV Format

Your CSV file should have the following columns (case-insensitive):

**Required:**
- Date: `date`, `Date`, `DATE`, `transaction_date`, `Transaction Date`
- Amount: `amount`, `Amount`, `AMOUNT`, `debit`, `Debit`, `credit`, `Credit`

**Optional:**
- Description: `description`, `Description`, `DESCRIPTION`, `narration`, `Narration`, `remarks`

### Example CSV:

```csv
date,description,amount
2024-01-15,Grocery Store Purchase,1500.00
2024-01-16,Uber Ride to Office,250.00
2024-01-17,Restaurant Dinner,800.00
2024-01-18,Electricity Bill,1200.00
2024-01-19,Amazon Shopping,3500.00
```

## Troubleshooting

### Database Connection Issues

**Problem:** Backend can't connect to database

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   Check Services for PostgreSQL
   ```

2. Verify database credentials in `.env`
3. Check if database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

**Problem:** Port 5000 or 3000 already in use

**Solutions:**
1. Change port in `backend/.env` (for backend)
2. Change port in `frontend/package.json` scripts (for frontend)
3. Kill the process using the port:
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Docker Issues

**Problem:** Containers won't start

**Solutions:**
1. Check Docker is running:
   ```bash
   docker ps
   ```

2. Rebuild containers:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

3. Check logs:
   ```bash
   docker-compose logs backend
   docker-compose logs postgres
   ```

### CSV Upload Fails

**Problem:** CSV upload returns error

**Solutions:**
1. Check CSV format matches expected columns
2. Ensure dates are in valid format (YYYY-MM-DD)
3. Check file size is under 10MB
4. Verify file is actually CSV (not Excel)

### Migration Errors

**Problem:** Database migration fails

**Solutions:**
1. Drop and recreate database:
   ```bash
   psql -U postgres
   DROP DATABASE expense_tracker;
   CREATE DATABASE expense_tracker;
   ```

2. Run migration again:
   ```bash
   cd backend
   npm run migrate
   ```

## Production Deployment

### Environment Variables

Update these in production:
- `JWT_SECRET`: Use a strong, random secret
- `DB_PASSWORD`: Use a secure password
- `NODE_ENV`: Set to `production`

### Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Use environment-specific configs
- [ ] Enable rate limiting
- [ ] Set up monitoring

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS ECS, Google Cloud Run, or Heroku
- **Database**: AWS RDS, Google Cloud SQL, or managed PostgreSQL

## Support

For issues or questions, check:
1. README.md for general information
2. ARCHITECTURE.md for system design
3. Check application logs for errors

