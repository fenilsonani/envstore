import { db } from '../db/client';
import { getUserIdFromCookies } from '../auth';

export async function createContext(opts?: { req?: Request }) {
    const userId = await getUserIdFromCookies();
    return { db, userId };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
