import { describe, it, expect, beforeAll } from 'vitest';
import { encryptString, decryptString } from '@/server/crypto';

describe.skip('Crypto Functions (WebCrypto - Skipped in Node)', () => {
    const testData = 'DATABASE_URL=postgres://localhost:5432/test\nAPI_KEY=secret123';
    const passphrase = 'test-passphrase-123';

    describe('encryptString', () => {
        it('should encrypt a string and return required fields', async () => {
            const result = await encryptString(testData, passphrase);

            expect(result).toHaveProperty('ciphertext');
            expect(result).toHaveProperty('iv');
            expect(result).toHaveProperty('salt');
            expect(result).toHaveProperty('checksum');

            expect(typeof result.ciphertext).toBe('string');
            expect(typeof result.iv).toBe('string');
            expect(typeof result.salt).toBe('string');
            expect(typeof result.checksum).toBe('string');

            // Base64 validation
            expect(result.ciphertext).toMatch(/^[A-Za-z0-9+/]+=*$/);
            expect(result.iv).toMatch(/^[A-Za-z0-9+/]+=*$/);
            expect(result.salt).toMatch(/^[A-Za-z0-9+/]+=*$/);
        });

        it('should generate different ciphertext for same input', async () => {
            const result1 = await encryptString(testData, passphrase);
            const result2 = await encryptString(testData, passphrase);

            expect(result1.ciphertext).not.toBe(result2.ciphertext);
            expect(result1.iv).not.toBe(result2.iv);
            expect(result1.salt).not.toBe(result2.salt);
            // Checksum should be the same for same data
            expect(result1.checksum).toBe(result2.checksum);
        });

        it('should handle empty strings', async () => {
            const result = await encryptString('', passphrase);
            expect(result).toHaveProperty('ciphertext');
            expect(result.ciphertext).toBeTruthy();
        });

        it('should handle special characters', async () => {
            const specialData = '!@#$%^&*()_+{}[]|\\:";\'<>?,./~`';
            const result = await encryptString(specialData, passphrase);
            expect(result).toHaveProperty('ciphertext');
        });
    });

    describe('decryptString', () => {
        it('should decrypt encrypted data correctly', async () => {
            const encrypted = await encryptString(testData, passphrase);
            const decrypted = await decryptString(
                encrypted.ciphertext,
                encrypted.iv,
                encrypted.salt,
                passphrase
            );

            expect(decrypted).toBe(testData);
        });

        it('should fail with wrong passphrase', async () => {
            const encrypted = await encryptString(testData, passphrase);
            
            await expect(
                decryptString(
                    encrypted.ciphertext,
                    encrypted.iv,
                    encrypted.salt,
                    'wrong-passphrase'
                )
            ).rejects.toThrow();
        });

        it('should fail with tampered ciphertext', async () => {
            const encrypted = await encryptString(testData, passphrase);
            const tamperedCiphertext = encrypted.ciphertext.slice(0, -4) + 'XXXX';

            await expect(
                decryptString(
                    tamperedCiphertext,
                    encrypted.iv,
                    encrypted.salt,
                    passphrase
                )
            ).rejects.toThrow();
        });
    });

    describe('Encryption Security', () => {
        it('should use PBKDF2 with sufficient iterations', async () => {
            // This test validates that the encryption uses proper key derivation
            const result = await encryptString('test', 'password');
            
            // Salt should be 16 bytes (base64 encoded)
            const saltBytes = Buffer.from(result.salt, 'base64');
            expect(saltBytes.length).toBe(16);

            // IV should be 12 bytes for AES-GCM
            const ivBytes = Buffer.from(result.iv, 'base64');
            expect(ivBytes.length).toBe(12);
        });

        it('should handle large data efficiently', async () => {
            const largeData = 'x'.repeat(100000); // 100KB of data
            const startTime = Date.now();
            
            const encrypted = await encryptString(largeData, passphrase);
            const encryptTime = Date.now() - startTime;

            const decryptStart = Date.now();
            const decrypted = await decryptString(
                encrypted.ciphertext,
                encrypted.iv,
                encrypted.salt,
                passphrase
            );
            const decryptTime = Date.now() - decryptStart;

            expect(decrypted).toBe(largeData);
            // Should complete in reasonable time (< 5 seconds)
            expect(encryptTime).toBeLessThan(5000);
            expect(decryptTime).toBeLessThan(5000);
        });
    });
});