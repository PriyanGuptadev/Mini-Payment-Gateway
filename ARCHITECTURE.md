# System Architecture

## 📋 Overview

The Mini Payment Gateway is built using a modern, scalable architecture with clear separation of concerns. It follows RESTful API design principles and implements security best practices from the start.

## 🏗️ High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Web Browser     │  │  Mobile App      │                │
│  │  (React/Next.js) │  │  (React Native)  │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
└───────────┼──────────────────────┼────────────────────────────┘
            │                      │
            │      HTTPS           │
            └──────────┬───────────┘
                       │
┌──────────────────────▼────────────────────────────────────────┐
│                  API Gateway / Load Balancer                  │
│                    (Rate Limiting, CORS)                      │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│              Express.js API Server                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Module  │  │ Merchant     │  │ Transaction  │       │
│  │              │  │ Module       │  │ Module       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           Middleware Stack                          │    │
│  │  ├─ CORS & Security Headers (Helmet)              │    │
│  │  ├─ Authentication (JWT)                          │    │
│  │  ├─ Rate Limiting                                 │    │
│  │  ├─ Input Validation (Joi)                        │    │
│  │  ├─ HMAC Signature Verification                   │    │
│  │  └─ Error Handling                                │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ Mongoose ODM
                     │
┌────────────────────▼─────────────────────────────────────────┐
│                  MongoDB Database                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Users        │  │ Merchants    │  │ Transactions │       │
│  │ Collection   │  │ Collection   │  │ Collection   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  With Indexes & TTL Policies                                 │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
payment-gateway/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app configuration
│   │   ├── server.ts              # Server entry point
│   │   ├── routes.ts              # Route aggregation
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts             # Environment variables
│   │   │   └── db.ts              # MongoDB connection
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts       # JWT verification
│   │   │   ├── rateLimit.middleware.ts  # Rate limiting
│   │   │   └── hmac.middleware.ts       # HMAC verification
│   │   │
│   │   ├── models/
│   │   │   ├── User.model.ts      # User schema
│   │   │   ├── Merchant.model.ts  # Merchant schema
│   │   │   └── Transaction.model.ts # Transaction schema
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts    # Request handlers
│   │   │   │   ├── auth.service.ts       # Business logic
│   │   │   │   ├── auth.routes.ts        # Route definitions
│   │   │   │   └── auth.validation.ts    # Input schemas
│   │   │   │
│   │   │   ├── merchant/
│   │   │   │   ├── merchant.controller.ts
│   │   │   │   ├── merchant.service.ts
│   │   │   │   ├── merchant.routes.ts
│   │   │   │   └── merchant.validation.ts
│   │   │   │
│   │   │   └── transaction/
│   │   │       ├── transaction.controller.ts
│   │   │       ├── transaction.service.ts
│   │   │       ├── transaction.routes.ts
│   │   │       └── transaction.validation.ts
│   │   │
│   │   └── utils/
│   │       ├── jwt.ts              # JWT operations
│   │       ├── password.ts         # Password hashing
│   │       └── crypto.ts           # Encryption & HMAC
│   │
│   ├── tests/
│   │   ├── setup.ts                # Test configuration
│   │   ├── utils/
│   │   │   ├── security.test.ts
│   │   │   └── jwt.test.ts
│   │   └── validation/
│   │       └── input-validation.test.ts
│   │
│   ├── .env.example
│   ├── jest.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── MerchantDashboard.tsx
│   │   │   │   ├── ApiCredentials.tsx
│   │   │   │   └── TransactionList.tsx
│   │   │   │
│   │   │   └── Checkout/
│   │   │       ├── CheckoutPage.tsx
│   │   │       └── CheckoutForm.tsx
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   └── MerchantContext.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts              # Axios instance & helpers
│   │   │   ├── auth.service.ts
│   │   │   └── merchant.service.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── hmac.ts
│   │   │   └── validation.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── API_DOCS/
│   └── postman-collection.json
├── README.md
├── ARCHITECTURE.md
├── SECURITY.md
└── .gitignore
```

## 🔄 Data Flow & Request Lifecycle

### Authentication Flow

```
User Registration/Login Request
         │
         ▼
