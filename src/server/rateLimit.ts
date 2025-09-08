import { kvGetJSON, kvPutJSON, kvRemember } from './kv';

type RateState = { count: number; resetAtMs: number };

// Sliding window rate limit state
type SlidingWindowState = {
    requests: Array<{ timestamp: number; weight?: number }>;
    windowStart: number;
};

export type RateResult = {
    success: boolean;
    remaining: number;
    retryAfterMs: number;
    resetAt: number;
};

// Configuration for rate limiting
export type RateLimitConfig = {
    limit: number;
    windowMs: number;
    useSlidingWindow?: boolean;
    enableBurst?: boolean;
    burstLimit?: number;
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

// Sliding window rate limiting for more accurate rate control
async function incrementSlidingWindow(
    key: string,
    limit: number,
    windowMs: number,
    weight = 1
): Promise<RateResult> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const state = await kvGetJSON<SlidingWindowState>(key);
    
    // Filter out expired requests and count current window requests
    const activeRequests = state?.requests.filter(
        (req) => req.timestamp > windowStart
    ) || [];
    
    const currentWeight = activeRequests.reduce(
        (sum, req) => sum + (req.weight || 1),
        0
    );
    
    if (currentWeight + weight > limit) {
        // Find when the oldest request will expire
        const oldestRequest = activeRequests[0];
        const retryAfterMs = oldestRequest
            ? oldestRequest.timestamp + windowMs - now
            : 0;
            
        return {
            success: false,
            remaining: Math.max(0, limit - currentWeight),
            retryAfterMs,
            resetAt: now + retryAfterMs,
        };
    }
    
    // Add new request
    activeRequests.push({ timestamp: now, weight });
    
    const newState: SlidingWindowState = {
        requests: activeRequests,
        windowStart: now,
    };
    
    await kvPutJSON(key, newState, {
        expirationTtl: Math.ceil(windowMs / 1000) + 5,
    });
    
    return {
        success: true,
        remaining: limit - currentWeight - weight,
        retryAfterMs: 0,
        resetAt: now + windowMs,
    };
}

export async function consumeRateLimit(
    key: string,
    limit = 60,
    windowMs = 60_000,
    useSlidingWindow = false
) {
    const rateLimitKey = `rl:${key}`;
    
    if (useSlidingWindow) {
        return incrementSlidingWindow(rateLimitKey, limit, windowMs);
    }
    
    return incrementWindow(rateLimitKey, limit, windowMs);
}

// Enhanced rate limit with caching for frequently accessed limits
export async function consumeCachedRateLimit(
    key: string,
    limit = 60,
    windowMs = 60_000
): Promise<RateResult> {
    // Use cache to reduce KV reads for high-frequency checks
    const cacheKey = `rl:cache:${key}`;
    const cached = await kvRemember<RateResult>(
        cacheKey,
        async () => consumeRateLimit(key, limit, windowMs),
        1, // Cache for 1 second
        'ratelimit'
    );
    
    return cached;
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
