import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, TokenPayload } from "../../src/utils/jwt";

describe("JWT Functions", () => {
    const payload: TokenPayload = {
        userId: "test-user-id",
        role: "MERCHANT",
    };

    describe("Access Token", () => {
        it("should sign access token", () => {
            const token = signAccessToken(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });

        it("should verify valid access token", () => {
            const token = signAccessToken(payload);
            const decoded = verifyAccessToken(token);

            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });

        it("should reject invalid access token", () => {
            const invalidToken = "invalid.token.here";
            expect(() => verifyAccessToken(invalidToken)).toThrow();
        });

        it("should reject tampered token", () => {
            const token = signAccessToken(payload);
            const tampered = token + "tampered";

            expect(() => verifyAccessToken(tampered)).toThrow();
        });
    });

    describe("Refresh Token", () => {
        it("should sign refresh token", () => {
            const token = signRefreshToken(payload);
            expect(token).toBeDefined();
            expect(typeof token).toBe("string");
        });

        it("should verify valid refresh token", () => {
            const token = signRefreshToken(payload);
            const decoded = verifyRefreshToken(token);

            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.role).toBe(payload.role);
        });

        it("should reject invalid refresh token", () => {
            const invalidToken = "invalid.token.here";
            expect(() => verifyRefreshToken(invalidToken)).toThrow();
        });
    });
});
