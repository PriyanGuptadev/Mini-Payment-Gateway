process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.MONGO_URI = 'mongodb://localhost:27017/payment-gateway-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-chars-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-chars-key';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long';
