import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { projects, envFiles } from '@/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyApiKey } from '@/server/auth';
import { encryptString } from '@/server/crypto';
import { randomUUID } from 'node:crypto';
import { enforceHybridRateLimit } from '@/server/rateLimit';
import { kvDelete } from '@/server/kv';

const uploadBodySchema = z.union([
    z
        .object({
            projectId: z.string().uuid(),
            environment: z.string().min(1),
            content: z.string().min(1),
            passphrase: z.string().min(8),
        })
        .strict(),
    z
        .object({
            projectId: z.string().uuid(),
            environment: z.string().min(1),
            ciphertext: z.string().min(1),
            iv: z.string().min(1),
            salt: z.string().min(1),
            checksum: z.string().min(1),
        })
        .strict(),
]);

export async function POST(request: Request) {
    const token = request.headers.get('x-api-key') || '';
    const pre = await enforceHybridRateLimit({
        request,
        routeName: 'upload',
        apiKeyId: null,
        config: { unauthLimitPerMin: 20 },
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
    const post = await enforceHybridRateLimit({
        request,
        routeName: 'upload',
        apiKeyId: key.id,
        config: { authLimitPerMin: 60 },
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
    let parsed: z.infer<typeof uploadBodySchema>;
    try {
        parsed = uploadBodySchema.parse(await request.json());
    } catch {
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    const { projectId, environment } = parsed;
    const proj = await db
        .select()
        .from(projects)
        .where(
            and(eq(projects.id, projectId), eq(projects.ownerId, key.userId))
        )
        .limit(1);
    if (!proj[0])
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const latest = await db
        .select({ version: envFiles.version })
        .from(envFiles)
        .where(
            and(
                eq(envFiles.projectId, projectId),
                eq(envFiles.environment, environment)
            )
        )
        .orderBy(desc(envFiles.version))
        .limit(1);
    const nextVersion = latest[0]?.version ? latest[0].version + 1 : 1;
    let payload: {
        ciphertext: string;
        iv: string;
        salt: string;
        checksum: string;
    } | null = null;
    if ('ciphertext' in parsed) {
        payload = {
            ciphertext: parsed.ciphertext,
            iv: parsed.iv,
            salt: parsed.salt,
            checksum: parsed.checksum,
        };
    } else if ('content' in parsed) {
        payload = await encryptString(parsed.content, parsed.passphrase);
    }
    if (!payload)
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const id = randomUUID();
    await db
        .insert(envFiles)
        .values({
            id,
            projectId,
            environment,
            version: nextVersion,
            ...payload,
        });
    // Invalidate latest cache for this project/env
    await kvDelete(`cache:latest:${projectId}:${environment}`);
    return NextResponse.json({ id, version: nextVersion });
}