Input Validation (Joi)
         │
         ▼
Email & Password Check
         │
         ▼
Password Hashing (Bcrypt)
         │
         ▼
Database Query (Users Collection)
         │
         ▼
JWT Token Generation
├─ Access Token (15 min)
└─ Refresh Token (7 days)
         │
         ▼
Send to Client (Secure Cookie + Response)
         │
         ▼
Client Stores Tokens
```

### Transaction Creation Flow

```
POST /api/transactions/checkout
         │
         ▼
JWT Verification Middleware
         │
         ▼
Get Merchant from Database
         │
         ▼
Input Validation (Joi)
         │
         ▼
Generate Transaction Reference ID (UUID)
         │
         ▼
Create HMAC Signature
├─ Message: merchant_id|reference_id|amount|currency|email
└─ Secret: merchant.api_secret
         │
         ▼
Store in Database
├─ merchant_id: ObjectId
├─ amount: Number
├─ currency: String
├─ status: "pending"
├─ signature: String (HMAC)
└─ reference_id: UUID
         │
         ▼
Return Transaction Details to Client
```

### Payment Processing Flow

```
POST /api/transactions/pay
         │
         ▼
JWT & Merchant Verification
         │
         ▼
Get Transaction from Database
         │
         ▼
Validate Transaction Status (must be "pending")
         │
         ▼
Process Payment (Mock)
├─ 90% success rate
└─ 10% failure rate
         │
         ▼
Update Transaction Status
├─ Status: "completed" or "failed"
└─ Updated timestamp
         │
         ▼
Return Updated Transaction
```

## 🔐 Security Architecture

### Authentication & Authorization Layer

```
Request
  │
  ├─ Public Routes (register, login, health) → Direct access
  │
  └─ Protected Routes
       │
       ├─ Extract Bearer token from Authorization header
       │
       ├─ Verify JWT signature
       │
       ├─ Check token expiration
       │
       ├─ Extract userId & role from payload
       │
       └─ Pass to next middleware/handler
```

### Data Encryption Strategy

```
Sensitive Data (API Secrets, etc.)
       │
       ├─ At Application Level:
       │  └─ AES-256-GCM encryption before database storage
       │
       └─ At Database Level:
          ├─ Indexed for queries
          ├─ Encrypted in backup
          └─ Decrypted only when needed
```

### Request Signing with HMAC

```
Client Side:
Message = "METHOD|PATH|BODY|TIMESTAMP"
Signature = HMAC-SHA256(Message, API_SECRET)

Server Side:
Received Message = "METHOD|PATH|BODY|TIMESTAMP"
Computed Signature = HMAC-SHA256(Message, Stored_API_SECRET)

Result = Signature == Computed_Signature ? Valid : Invalid
```

## 🗄️ Database Design

### Normalization Strategy

- **Users**: Stores authentication and profile information
- **Merchants**: One-to-many relationship with Users
- **Transactions**: Many-to-many relationship with Merchants

### Indexing Strategy

```javascript
// Users
{ email: 1, status: 1 }        

// Merchants
{ user_id: 1, status: 1 }         
{ api_key: 1 }                   

// Transactions
{ merchant_id: 1, status: 1 }    
{ merchant_id: 1, created_at: -1 }
{ created_at: 1 }                
```

### TTL (Time-To-Live) Index

Automatically deletes old pending transactions after 30 days:

```javascript
db.transactions.createIndex(
  { created_at: 1 },
  {
    expireAfterSeconds: 2592000,
    partialFilterExpression: { status: "pending" }
  }
)
```

## 🔍 API Design Principles

### RESTful Conventions

```
POST   /api/auth/register          Create user
POST   /api/auth/login             Authenticate
POST   /api/auth/refresh           Refresh token
GET    /api/auth/profile           Get current user

