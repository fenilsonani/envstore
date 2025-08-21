import { NextResponse } from 'next/server';
import { kvHealthCheck } from '@/server/kv';
import { enforceHybridRateLimit } from '@/server/rateLimit';

export async function GET(request: Request) {
    // Rate limit health checks to prevent abuse
    const rl = await enforceHybridRateLimit({
        request,
        routeName: 'kv-health',
        apiKeyId: null,
        config: { unauthLimitPerMin: 10 },
    });

    if (!rl.success) {
        return NextResponse.json(
            { error: 'rate_limited' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)),
                },
            }
        );
    }

    // Basic env validation before calling KV
    const hasAccount = Boolean(process.env.CF_ACCOUNT_ID);
    const hasNamespace = Boolean(process.env.CF_KV_NAMESPACE_ID);
    const hasToken = Boolean(process.env.CF_API_TOKEN);

    if (!hasAccount || !hasNamespace || !hasToken) {
        return NextResponse.json(
            {
                ok: false,
                error: 'kv_env_missing',
                config: { hasAccount, hasNamespace, hasToken },
            },
            { status: 500 }
        );
    }

    // Perform KV health check
    const result = await kvHealthCheck();

    return NextResponse.json(result, {
        status: result.ok ? 200 : 500,
        headers: {
            'Cache-Control': 'no-cache',
            'X-KV-Health': result.ok ? 'OK' : 'FAIL',
        },
    });
}
