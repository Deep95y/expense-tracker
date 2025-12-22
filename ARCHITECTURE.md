# Architecture Documentation

## System Architecture

### High-Level Overview

The Expense Tracker application follows a three-tier architecture:

1. **Presentation Layer** (React Frontend)
2. **Application Layer** (Node.js/Express Backend)
3. **Data Layer** (PostgreSQL Database)

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application (SPA)                  │  │
│  │  - Authentication Pages                               │  │
│  │  - Dashboard with Charts                             │  │
│  │  - File Upload Component                             │  │
│  │  - Transaction Management                            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  - Serves static React build files                          │
│  - Proxies /api/* requests to backend                      │
│  - Handles CORS and routing                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ /api/*
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              Express.js Backend Server                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication Middleware (JWT)                       │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Route Handlers                                │   │  │
│  │  │  - /api/auth (register, login)                │   │  │
│  │  │  - /api/upload (CSV processing)                │   │  │
│  │  │  - /api/transactions (CRUD operations)        │   │  │
│  │  │  - /api/categories (read)                      │   │  │
│  │  │  - /api/reports (export CSV/PDF)               │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Business Logic                               │   │  │
│  │  │  - CSV Parser                                 │   │  │
│  │  │  - Expense Categorizer                        │   │  │
│  │  │  - PDF Generator                              │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                             │  │
│  │  - users (authentication)                            │  │
│  │  - categories (expense categories)                   │  │
│  │  - transactions (financial records)                  │  │
│  │  - uploads (file upload history)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration/Login Flow

```
User → Frontend → POST /api/auth/register|login
                → Backend validates credentials
                → Hashes password (bcrypt)
                → Stores in PostgreSQL
                → Returns JWT token
                → Frontend stores token
                → Redirects to dashboard
```

### 2. CSV Upload & Processing Flow

```
User → Frontend (FileUpload component)
    → POST /api/upload (multipart/form-data)
    → Backend receives file
    → Multer stores in memory
    → CSV Parser streams through file
    → For each row:
      - Parse date, description, amount
      - Categorize using keyword matching
      - Validate data
    → Database transaction:
      - Insert upload record
      - Insert all transactions
    → Return success with count
    → Frontend refreshes dashboard
```

### 3. Dashboard Data Loading Flow

```
User → Frontend (Dashboard component)
    → GET /api/transactions (with filters)
    → GET /api/transactions/summary
    → Backend queries PostgreSQL
    → Returns JSON data
    → Frontend renders:
      - Charts (Recharts)
      - Transaction list
      - Summary cards
```

### 4. Export Flow

```
User → Frontend clicks Export
    → GET /api/reports/export/csv|pdf
    → Backend queries transactions
    → Generates CSV/PDF
    → Returns as blob
    → Frontend triggers download
```

## Security Considerations

1. **Authentication**: JWT tokens with 7-day expiration
2. **Password Security**: bcrypt hashing with salt rounds
3. **File Upload**: File type validation, size limits (10MB)
4. **SQL Injection**: Parameterized queries (pg library)
5. **CORS**: Configured for frontend origin
6. **Input Validation**: Server-side validation for all inputs

## Technology Choices & Rationale

### Frontend: React
- **Why**: Component-based, large ecosystem, good performance
- **Alternatives Considered**: Vue.js, Angular
- **Trade-off**: Simpler than Angular, more mature than Vue

### Backend: Node.js/Express
- **Why**: JavaScript across stack, fast development, good ecosystem
- **Alternatives Considered**: Python (FastAPI), Go
- **Trade-off**: Single language, but less performant than Go

### Database: PostgreSQL
- **Why**: ACID compliance, relational structure, robust for financial data
- **Alternatives Considered**: MongoDB, MySQL
- **Trade-off**: More structured than MongoDB, more features than MySQL

### Authentication: JWT
- **Why**: Stateless, scalable, works well with SPAs
- **Alternatives Considered**: Session-based, OAuth
- **Trade-off**: Simpler than OAuth, but tokens can't be revoked easily

### File Processing: In-memory (Multer)
- **Why**: Fast for small-medium files, simple implementation
- **Alternatives Considered**: File system storage, S3
- **Trade-off**: Limited by memory, but simpler for MVP

## Scalability Considerations

### Current Limitations
- Single database instance
- No caching layer
- No load balancing
- In-memory file processing

### Future Improvements
1. **Database**: Read replicas, connection pooling
2. **Caching**: Redis for frequently accessed data
3. **File Storage**: S3 or similar for large files
4. **Load Balancing**: Multiple backend instances
5. **CDN**: For static assets
6. **Queue System**: For async CSV processing

## Deployment Architecture

### Docker Compose Setup
- **postgres**: Database service
- **backend**: Node.js API server
- **frontend**: Nginx serving React build

### Production Recommendations
1. Use managed PostgreSQL (AWS RDS, Azure Database)
2. Deploy frontend to CDN (Vercel, Netlify)
3. Deploy backend to container service (ECS, Kubernetes)
4. Use secrets management (AWS Secrets Manager)
5. Enable HTTPS with SSL certificates
6. Set up monitoring (CloudWatch, Datadog)

## API Design Principles

1. **RESTful**: Standard HTTP methods and status codes
2. **Stateless**: Each request contains all necessary information
3. **Resource-based URLs**: `/api/transactions`, `/api/categories`
4. **JSON**: Request/response format
5. **Error Handling**: Consistent error response format
6. **Pagination**: For large datasets (limit/offset)

## Error Handling Strategy

1. **Client Errors (4xx)**: Validation, authentication, not found
2. **Server Errors (5xx)**: Database errors, unexpected exceptions
3. **Error Format**: `{ message: string, ...additionalInfo }`
4. **Logging**: Console logging (production: structured logging)

## Testing Strategy

### Unit Tests (Future)
- Categorization logic
- CSV parsing
- Authentication middleware

### Integration Tests (Future)
- API endpoints
- Database operations
- File upload flow

### E2E Tests (Future)
- User registration → upload → view dashboard
- Export functionality
- Category editing