POST   /api/merchants              Create merchant
GET    /api/merchants              Get merchant details
POST   /api/merchants/rotate-credentials  Rotate keys
PUT    /api/merchants/webhook      Update webhook
GET    /api/merchants/stats        Get statistics

POST   /api/transactions/checkout  Create transaction
POST   /api/transactions/pay       Process payment
GET    /api/transactions/history   List transactions
GET    /api/transactions/:id       Get transaction details
GET    /api/transactions/summary   Get statistics
```

### Response Format

Success Response (200-201):
```json
{
  "data": { /* response data */ },
  "message": "Success message"
}
```

Error Response (4xx-5xx):
```json
{
  "error": "Error message",
  "details": [ /* optional */ ]
}
```

## 🧪 Testing Architecture

### Unit Testing Layers

```
Security Functions (Crypto, JWT, Password)
           │
           ├─ Encryption/Decryption
           ├─ HMAC Signature
           ├─ Password Hashing
           └─ Token Generation/Verification

Input Validation
           │
           ├─ Email Format
           ├─ Password Strength
           ├─ Transaction Amount
           └─ Schema Compliance
```

### Test Coverage Goals

- Security Functions: 100%
- Input Validation: 100%
- Authentication: 95%
- Business Logic: 80%

## 🚀 Scalability Considerations

### Current Architecture Limitations

1. **Rate Limiting**: In-memory store
   - **Solution**: Redis for distributed systems

2. **Session Management**: No session persistence
   - **Solution**: Redis or MongoDB sessions

3. **Message Queues**: Synchronous processing
   - **Solution**: RabbitMQ/Kafka for async tasks

4. **Logging**: Console output
   - **Solution**: ELK Stack, DataDog, or Splunk

### Scaling Strategy

```
Phase 1: Vertical Scaling
├─ Increase server resources
└─ Optimize database queries

Phase 2: Horizontal Scaling
├─ Load balancer (Nginx, HAProxy)
├─ Multiple server instances
├─ Shared cache (Redis)
└─ Database replication

Phase 3: Microservices
├─ Auth Service
├─ Merchant Service
├─ Transaction Service
├─ Payment Service
└─ Webhook Service
```

## 🔧 Technology Stack Justification

| Layer | Technology | Justification |
|-------|-----------|--------------|
| Runtime | Node.js | Async I/O, JavaScript ecosystem |
| Framework | Express.js | Lightweight, minimal, excellent middleware |
| Database | MongoDB | Flexible schema, great for fintech |
| ORM | Mongoose | Schema validation, hooks, middleware |
| Language | TypeScript | Type safety, better DX, production-ready |
| Auth | JWT | Stateless, scalable, industry-standard |
| Crypto | Node's crypto | No external dependencies, secure |
| Validation | Joi | Expressive, chainable, error messages |
| Testing | Jest | Zero config, great DX, good coverage |
| Security | Helmet | Best practices, well-maintained |
| Rate Limit | express-rate-limit | Lightweight, flexible |

## 📊 Aggregation Queries

### Query 1: Transaction Summary by Status

```javascript
db.transactions.aggregate([
  {
    $match: { merchant_id: ObjectId("...") }
  },
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 },
      total_amount: { $sum: "$amount" }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### Query 2: Merchant Revenue Dashboard

```javascript
db.transactions.aggregate([
  {
    $match: {
      merchant_id: ObjectId("..."),
      status: "completed",
      created_at: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
      },
      revenue: { $sum: "$amount" },
      transaction_count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: -1 }
  }
])
```

## 🎯 Performance Optimization

### Database Level
- Strategic indexing on frequently queried fields
- Pagination for large result sets
- Query projection to fetch only needed fields

### Application Level
- Connection pooling
- Caching strategy (Redis)
- Request compression (gzip)
- Lazy loading

### Frontend Level
- Code splitting
- Image optimization
- Lazy component loading
- State management optimization

---

**Version**: 1.0.0
**Last Updated**: January 30, 2026
