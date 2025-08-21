import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, issueSession } from '@/server/auth';

export async function POST(request: Request) {
    const body = await request.json();
    const email = String(body.email || '').toLowerCase();
    const password = String(body.password || '');
    const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    const user = rows[0];
    if (!user || !user.passwordHash)
        return NextResponse.json({ error: 'invalid' }, { status: 401 });
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) return NextResponse.json({ error: 'invalid' }, { status: 401 });
    await issueSession(user.id);
    return NextResponse.json({ ok: true });
}
