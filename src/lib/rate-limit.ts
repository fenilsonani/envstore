import { headers } from 'next/headers';

interface RateLimitOptions {
    windowMs?: number;
    maxRequests?: number;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private cache: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor() {
        // Clean up expired entries every minute
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (entry.resetTime < now) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }

    async limit(
        identifier: string,
        options: RateLimitOptions = {}
    ): Promise<{ success: boolean; remaining: number; reset: number }> {
        const windowMs = options.windowMs ?? 60000; // 1 minute default
        const maxRequests = options.maxRequests ?? 10; // 10 requests default
        const now = Date.now();
        const resetTime = now + windowMs;

        const entry = this.cache.get(identifier);

        if (!entry || entry.resetTime < now) {
            // New entry or expired
            this.cache.set(identifier, {
                count: 1,
                resetTime,
            });
            return {
                success: true,
                remaining: maxRequests - 1,
                reset: resetTime,
            };
        }

        if (entry.count >= maxRequests) {
            return {
                success: false,
                remaining: 0,
                reset: entry.resetTime,
            };
        }

        entry.count++;
        return {
            success: true,
            remaining: maxRequests - entry.count,
            reset: entry.resetTime,
        };
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export async function rateLimit(
    req?: Request,
    options: RateLimitOptions & { identifier?: string } = {}
): Promise<{ success: boolean; remaining: number; reset: number }> {
    let identifier = options.identifier;

    if (!identifier && req) {
        // Try to get IP from headers
        const headersList = await headers();
        identifier =
            headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headersList.get('x-real-ip') ||
            headersList.get('cf-connecting-ip') ||
            'unknown';
    }

    if (!identifier) {
        identifier = 'unknown';
    }

    return rateLimiter.limit(identifier, options);
}

// Auth-specific rate limits
export async function authRateLimit(req?: Request) {
    return rateLimit(req, {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per 15 minutes
    });
}

export async function apiRateLimit(req?: Request) {
    return rateLimit(req, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60, // 60 requests per minute
    });
}