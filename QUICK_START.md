# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start the Application
```bash
docker-compose up --build
```

### Step 2: Wait for Services
Wait until you see:
```
Server running on port 5000
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

## 📝 First Steps

1. **Register an Account**
   - Click "Register" on the login page
   - Enter your name, email, and password
   - You'll be automatically logged in

2. **Upload a CSV File**
   - Use the drag-and-drop area on the dashboard
   - Or click to select a file
   - See `sample-transactions.csv` for format example

3. **View Your Expenses**
   - See charts and summaries automatically
   - Filter by date range
   - Edit categories for transactions
   - Export to CSV or PDF

## 📊 CSV Format

Your CSV should have these columns:
- `date` (YYYY-MM-DD format)
- `description` (transaction description)
- `amount` (numeric value)

Example:
```csv
date,description,amount
2024-01-15,Grocery Store,1500.00
2024-01-16,Uber Ride,250.00
```

## 🛠️ Troubleshooting

**Can't connect?**
- Make sure Docker is running
- Check ports 3000 and 5000 are available
- View logs: `docker-compose logs`

**Upload fails?**
- Check CSV format matches expected columns
- Ensure dates are valid (YYYY-MM-DD)
- File size must be under 10MB

**Need help?**
- See SETUP.md for detailed setup
- See README.md for full documentation
- See ARCHITECTURE.md for system design

## 🎯 Features

✅ User Authentication  
✅ CSV Upload with Drag & Drop  
✅ Automatic Expense Categorization  
✅ Interactive Charts & Visualizations  
✅ Date Range Filtering  
✅ Export to CSV/PDF  
✅ Transaction Management  
✅ Responsive Design  

Enjoy tracking your expenses! 💰

