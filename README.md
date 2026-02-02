# Mini Payment Gateway API

A secure, production-ready payment gateway system built with Node.js, Express, React, and MongoDB. This project demonstrates secure fintech development practices including authentication, transaction management, HMAC signing, and data encryption.

## 🎯 Project Overview

This is a full-stack payment gateway system that allows merchants to:
- Register and manage accounts
- Generate and manage API credentials
- Create and process transactions
- View transaction history and analytics
- Implement secure request signing with HMAC-SHA256

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: MongoDB
- **Authentication**: JWT (Access + Refresh Tokens)
- **Encryption**: AES-256-GCM
- **Testing**: Jest + Supertest
- **Language**: TypeScript
- **Security**: Helmet, CORS, Rate Limiting, Input Validation

### Frontend Stack
- **Framework**: React 18 / Next.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Redux
- **HTTP Client**: Axios
- **Validation**: React Hook Form + Zod

## 📋 Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/payment-gateway.git
cd payment-gateway
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

MONGO_URI=mongodb://localhost:27017/payment-gateway
JWT_ACCESS_SECRET=your_strong_random_string_min_32_chars
JWT_REFRESH_SECRET=your_strong_random_string_min_32_chars
ENCRYPTION_KEY=your_encryption_key_32_chars_long

# Start MongoDB
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# Run database migrations (if any)
npm run migrate

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Update with API endpoint
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Frontend runs on http://localhost:3001
```

### 4. Docker Setup (Optional)

```bash
# From root directory
docker-compose up -d

# This starts both MongoDB and the backend API
# Frontend can be run separately with: npm run dev
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "merchant@example.com",
  "password": "SecurePass@123",
  "business_name": "My Business"
}

