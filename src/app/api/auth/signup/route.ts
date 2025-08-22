import { NextResponse } from 'next/server';
import { db } from '@/server/db/client';
import { users } from '@/server/db/schema';
import { randomUUID } from 'node:crypto';
import { hashPassword, issueSession } from '@/server/auth';
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
    if (!email || password.length < 8)
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    
    try {
        await db.insert(users).values({ id, email, passwordHash });
        await issueSession(id);
        return NextResponse.json({ ok: true });
    } catch {
        // Handle duplicate email error
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
}
