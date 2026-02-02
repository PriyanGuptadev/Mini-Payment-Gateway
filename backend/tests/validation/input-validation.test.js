"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_validation_1 = require("../../src/modules/auth/auth.validation");
describe("Input Validation", () => {
    describe("Registration Schema", () => {
        it("should validate correct registration data", () => {
            const data = {
                email: "test@example.com",
                password: "SecurePass@123",
                business_name: "My Business",
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeUndefined();
        });
        it("should reject invalid email", () => {
            const data = {
                email: "invalid-email",
                password: "SecurePass@123",
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject weak password", () => {
            const data = {
                email: "test@example.com",
                password: "weak", 
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject password without uppercase", () => {
            const data = {
                email: "test@example.com",
                password: "securepass@123",
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject password without number", () => {
            const data = {
                email: "test@example.com",
                password: "SecurePass@",
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject password without special character", () => {
            const data = {
                email: "test@example.com",
                password: "SecurePass123",
            };
            const { error } = auth_validation_1.registerSchema.validate(data);
            expect(error).toBeDefined();
        });
    });
    describe("Login Schema", () => {
        it("should validate correct login data", () => {
            const data = {
                email: "test@example.com",
                password: "AnyPassword@123",
            };
            const { error } = auth_validation_1.loginSchema.validate(data);
            expect(error).toBeUndefined();
        });
        it("should require email", () => {
            const data = {
                password: "AnyPassword@123",
            };
            const { error } = auth_validation_1.loginSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should require password", () => {
            const data = {
                email: "test@example.com",
            };
            const { error } = auth_validation_1.loginSchema.validate(data);
            expect(error).toBeDefined();
        });
    });
    describe("Transaction Schema", () => {
        it("should validate correct transaction data", () => {
            const data = {
                amount: 100.00,
                currency: "USD",
                customer_email: "customer@example.com",
                metadata: { order_id: "123" },
            };
            const { error } = auth_validation_1.createTransactionSchema.validate(data);
            expect(error).toBeUndefined();
        });
        it("should reject negative amount", () => {
            const data = {
                amount: -100,
                currency: "USD",
                customer_email: "customer@example.com",
            };
            const { error } = auth_validation_1.createTransactionSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject zero amount", () => {
            const data = {
                amount: 0,
                currency: "USD",
                customer_email: "customer@example.com",
            };
            const { error } = auth_validation_1.createTransactionSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should reject invalid email", () => {
            const data = {
                amount: 100,
                currency: "USD",
                customer_email: "invalid-email",
            };
            const { error } = auth_validation_1.createTransactionSchema.validate(data);
            expect(error).toBeDefined();
        });
        it("should set default currency", () => {
            const data = {
                amount: 100,
                customer_email: "customer@example.com",
            };
            const { value } = auth_validation_1.createTransactionSchema.validate(data);
            expect(value.currency).toBe("USD");
        });
    });
});