Response 201:
{
  "message": "Registered successfully",
  "user": {
    "id": "user_id",
    "email": "merchant@example.com",
    "role": "MERCHANT"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "merchant@example.com",
  "password": "SecurePass@123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "merchant@example.com",
    "role": "MERCHANT"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Merchant Endpoints

#### Create Merchant Account
```http
POST /api/merchants
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "business_name": "My Business",
  "webhook_url": "https://example.com/webhook"
}

Response 201:
{
  "message": "Merchant account created",
  "merchant": {
    "id": "merchant_id",
    "business_name": "My Business",
    "api_key": "merchant_api_key",
    "status": "active"
  }
}
```

#### Get Merchant Details
```http
GET /api/merchants
Authorization: Bearer {accessToken}

Response 200:
{
  "_id": "merchant_id",
  "user_id": "user_id",
  "business_name": "My Business",
  "api_key": "merchant_api_key",
  "status": "active",
  "createdAt": "2024-01-30T10:00:00Z"
}
```

#### Rotate API Credentials
```http
POST /api/merchants/rotate-credentials
Authorization: Bearer {accessToken}

Response 200:
{
  "message": "Credentials rotated successfully",
  "merchant": {
    "id": "merchant_id",
    "api_key": "new_api_key"
  }
}
```

### Transaction Endpoints

#### Create Checkout Session
```http
POST /api/transactions/checkout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "customer_email": "customer@example.com",
  "metadata": {
    "order_id": "ORD123",
    "product": "Premium Plan"
  }
}

Response 201:
{
  "transaction_id": "trans_id",
  "reference_id": "ref_12345",
  "amount": 100.00,
  "currency": "USD",
  "status": "pending",
  "customer_email": "customer@example.com"
}
```

#### Process Payment
```http
POST /api/transactions/pay
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "transaction_id": "trans_id"
}

Response 200:
{
  "transaction_id": "trans_id",
  "status": "completed",
  "amount": 100.00,
  "currency": "USD"
}
```

#### Get Transaction History
```http
GET /api/transactions/history?status=completed&limit=20&skip=0
Authorization: Bearer {accessToken}

Response 200:
{
  "transactions": [...],
  "total": 150,
  "limit": 20,
  "skip": 0
}
```

#### Get Transaction Summary
```http
GET /api/transactions/summary
Authorization: Bearer {accessToken}

Response 200:
{
  "total_transactions": 150,
  "completed_transactions": 135,
  "failed_transactions": 15,
  "total_amount": 15000.00,
  "completed_amount": 13500.00,
  "success_rate": 90.0
}
```

## 🔐 HMAC Request Signing

For secure API requests from your backend to our gateway, you must sign requests with HMAC-SHA256.

### Signing Process

```javascript
const crypto = require('crypto');

function signRequest(method, path, body, timestamp, apiSecret) {
  const message = `${method}|${path}|${JSON.stringify(body)}|${timestamp}`;
  
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
  
  return signature;
}

const apiSecret = 'your_merchant_api_secret';
const timestamp = Math.floor(Date.now() / 1000);
const method = 'POST';
const path = '/api/transactions/checkout';
const body = {
  amount: 100,
  currency: 'USD',
  customer_email: 'customer@example.com'
};

const signature = signRequest(method, path, body, timestamp, apiSecret);

fetch('http://localhost:5000/api/transactions/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Signature': signature,
    'X-Merchant-Id': 'merchant_id',
    'X-Timestamp': timestamp.toString(),
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(body)
});
```

## 🧪 Testing

### Run All Tests
```bash
cd backend
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test tests/utils/security.test.ts
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

### Test Coverage

The project includes at least 5 unit tests covering:

1. **Security Functions** (`tests/utils/security.test.ts`)
   - Password hashing and comparison
   - HMAC signature generation and verification
   - Data encryption and decryption

2. **JWT Functions** (`tests/utils/jwt.test.ts`)
   - Access token generation and verification
   - Refresh token generation and verification
   - Token expiration and validation

3. **Input Validation** (`tests/validation/input-validation.test.ts`)
   - Registration schema validation
   - Login schema validation
   - Transaction schema validation
   - Email and password strength validation

## 📊 Key Features

### ✅ Authentication & Authorization
- User registration with email validation
- Secure login with JWT tokens
- Access token refresh mechanism
- Role-based access control (RBAC)
- Secure password hashing with bcrypt

### ✅ Merchant Management
- Merchant account creation
- API key and secret generation
- Secure API secret encryption (AES-256-GCM)
- API credential rotation with history tracking
- IP whitelist support (ready to implement)

### ✅ Transaction Management
- Checkout session creation
- Payment processing (mock)
- Transaction status tracking
- Transaction history with filtering
- Transaction summary and statistics

### ✅ Security Features
- **HMAC-SHA256** request signing verification
- **Rate limiting** on authentication endpoints (5 attempts per 15 minutes)
- **Global rate limiting** (100 requests per 15 minutes)
- **Input validation** on all endpoints
- **XSS protection** via Helmet
- **CORS configuration** with origin whitelisting
- **Environment variable** management
- **Encryption at rest** for sensitive data
- **SQL/NoSQL injection prevention** via Mongoose schema validation
- **Secure error handling** (no stack traces in production)
- **HTTPS-ready** configuration

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "bcrypt_hash",
  "role": "MERCHANT|USER|ADMIN",
  "business_name": "Business Name",
  "email_verified": true,
  "status": "active|inactive|suspended",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Merchants Collection
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "business_name": "Business Name",
  "api_key": "merchant_api_key",
  "api_secret": "encrypted_secret",
  "status": "active|inactive|suspended",
  "webhook_url": "https://example.com/webhook",
  "rotation_count": 5,
  "last_rotated_at": ISODate,
  "ip_whitelist": ["192.168.1.1"],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Transactions Collection
```json
{
  "_id": ObjectId,
  "merchant_id": ObjectId,
  "amount": 100.00,
  "currency": "USD",
  "status": "pending|processing|completed|failed|refunded",
  "customer_email": "customer@example.com",
  "metadata": { "order_id": "123" },
  "signature": "hmac_signature",
  "reference_id": "unique_uuid",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Database Indexes

```javascript
// Users
db.users.createIndex({ email: 1, status: 1 })

// Merchants
db.merchants.createIndex({ user_id: 1, status: 1 })

// Transactions
db.transactions.createIndex({ merchant_id: 1, status: 1 })
db.transactions.createIndex({ merchant_id: 1, created_at: -1 })
db.transactions.createIndex(
  { created_at: 1 },
  { 
    expireAfterSeconds: 2592000,
    partialFilterExpression: { status: "pending" }
  }
)
```

## 🔄 API Request/Response Flow

```
┌─────────────────┐
│  Frontend       │
│  (React/Next)   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────────────────┐
│  Express API Server         │
│  ├─ Auth Middleware         │
│  ├─ Validation Middleware   │
│  ├─ HMAC Verification       │
│  ├─ Rate Limiting           │
│  └─ Request Handler         │
└────────┬────────────────────┘
         │ Mongoose ODM
         ▼
┌─────────────────┐
│  MongoDB        │
│  - Users        │
│  - Merchants    │
│  - Transactions │
└─────────────────┘
```

## 🚨 Security Checklist

- [x] All passwords hashed with bcrypt (12 rounds)
- [x] JWT tokens with 15-minute expiration
- [x] Sensitive data encrypted at rest (AES-256-GCM)
- [x] Rate limiting on auth endpoints
- [x] Input validation on all endpoints
- [x] HMAC-SHA256 signature verification
- [x] API keys never logged or exposed
- [x] NoSQL injection prevention via schema validation
- [x] XSS protection via Helmet
- [x] Proper error messages (no stack traces in production)
- [x] HTTPS-ready configuration
- [x] Environment variables for all secrets
- [x] CORS properly configured
- [x] Secure password requirements (8+ chars, uppercase, lowercase, number, special char)

## 📱 Frontend Features

### Merchant Dashboard
- User registration and login
- Merchant account creation
- API credentials display (with copy functionality)
- Credential rotation
- Webhook URL management
- Transaction list with filters (date, status, amount)
- Transaction details view
- Analytics dashboard (total transactions, success rate, total volume)

### Demo Checkout Page
- Simple payment form
- Merchant selection
- Amount and email input
- Real-time signature generation
- Transaction status display

### UI/UX Features
- Responsive design (mobile-first)
- Loading states and skeletons
- Error handling with user-friendly messages
- Form validation with feedback
- Protected routes with authentication
- Dark/Light mode support

## 🐳 Docker Deployment

### Building Docker Images

```bash
# Build backend image
cd backend
docker build -t payment-gateway-backend .

# Build frontend image
cd frontend
docker build -t payment-gateway-frontend .
```

### Running with Docker Compose

```bash
# From root directory
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflows for:

- Linting (ESLint, TypeScript)
- Unit testing (Jest)
- Build verification
- Deployment staging (on main branch)

Workflow file: `.github/workflows/ci-cd.yml`

## 📖 Known Limitations & Trade-offs

1. **Payment Processing**: Uses mock payment processing for demo purposes. In production, integrate with actual payment processors (Stripe, PayPal, etc.)

2. **Email Verification**: User registration doesn't include email verification. Implement nodemailer/SendGrid for production.

3. **Webhook Retries**: Webhook delivery doesn't include retry logic. Implement exponential backoff in production.

4. **API Rate Limiting**: Uses in-memory rate limiter. For distributed systems, use Redis-based rate limiting.

5. **Logging**: Basic console logging. Implement proper structured logging (Winston, Pino) for production.

6. **Monitoring**: No APM/monitoring setup. Add services like DataDog, New Relic in production.

7. **Secrets Management**: Uses .env files. Use AWS Secrets Manager, HashiCorp Vault in production.

## 🚀 Future Improvements

1. **Payment Integration**
   - Integrate with Stripe API
   - Support multiple payment methods
   - Implement PCI DSS compliance

2. **Enhanced Security**
   - Two-factor authentication (2FA)
   - API key expiration and automatic rotation
   - Request signing with RSA keys
   - OAuth 2.0 support

3. **Monitoring & Analytics**
   - Transaction analytics dashboard
   - Real-time monitoring
   - Error tracking and alerting
   - Performance metrics

4. **Scalability**
   - Implement caching with Redis
   - Use message queues (RabbitMQ, Kafka)
   - Database sharding
   - Load balancing

5. **Testing**
   - Integration tests with MongoDB
   - End-to-end tests
   - Performance testing
   - Security penetration testing

6. **DevOps**
   - Kubernetes deployment
   - Auto-scaling setup
   - Blue-green deployments
   - Disaster recovery

## 📞 Support & Questions

For questions about the assessment, email: rakshita@transfi.com

Response time: Within 12 hours

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

[Your Name]
[Your GitHub Profile]
[Your Email]

---

**Last Updated**: January 30, 2026
**Version**: 1.0.0
