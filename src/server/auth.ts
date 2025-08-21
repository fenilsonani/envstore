import { SignJWT, jwtVerify } from 'jose';
import argon2 from 'argon2';
import { cookies } from 'next/headers';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { db } from './db/client';
import { apiKeys } from './db/schema';
import { eq, and, isNull } from 'drizzle-orm';

const sessionCookieName = 'envstore_session';
// Generate a stable secret for development if JWT_SECRET is not set
const jwtSecret = new TextEncoder().encode(
    process.env.JWT_SECRET ||
        'envstore_development_secret_key_do_not_use_in_production'
);
// Log a warning instead of throwing an error
if (!process.env.JWT_SECRET) {
    console.warn(
        'WARNING: JWT_SECRET is not set. Using default development secret. This is not secure for production use.'
    );
}

export async function hashPassword(password: string) {
    return argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    });
}
export async function verifyPassword(hash: string, password: string) {
    return argon2.verify(hash, password);
}

export async function issueSession(userId: string) {
    const jwt = await new SignJWT({ uid: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(jwtSecret);
    const c = await cookies();
    c.set(sessionCookieName, jwt, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
    });
}

export async function clearSession() {
    const c = await cookies();
    c.delete(sessionCookieName);
}

export async function getUserIdFromCookies() {
    const c = await cookies();
    const cookie = c.get(sessionCookieName)?.value;
    if (!cookie) return null;
    try {
        const { payload } = await jwtVerify(cookie, jwtSecret);
        return (payload as { uid?: string }).uid ?? null;
    } catch {
        return null;
    }
}

function generateApiKeyString() {
    const prefix = 'esk_live_';
    const raw = randomBytes(32).toString('base64url');
    return { token: `${prefix}${raw}`, prefix };
}
function hashApiKey(token: string) {
    return createHash('sha256').update(token).digest('base64');
}

export async function createApiKey(userId: string, name: string) {
    const { token, prefix } = generateApiKeyString();
    const hash = hashApiKey(token);
    const id = randomUUID();
    await db.insert(apiKeys).values({ id, userId, name, prefix, hash });
    return { id, token, prefix };
}

export async function verifyApiKey(token: string) {
    const prefix = token.slice(0, 10);
    const hash = hashApiKey(token);
    const rows = await db
        .select()
        .from(apiKeys)
        .where(
            and(
                eq(apiKeys.prefix, prefix),
                eq(apiKeys.hash, hash),
                isNull(apiKeys.revokedAt)
            )
        );
    const key = rows[0];
    if (!key) return null;
    await db
        .update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(and(eq(apiKeys.id, key.id), isNull(apiKeys.revokedAt)));
    return key;
}
