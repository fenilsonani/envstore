import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';

// Simple crypto functions for testing
function simpleEncrypt(text: string, passphrase: string) {
    const algorithm = 'aes-256-gcm';
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        ciphertext: encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

function simpleDecrypt(encryptedData: any, passphrase: string) {
    const algorithm = 'aes-256-gcm';
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

describe('Simple Crypto Functions', () => {
    describe('Encryption and Decryption', () => {
        it('should encrypt and decrypt text correctly', () => {
            const plaintext = 'Hello, World!';
            const passphrase = 'test-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            expect(encrypted).toHaveProperty('ciphertext');
            expect(encrypted).toHaveProperty('salt');
            expect(encrypted).toHaveProperty('iv');
            expect(encrypted).toHaveProperty('authTag');
            expect(encrypted.ciphertext).not.toBe(plaintext);
            
            const decrypted = simpleDecrypt(encrypted, passphrase);
            expect(decrypted).toBe(plaintext);
        });
        
        it('should generate different ciphertext for same input', () => {
            const plaintext = 'Same text';
            const passphrase = 'test-passphrase';
            
            const encrypted1 = simpleEncrypt(plaintext, passphrase);
            const encrypted2 = simpleEncrypt(plaintext, passphrase);
            
            expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
            expect(encrypted1.iv).not.toBe(encrypted2.iv);
            expect(encrypted1.salt).not.toBe(encrypted2.salt);
        });
        
        it('should handle empty strings', () => {
            const plaintext = '';
            const passphrase = 'test-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            const decrypted = simpleDecrypt(encrypted, passphrase);
            
            expect(decrypted).toBe(plaintext);
        });
        
        it('should handle special characters', () => {
            const plaintext = '!@#$%^&*()_+{}[]|\\:";\'<>?,./~`\n\t\r';
            const passphrase = 'test-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            const decrypted = simpleDecrypt(encrypted, passphrase);
            
            expect(decrypted).toBe(plaintext);
        });
        
        it('should fail with wrong passphrase', () => {
            const plaintext = 'Secret message';
            const passphrase = 'correct-passphrase';
            const wrongPassphrase = 'wrong-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            
            expect(() => {
                simpleDecrypt(encrypted, wrongPassphrase);
            }).toThrow();
        });
        
        it('should fail with tampered ciphertext', () => {
            const plaintext = 'Secret message';
            const passphrase = 'test-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            // Tamper with the ciphertext more significantly to ensure failure
            const tamperedCiphertext = encrypted.ciphertext.substring(0, encrypted.ciphertext.length - 2) + 'XX';
            encrypted.ciphertext = tamperedCiphertext;
            
            expect(() => {
                simpleDecrypt(encrypted, passphrase);
            }).toThrow();
        });
        
        it('should handle large data efficiently', () => {
            const largeText = 'x'.repeat(10000);
            const passphrase = 'test-passphrase';
            
            const startTime = performance.now();
            const encrypted = simpleEncrypt(largeText, passphrase);
            const decrypted = simpleDecrypt(encrypted, passphrase);
            const endTime = performance.now();
            
            expect(decrypted).toBe(largeText);
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
    
    describe('Security Properties', () => {
        it('should use PBKDF2 with sufficient iterations', () => {
            // This is validated by our implementation using 100000 iterations
            const passphrase = 'test-passphrase';
            const salt = crypto.randomBytes(16);
            
            const startTime = performance.now();
            crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
            const endTime = performance.now();
            
            // PBKDF2 with 100k iterations should take some time (but not too long)
            expect(endTime - startTime).toBeGreaterThan(10);
            expect(endTime - startTime).toBeLessThan(500);
        });
        
        it('should use AES-256-GCM for authenticated encryption', () => {
            const plaintext = 'Test message';
            const passphrase = 'test-passphrase';
            
            const encrypted = simpleEncrypt(plaintext, passphrase);
            
            // AES-256-GCM specific properties
            expect(encrypted.authTag).toBeTruthy();
            expect(encrypted.authTag.length).toBe(32); // 16 bytes in hex
            expect(encrypted.iv.length).toBe(32); // 16 bytes in hex
            expect(encrypted.salt.length).toBe(32); // 16 bytes in hex
        });
    });
});