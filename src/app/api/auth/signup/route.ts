import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import { randomUUID } from 'node:crypto';
import { hashPassword, issueSession } from '@/server/auth';

export async function POST(request: Request) {
    const body = await request.json();
    const email = String(body.email || '').toLowerCase();
    const password = String(body.password || '');
    if (!email || password.length < 8)
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    await db.insert(users).values({ id, email, passwordHash });
    await issueSession(id);
    return NextResponse.json({ ok: true });
}
