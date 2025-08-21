import { kvGetJSON, kvPutJSON } from './kv';

type RateState = { count: number; resetAtMs: number };

export type RateResult = {
    success: boolean;
    remaining: number;
    retryAfterMs: number;
    resetAt: number;
};

async function incrementWindow(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateResult> {
    const now = Date.now();
    const state = (await kvGetJSON<RateState>(key)) || null;

    if (!state || state.resetAtMs <= now) {
        const resetAtMs = now + windowMs;
        // TTL handling is now built into kvPutJSON
        await kvPutJSON(
            key,
            { count: 1, resetAtMs },
            { expirationTtl: Math.ceil(windowMs / 1000) + 5 }
        );
        return {
            success: true,
            remaining: limit - 1,
            retryAfterMs: 0,
            resetAt: resetAtMs,
        };
    }

    if (state.count >= limit) {
        return {
            success: false,
            remaining: 0,
            retryAfterMs: state.resetAtMs - now,
            resetAt: state.resetAtMs,
        };
    }

    const next = { count: state.count + 1, resetAtMs: state.resetAtMs };
    // TTL handling is now built into kvPutJSON
    await kvPutJSON(key, next, {
        expirationTtl: Math.ceil((state.resetAtMs - now) / 1000) + 5,
    });
    return {
        success: true,
        remaining: limit - next.count,
        retryAfterMs: 0,
        resetAt: next.resetAtMs,
    };
}

export async function consumeRateLimit(
    key: string,
    limit = 60,
    windowMs = 60_000
) {
    return incrementWindow(`rl:${key}`, limit, windowMs);
}

export type HybridLimiterConfig = {
    unauthLimitPerMin?: number;
    authLimitPerMin?: number;
    windowMs?: number;
};

export async function enforceHybridRateLimit(params: {
    request: Request;
    routeName: string;
    apiKeyId?: string | null;
    config?: HybridLimiterConfig;
}) {
    const { request, routeName, apiKeyId, config } = params;
    const windowMs = config?.windowMs ?? 60_000;
    const unauthLimit = config?.unauthLimitPerMin ?? 60;
    const authLimit = config?.authLimitPerMin ?? 120;
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('cf-connecting-ip') ||
        '0.0.0.0';
    if (!apiKeyId) {
        return consumeRateLimit(`ip:${routeName}:${ip}`, unauthLimit, windowMs);
    }
    return consumeRateLimit(
        `key:${routeName}:${apiKeyId}`,
        authLimit,
        windowMs
    );
}
