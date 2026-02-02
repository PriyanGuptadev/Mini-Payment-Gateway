# Security Implementation Document

## 🔒 Security Overview

This document outlines all security measures implemented in the Mini Payment Gateway API. The system is designed with a "security-first" approach suitable for a fintech application.

## ✅ Security Measures Implemented

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- **Access Token**: 15-minute expiration for short-lived sessions
- **Refresh Token**: 7-day expiration for long-lived sessions stored in secure HttpOnly cookies
- **Token Payload**: Contains `userId` and `role` for authorization
- **Signature**: HS256 (HMAC-SHA256) with strong secret keys

```typescript
// Token generation
const accessToken = signAccessToken({
  userId: user.id,
  role: user.role
});

// Verification
const decoded = verifyAccessToken(token);
```

#### Password Security
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Never Stored**: Passwords are hashed before storage
- **Comparison**: Timing-safe comparison to prevent timing attacks

```typescript
// Hashing
const hash = await bcrypt.hash(password, 12);

// Verification
const isMatch = await bcrypt.compare(password, hash);
```

#### Role-Based Access Control (RBAC)
- **Roles**: USER, MERCHANT, ADMIN
- **Middleware**: `requireRole()` middleware enforces permissions
- **Protected Routes**: All sensitive operations require authentication

### 2. Data Protection

#### Encryption at Rest
- **Algorithm**: AES-256-GCM (Authenticated Encryption)
- **Target Data**: API secrets, sensitive credentials
- **Implementation**: Automatic encryption in database hooks

```typescript
// Encryption
const encrypted = encryptData(plaintext);

// Decryption
const plaintext = decryptData(encrypted);
```

#### API Secret Storage
- **Never Logged**: API secrets never appear in logs
- **Encrypted in DB**: Stored as encrypted ciphertext
- **Decrypt on Use**: Only decrypted when needed for verification
- **Rotation**: Can be rotated without data loss

#### Field-Level Encryption
- API secrets in Merchants collection
- Automatic encryption/decryption with Mongoose hooks

### 3. Request Security

#### HMAC-SHA256 Request Signing
Merchants must sign API requests with HMAC-SHA256 to prevent tampering.

**Signing Process**:
```
Message = METHOD|PATH|BODY|TIMESTAMP
Signature = HMAC-SHA256(Message, API_SECRET)
```

**Verification**:
```typescript

const expectedSignature = generateSignature(message, merchant.api_secret);
const isValid = verifySignature(message, signature, secret);
```

**Security Benefits**:
- Prevents man-in-the-middle attacks
- Ensures request authenticity
- Prevents request tampering
- Requires knowledge of API secret

#### Request Headers
```
X-Signature: HMAC-SHA256 digest
X-Merchant-Id: Merchant identifier
X-Timestamp: Request timestamp (prevents replay attacks)
```

**Replay Attack Prevention**:
- Timestamp must be within 5 minutes of server time
- Each signature is unique per request
- Stored transaction signatures prevent re-processing

### 4. Rate Limiting

#### Authentication Endpoints
```javascript
// 5 attempts per 15 minutes
authLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
}
```

Prevents brute force password attacks:
- Limits login attempts
- Limits registration attempts
- Resets on successful request

#### Global API Limiter
```javascript
// 100 requests per 15 minutes
apiLimiter: {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true
}
```

Prevents DDoS and resource exhaustion.

#### Implementation Notes
- In-memory store (Redis recommended for production)
- Can be disabled in development
- Respects `X-Forwarded-For` header for proxies

### 5. Input Validation & Sanitization

#### Joi Schema Validation
All inputs validated against strict Joi schemas:

```typescript
// Email validation
email: Joi.string().email().required()

// Password strength validation
password: Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .required()
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

#### Amount Validation
```typescript
amount: Joi.number().positive().required()
```

#### Email Validation
```typescript
customer_email: Joi.string().email().required()
```

#### Benefits
- Prevents invalid data in database
- Consistent error messages
- Type coercion and cleaning
- Automatic error reporting

### 6. NoSQL Injection Prevention

#### Mongoose Schema Validation
```typescript
// Type enforcement prevents injection
const userSchema = new Schema({
  email: { type: String, index: true },
  password_hash: { type: String },
  role: { type: String, enum: ["USER", "MERCHANT", "ADMIN"] }
});
```

#### Query Parameterization
```typescript
// Safe - using Mongoose query builder
const user = await User.findOne({ email: userEmail });

// Automatic escaping
const transaction = await Transaction.findById(transactionId);
```

#### Field-Level Validation
- ObjectId validation
- Enum validation
- Type checking

### 7. XSS (Cross-Site Scripting) Protection

#### Helmet Security Headers
```typescript
app.use(helmet());
```

Provides security headers:
- **Content-Security-Policy**: Restricts script sources
- **X-Content-Type-Options**: Forces MIME type
- **X-Frame-Options**: Prevents clickjacking
- **Strict-Transport-Security**: HTTPS enforcement

#### Input Sanitization
- All user inputs validated with Joi
- No unsanitized data stored
- JSON responses prevent script execution

### 8. CORS Configuration

#### Whitelist Origin
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Signature",
    "X-Merchant-Id",
    "X-Timestamp"
  ]
})
```

