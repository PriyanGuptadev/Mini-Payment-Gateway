import { hashPassword, comparePassword } from "../../src/utils/password";
import {
    generateSignature,
    verifySignature,
    encryptData,
    decryptData,
} from "../../src/utils/crypto";

describe("Security Functions", () => {
    describe("Password Hashing", () => {
        it("should hash password correctly", async () => {
            const password = "TestPassword@123";
            const hash = await hashPassword(password);

            expect(hash).not.toBe(password);
            expect(hash).toHaveLength(60); 
        });

        it("should verify correct password", async () => {
            const password = "TestPassword@123";
            const hash = await hashPassword(password);

            const isMatch = await comparePassword(password, hash);
            expect(isMatch).toBe(true);
        });

        it("should reject incorrect password", async () => {
            const password = "TestPassword@123";
            const wrongPassword = "WrongPassword@123";
            const hash = await hashPassword(password);

            const isMatch = await comparePassword(wrongPassword, hash);
            expect(isMatch).toBe(false);
        });

        it("should generate different hashes for same password", async () => {
            const password = "TestPassword@123";
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe("HMAC Signature", () => {
        it("should generate valid signature", () => {
            const message = "test-message";
            const secret = "test-secret-key";

            const signature = generateSignature(message, secret);
            expect(signature).toBeDefined();
            expect(typeof signature).toBe("string");
            expect(signature).toHaveLength(64); 
        });

        it("should verify valid signature", () => {
            const message = "test-message";
            const secret = "test-secret-key";

            const signature = generateSignature(message, secret);
            const isValid = verifySignature(message, signature, secret);

            expect(isValid).toBe(true);
        });

        it("should reject invalid signature", () => {
            const message = "test-message";
            const secret = "test-secret-key";

            const signature = generateSignature(message, secret);
            const isValid = verifySignature(message + "-tampered", signature, secret);

            expect(isValid).toBe(false);
        });

        it("should reject signature with wrong secret", () => {
            const message = "test-message";
            const secret = "test-secret-key";

            const signature = generateSignature(message, secret);
            const isValid = verifySignature(message, signature, "wrong-secret");

            expect(isValid).toBe(false);
        });
    });

    describe("Data Encryption", () => {
        it("should encrypt and decrypt data", () => {
            const plaintext = "sensitive-api-secret";
            const encrypted = encryptData(plaintext);

            expect(encrypted).not.toBe(plaintext);
            expect(encrypted).toContain(":"); 

            const decrypted = decryptData(encrypted);
            expect(decrypted).toBe(plaintext);
        });

        it("should produce different ciphertexts for same plaintext", () => {
            const plaintext = "sensitive-api-secret";
            const encrypted1 = encryptData(plaintext);
            const encrypted2 = encryptData(plaintext);

            expect(encrypted1).not.toBe(encrypted2);
            expect(decryptData(encrypted1)).toBe(plaintext);
            expect(decryptData(encrypted2)).toBe(plaintext);
        });

        it("should fail to decrypt with tampered data", () => {
            const plaintext = "sensitive-api-secret";
            const encrypted = encryptData(plaintext);
            const tampered = encrypted.split(":").slice(0, 2).join(":") + ":wrongdata";

            expect(() => decryptData(tampered)).toThrow();
        });
    });
});
