"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../src/utils/jwt");
describe("JWT Functions", () => {
    const payload = {
        userId: "test-user-id",
        role: "MERCHANT",
    };
    describe("Access Token", () => {
        it("should sign access token", () => {
            const token = (0, jwt_1.signAccessToken)(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });
        it("should verify valid access token", () => {
            const token = (0, jwt_1.signAccessToken)(payload);
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });
        it("should reject invalid access token", () => {
            const invalidToken = "invalid.token.here";
            expect(() => (0, jwt_1.verifyAccessToken)(invalidToken)).toThrow();
        });
        it("should reject tampered token", () => {
            const token = (0, jwt_1.signAccessToken)(payload);
            const tampered = token + "tampered";
            expect(() => (0, jwt_1.verifyAccessToken)(tampered)).toThrow();
        });
    });
    describe("Refresh Token", () => {
        it("should sign refresh token", () => {
            const token = (0, jwt_1.signRefreshToken)(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });
        it("should verify valid refresh token", () => {
            const token = (0, jwt_1.signRefreshToken)(payload);
            const decoded = (0, jwt_1.verifyRefreshToken)(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });
        it("should reject invalid refresh token", () => {
            const invalidToken = "invalid.token.here";
            expect(() => (0, jwt_1.verifyRefreshToken)(invalidToken)).toThrow();
        });
    });
});
