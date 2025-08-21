import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { projects, envFiles } from '@/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyApiKey } from '@/server/auth';
import { enforceHybridRateLimit } from '@/server/rateLimit';
import { kvGetJSON, kvPutJSON } from '@/server/kv';

const paramsSchema = z.object({
    projectId: z.string().uuid(),
    environment: z.string().min(1),
});

export async function GET(req: Request) {
    const url = new URL(req.url);
    const token = req.headers.get('x-api-key') || '';
    // Pre-auth IP rate limit
    const pre = await enforceHybridRateLimit({
        request: req,
        routeName: 'latest',
        apiKeyId: null,
    });
    if (!pre.success)
        return NextResponse.json(
            { error: 'rate_limited' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil(pre.retryAfterMs / 1000)),
                },
            }
        );
    const key = await verifyApiKey(token);
    if (!key)
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    // Post-auth per-key rate limit (higher limits)
    const post = await enforceHybridRateLimit({
        request: req,
        routeName: 'latest',
        apiKeyId: key.id,
    });
    if (!post.success)
        return NextResponse.json(
            { error: 'rate_limited' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil(post.retryAfterMs / 1000)),
                },
            }
        );
    const projectId = url.searchParams.get('projectId');
    const environment = url.searchParams.get('environment');
    const parsed = paramsSchema.safeParse({
        projectId: projectId ?? undefined,
        environment: environment ?? undefined,
    });
    if (!parsed.success)
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const proj = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.id, parsed.data.projectId),
                eq(projects.ownerId, key.userId)
            )
        )
        .limit(1);
    if (!proj[0])
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    // Attempt KV cache read-through
    const cacheKey = `cache:latest:${parsed.data.projectId}:${parsed.data.environment}`;
    const cached = await kvGetJSON<{
        id: string;
        version: number;
        ciphertext: string;
        iv: string;
        salt: string;
        checksum: string;
    }>(cacheKey);
    if (cached) {
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
    }

    const rows = await db
        .select()
        .from(envFiles)
        .where(
            and(
                eq(envFiles.projectId, parsed.data.projectId),
                eq(envFiles.environment, parsed.data.environment)
            )
        )
        .orderBy(desc(envFiles.version))
        .limit(1);
    const record = rows[0];
    if (!record)
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const payload = {
        id: record.id,
        version: record.version,
        ciphertext: record.ciphertext,
        iv: record.iv,
        salt: record.salt,
        checksum: record.checksum,
    };
    await kvPutJSON(cacheKey, payload, { expirationTtl: 60 });
    return NextResponse.json(payload, { headers: { 'X-Cache': 'MISS' } });
}