#### Benefits
- Prevents cross-origin attacks
- Controls who can access the API
- Credentials protected with SameSite cookies

### 9. Environment Variable Management

#### Configuration
All sensitive data in environment variables:

```env
# Authentication
JWT_ACCESS_SECRET=strong_secret_min_32_chars
JWT_REFRESH_SECRET=strong_secret_min_32_chars

# Encryption
ENCRYPTION_KEY=encryption_key_32_chars

# Database
MONGO_URI=mongodb://...

# API Settings
FRONTEND_URL=https://frontend.com
NODE_ENV=production
```

#### Best Practices
- Never commit `.env` files
- Use `.env.example` as template
- Different secrets for dev/prod
- Rotate secrets regularly

### 10. API Key Management

#### Generation
```typescript
// Generate 32-byte hex string
const apiKey = randomBytes(32).toString("hex");
const apiSecret = randomBytes(64).toString("hex");
```

#### Secure Storage
- API Key: Stored plaintext (needed for lookup)
- API Secret: Encrypted with AES-256-GCM
- Never logged or exposed in responses

#### Rotation
```typescript
// New credentials generated
// Old credentials invalidated
// Rotation count tracked
// Last rotation timestamp recorded
```

#### Expiration (Recommended for Production)
```typescript
{
  api_key: String,
  expires_at: Date,
  rotation_count: Number,
  last_rotated_at: Date
}
```

### 11. Error Handling

#### Production Error Response
```json
{
  "error": "Internal server error"
}
```

**Stack traces never exposed in production.**

#### Development Error Response
```json
{
  "error": "User not found",
  "details": { /* ... */ }
}
```

#### Logging
```typescript
// Log errors securely
console.error(err);

// Never log:
// - API secrets
// - Passwords
// - Personal data
// - Credit card numbers
```

### 12. HTTPS-Ready Configuration

