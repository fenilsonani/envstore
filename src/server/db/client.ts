import 'server-only';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

const databaseUrl = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

const libsql = createClient({
    url: databaseUrl,
    authToken,
});

export const db = drizzle(libsql);
