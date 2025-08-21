import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, issueSession } from '@/server/auth';
import { authRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    // Apply rate limiting
    const rateLimitResult = await authRateLimit(request);
    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: 'Too many attempts. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                    'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
                },
            }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    const email = String(body?.email || '').toLowerCase();
    const password = String(body?.password || '');
    
    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
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