#### Secure Cookies
```typescript
res.cookie("refreshToken", token, {
  httpOnly: true,              // JavaScript can't access
  secure: true,                // HTTPS only
  sameSite: "strict",          // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

#### Security Headers
```typescript
// HSTS: Force HTTPS
helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
});
```

#### Forward Headers
```typescript
// Trust X-Forwarded-For in production
app.set('trust proxy', 1);
```

## 🛡️ Threat Model

### What Attacks Are We Protecting Against?

#### 1. Brute Force Attacks
**Attack**: Attacker tries multiple passwords
**Defense**: Rate limiting on authentication endpoints (5 attempts/15 min)

#### 2. Man-in-the-Middle (MITM)
**Attack**: Attacker intercepts and modifies requests
**Defense**: 
- HMAC signatures prevent tampering
- HTTPS encryption in transit
- Secure cookies with secure flag

#### 3. SQL/NoSQL Injection
**Attack**: Injecting malicious code in inputs
**Defense**:
- Mongoose type enforcement
- Joi input validation
- Parameterized queries

#### 4. Cross-Site Scripting (XSS)
**Attack**: Injecting scripts that run in user's browser
**Defense**:
- Helmet CSP headers
- Input validation
- JSON responses

#### 5. Cross-Site Request Forgery (CSRF)
**Attack**: Tricking user into unwanted actions
**Defense**:
- SameSite cookies
- JWT tokens instead of session cookies
- CORS whitelisting

#### 6. Replay Attacks
**Attack**: Replaying captured requests
**Defense**:
- Timestamp validation (5-minute window)
- Unique HMAC signature per request
- Transaction reference IDs prevent re-processing

#### 7. Session Hijacking
**Attack**: Stealing user session tokens
**Defense**:
- HttpOnly cookies prevent JavaScript access
- Secure flag requires HTTPS
- Short expiration (15 minutes for access token)

#### 8. API Key Exposure
**Attack**: Leaked or exposed API credentials
**Defense**:
- API secrets encrypted at rest
- Never logged in any form
- Credential rotation mechanism
- IP whitelist support

#### 9. DDoS Attacks
**Attack**: Overwhelming server with requests
**Defense**:
- Global rate limiting (100 requests/15 min)
- Request size limits (1MB)
- Load balancer ready

#### 10. Data Breach
**Attack**: Unauthorized access to database
**Defense**:
- Passwords hashed with bcrypt
- API secrets encrypted with AES-256-GCM
- Proper access controls
- Environment variable secrets

## 🔐 HMAC Implementation Details

### Why HMAC-SHA256?

**Advantages**:
- Cryptographically secure
- Fast computation
- Symmetric (both parties have secret)
- Prevents tampering
- Industry standard

### Message Format
```
METHOD|PATH|BODY|TIMESTAMP
```

**Example**:
```
POST|/api/transactions/checkout|{"amount":100,"currency":"USD"}|1675123456
```

### Verification Algorithm
```typescript
export const verifySignature = (
  message: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = generateSignature(message, secret);
  // Timing-safe comparison prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
```

## 📋 Security Checklist (Verification)

### Authentication & Authorization
- [x] Passwords hashed (bcrypt 12 rounds)
- [x] JWT tokens have expiration (15 min access, 7 days refresh)
- [x] Roles enforced via middleware
- [x] Protected routes require authentication
- [x] Token refresh mechanism implemented

### Data Protection
- [x] Sensitive data encrypted at rest (AES-256-GCM)
- [x] API secrets never logged
- [x] Password hashing with bcrypt
- [x] HTTPS-ready configuration
- [x] Secure cookie flags (httpOnly, secure, sameSite)

### Input Validation
- [x] Input validation on all endpoints (Joi)
- [x] Email format validation
- [x] Password strength requirements
- [x] Amount validation (positive numbers only)
- [x] Type enforcement at database level

### Rate Limiting
- [x] Authentication endpoints (5/15 min)
- [x] Global API limiter (100/15 min)
- [x] Prevents brute force
- [x] Prevents DDoS

### Request Security
- [x] HMAC-SHA256 signature verification
- [x] Timestamp validation (5-minute window)
- [x] Unique signatures per request
- [x] Timing-safe comparison

### Security Headers
- [x] Helmet security headers
- [x] Content-Security-Policy
- [x] CORS configured with whitelist
- [x] XSS protection
- [x] CSRF protection via SameSite cookies

### API Key Management
- [x] Keys generated with crypto.randomBytes()
- [x] Secrets encrypted in database
- [x] Rotation mechanism implemented
- [x] IP whitelist support (ready)

### Error Handling
- [x] No stack traces in production
- [x] Generic error messages for users
- [x] Detailed logging for developers
- [x] Proper HTTP status codes

### Monitoring & Logging
- [x] Error tracking
- [x] Request logging
- [x] No sensitive data in logs

## 🚀 Security Recommendations for Production

### Immediate (Before Launch)
1. **Use Strong Secrets**
   ```bash
   # Generate strong random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set NODE_ENV=production**
   ```env
   NODE_ENV=production
   ```

3. **Enable HTTPS**
   ```typescript
   secure: process.env.NODE_ENV === "production"
   ```

4. **Configure CORS Properly**
   ```env
   FRONTEND_URL=https://your-domain.com
   ```

### Short Term (1-3 months)
1. **Implement Email Verification**
   - Nodemailer or SendGrid integration
   - Verify email before full account activation

2. **Add Two-Factor Authentication (2FA)**
   - TOTP (Time-based One-Time Password)
   - Or SMS-based verification

3. **Database Backup & Recovery**
   - Automated daily backups
   - Test recovery process

4. **Monitoring & Alerting**
   - DataDog or New Relic
   - Alert on suspicious activities
   - Performance monitoring

5. **Secrets Management**
   - AWS Secrets Manager or HashiCorp Vault
   - Rotate secrets regularly

### Medium Term (3-6 months)
1. **Penetration Testing**
   - Third-party security audit
   - OWASP Top 10 verification

2. **Redis Caching & Rate Limiting**
   - Distributed rate limiting
   - Session caching

3. **API Gateway**
   - Kong, AWS API Gateway, or Azure API Management
   - Advanced rate limiting and WAF

4. **Observability**
   - ELK Stack for logging
   - Prometheus for metrics
   - Jaeger for tracing

### Long Term (6+ months)
1. **PCI DSS Compliance**
   - If handling credit cards directly
   - Level 1 compliance assessment

2. **ISO 27001 Certification**
   - Information security management

3. **Microservices Security**
   - Service-to-service authentication (mTLS)
   - API Gateway authentication

4. **Disaster Recovery Plan**
   - RTO/RPO targets
   - Failover mechanisms
   - Chaos engineering tests

## 🔍 Security Testing

### Unit Tests
```bash
npm test

# Tests cover:
- Password hashing
- HMAC signature generation/verification
- JWT token generation/verification
- Input validation
- Data encryption/decryption
```

### Manual Security Testing
```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "wrong"}'

# Test rate limiting
# Send 6 login requests in quick succession
# 6th request should be rate limited

# Test HMAC verification
# Send request with wrong signature
# Should return 401 Unauthorized
```

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email:
```
security@transfi.com
```

Do not publicly disclose until the issue is patched.

## 📚 Security References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)

---

**Version**: 1.0.0
**Last Updated**: January 30, 2026
**Security Review**: Pending
