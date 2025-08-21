import crypto from 'node:crypto';

const subtle = crypto.webcrypto.subtle;

async function deriveKey(passphrase: string, saltB64?: string) {
    const enc = new TextEncoder();
    const salt = saltB64
        ? Buffer.from(saltB64, 'base64')
        : crypto.randomBytes(16);
    const baseKey = await subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    const key = await subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 210000,
            hash: 'SHA-256',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
    return { key, saltB64: salt.toString('base64') };
}

export async function encryptString(plaintext: string, passphrase: string) {
    const { key, saltB64 } = await deriveKey(passphrase);
    const iv = crypto.randomBytes(12);
    const enc = new TextEncoder();
    const ciphertext = await subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(plaintext)
    );
    const cipherB64 = Buffer.from(new Uint8Array(ciphertext)).toString(
        'base64'
    );
    const ivB64 = iv.toString('base64');
    const checksum = crypto
        .createHash('sha256')
        .update(plaintext)
        .digest('base64');
    return { ciphertext: cipherB64, iv: ivB64, salt: saltB64, checksum };
}

export async function decryptString(
    ciphertextB64: string,
    passphrase: string,
    ivB64: string,
    saltB64: string
) {
    const { key } = await deriveKey(passphrase, saltB64);
    const iv = Buffer.from(ivB64, 'base64');
    const ciphertext = Buffer.from(ciphertextB64, 'base64');
    const decrypted = await subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
    );
    return new TextDecoder().decode(decrypted);
}
