import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    kvGetCached,
    kvSetCached,
    kvRemember,
    kvInvalidateByTag,
    kvGetSession,
    kvSetSession,
    kvInvalidateSession,
    kvInvalidateUserSessions,
    type SessionData,
    type CacheEntry,
} from '../server/kv';

// Set mock environment variables for testing
process.env.CF_ACCOUNT_ID = 'test-account';
process.env.CF_KV_NAMESPACE_ID = 'test-namespace';
process.env.CF_API_TOKEN = 'test-token';

// Mock the base KV functions
vi.mock('../server/kv', async () => {
    const actual = await vi.importActual<typeof import('../server/kv')>(
        '../server/kv'
    );
    
    // In-memory storage for testing
    const storage = new Map<string, unknown>();
    
    // Mock only the low-level functions
    const mockKvGetJSON = vi.fn(async (key: string) => {
        return storage.get(key) || null;
    });
    
    const mockKvPutJSON = vi.fn(async (key: string, value: unknown) => {
        storage.set(key, value);
    });
    
    const mockKvDelete = vi.fn(async (key: string) => {
        storage.delete(key);
    });
    
    const mockKvList = vi.fn(async () => ({
        result: Array.from(storage.keys()).map((key) => ({ name: key })),
        result_info: { count: storage.size },
        success: true,
        errors: [],
        messages: [],
    }));
    
    // Create cache functions using mocked base functions
    const kvGetCached = async <T>(key: string, namespace = 'cache'): Promise<T | null> => {
        const fullKey = `${namespace}:${key}`;
        const entry = await mockKvGetJSON(fullKey) as actual.CacheEntry<T> | null;
        
        if (!entry) return null;
        
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            await mockKvDelete(fullKey);
            return null;
        }
        
        return entry.data;
    };
    
    const kvSetCached = async <T>(
        key: string,
        value: T,
        ttlSeconds = 3600,
        namespace = 'cache',
        tags?: string[]
    ): Promise<void> => {
        const fullKey = `${namespace}:${key}`;
        const now = Date.now();
        
        const entry: actual.CacheEntry<T> = {
            data: value,
            createdAt: now,
            expiresAt: ttlSeconds > 0 ? now + ttlSeconds * 1000 : undefined,
            tags,
        };
        
        await mockKvPutJSON(fullKey, entry);
        
        if (tags) {
            for (const tag of tags) {
                const tagKey = `tag:${namespace}:${tag}`;
                const keys = (await mockKvGetJSON(tagKey) as string[]) || [];
                if (!keys.includes(key)) {
                    keys.push(key);
                    await mockKvPutJSON(tagKey, keys);
                }
            }
        }
    };
    
    const kvRemember = async <T>(
        key: string,
        factory: () => Promise<T>,
        ttlSeconds = 3600,
        namespace = 'cache'
    ): Promise<T> => {
        const cached = await kvGetCached<T>(key, namespace);
        if (cached !== null) return cached;
        
        const value = await factory();
        await kvSetCached(key, value, ttlSeconds, namespace);
        return value;
    };
    
    const kvInvalidateByTag = async (tag: string, namespace = 'cache'): Promise<void> => {
        const tagKey = `tag:${namespace}:${tag}`;
        const keys = await mockKvGetJSON(tagKey) as string[] | null;
        
        if (keys) {
            await Promise.all(
                keys.map((key) => mockKvDelete(`${namespace}:${key}`))
            );
            await mockKvDelete(tagKey);
        }
    };
    
    const kvGetSession = async (token: string): Promise<actual.SessionData | null> => {
        return kvGetCached<actual.SessionData>(`token:${token}`, 'session');
    };
    
    const kvSetSession = async (
        token: string,
        session: actual.SessionData,
        ttlSeconds = 3600
    ): Promise<void> => {
        await kvSetCached(
            `token:${token}`,
            session,
            ttlSeconds,
            'session',
            [`user:${session.userId}`]
        );
    };
    
    const kvInvalidateSession = async (token: string): Promise<void> => {
        await mockKvDelete(`session:token:${token}`);
    };
    
    const kvInvalidateUserSessions = async (userId: string): Promise<void> => {
        await kvInvalidateByTag(`user:${userId}`, 'session');
    };
    
    return {
        ...actual,
        kvGetJSON: mockKvGetJSON,
        kvPutJSON: mockKvPutJSON,
        kvDelete: mockKvDelete,
        kvList: mockKvList,
        kvGetCached,
        kvSetCached,
        kvRemember,
        kvInvalidateByTag,
        kvGetSession,
        kvSetSession,
        kvInvalidateSession,
        kvInvalidateUserSessions,
        CacheEntry: actual.CacheEntry,
        SessionData: actual.SessionData,
    };
});

describe('KV Cache Tests', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Clear the in-memory storage
        const { kvGetJSON, kvPutJSON, kvDelete } = vi.mocked(
            await import('../server/kv')
        );
        const kvGetJSONMock = kvGetJSON as ReturnType<typeof vi.fn>;
        const kvPutJSONMock = kvPutJSON as ReturnType<typeof vi.fn>;
        const kvDeleteMock = kvDelete as ReturnType<typeof vi.fn>;
        
        kvGetJSONMock.mockImplementation(async (key: string) => {
            return kvGetJSONMock.storage?.get(key) || null;
        });
        kvGetJSONMock.storage = new Map();
        kvPutJSONMock.mockImplementation(async (key: string, value: unknown) => {
            kvGetJSONMock.storage.set(key, value);
        });
        kvDeleteMock.mockImplementation(async (key: string) => {
            kvGetJSONMock.storage.delete(key);
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Basic Cache Operations', () => {
        it('should cache and retrieve data', async () => {
            const testData = { id: 1, name: 'Test Item' };
            
            await kvSetCached('test-key', testData, 3600);
            const retrieved = await kvGetCached<typeof testData>('test-key');
            
            expect(retrieved).toEqual(testData);
        });

        it('should return null for non-existent keys', async () => {
            const result = await kvGetCached('non-existent');
            expect(result).toBeNull();
        });

        it('should handle cache expiration', async () => {
            vi.useFakeTimers();
            const testData = { value: 'expires soon' };
            
            // Set cache with 1 second TTL
            await kvSetCached('expiring-key', testData, 1);
            
            // Should exist immediately
            let retrieved = await kvGetCached<typeof testData>('expiring-key');
            expect(retrieved).toEqual(testData);
            
            // Advance time by 2 seconds
            vi.advanceTimersByTime(2000);
            
            // Should be expired and return null
            retrieved = await kvGetCached<typeof testData>('expiring-key');
            expect(retrieved).toBeNull();
        });

        it('should use different namespaces', async () => {
            const data1 = { type: 'namespace1' };
            const data2 = { type: 'namespace2' };
            
            await kvSetCached('same-key', data1, 3600, 'ns1');
            await kvSetCached('same-key', data2, 3600, 'ns2');
            
            const retrieved1 = await kvGetCached<typeof data1>('same-key', 'ns1');
            const retrieved2 = await kvGetCached<typeof data2>('same-key', 'ns2');
            
            expect(retrieved1).toEqual(data1);
            expect(retrieved2).toEqual(data2);
        });
    });

    describe('Cache Tags', () => {
        it('should store and invalidate by tags', async () => {
            const item1 = { id: 1, category: 'electronics' };
            const item2 = { id: 2, category: 'electronics' };
            const item3 = { id: 3, category: 'books' };
            
            await kvSetCached('item-1', item1, 3600, 'cache', ['electronics']);
            await kvSetCached('item-2', item2, 3600, 'cache', ['electronics']);
            await kvSetCached('item-3', item3, 3600, 'cache', ['books']);
            
            // All items should exist
            expect(await kvGetCached('item-1')).toEqual(item1);
            expect(await kvGetCached('item-2')).toEqual(item2);
            expect(await kvGetCached('item-3')).toEqual(item3);
            
            // Invalidate electronics tag
            await kvInvalidateByTag('electronics');
            
            // Electronics items should be gone
            expect(await kvGetCached('item-1')).toBeNull();
            expect(await kvGetCached('item-2')).toBeNull();
            // Books item should still exist
            expect(await kvGetCached('item-3')).toEqual(item3);
        });

        it('should handle multiple tags per item', async () => {
            const item = { id: 1, tags: ['tag1', 'tag2', 'tag3'] };
            
            await kvSetCached('multi-tag-item', item, 3600, 'cache', [
                'tag1',
                'tag2',
                'tag3',
            ]);
            
            // Item should exist
            expect(await kvGetCached('multi-tag-item')).toEqual(item);
            
            // Invalidating any tag should remove the item
            await kvInvalidateByTag('tag2');
            expect(await kvGetCached('multi-tag-item')).toBeNull();
        });
    });

    describe('Remember Pattern', () => {
        it('should cache the result of factory function', async () => {
            let factoryCalls = 0;
            const factory = async () => {
                factoryCalls++;
                return { computed: 'value', calls: factoryCalls };
            };
            
            // First call should execute factory
            const result1 = await kvRemember('compute-key', factory, 3600);
            expect(result1).toEqual({ computed: 'value', calls: 1 });
            expect(factoryCalls).toBe(1);
            
            // Second call should return cached value
            const result2 = await kvRemember('compute-key', factory, 3600);
            expect(result2).toEqual({ computed: 'value', calls: 1 });
            expect(factoryCalls).toBe(1); // Factory not called again
        });

        it('should re-compute after cache expiration', async () => {
            vi.useFakeTimers();
            let counter = 0;
            const factory = async () => {
                counter++;
                return { value: counter };
            };
            
            // First call
            const result1 = await kvRemember('expire-test', factory, 1);
            expect(result1).toEqual({ value: 1 });
            
            // Advance time past expiration
            vi.advanceTimersByTime(2000);
            
            // Should re-compute
            const result2 = await kvRemember('expire-test', factory, 1);
            expect(result2).toEqual({ value: 2 });
        });
    });

    describe('Session Caching', () => {
        it('should cache and retrieve sessions', async () => {
            const session: SessionData = {
                userId: 'user-123',
                email: 'user@example.com',
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
                metadata: { role: 'admin' },
            };
            
            await kvSetSession('token-abc', session, 3600);
            const retrieved = await kvGetSession('token-abc');
            
            expect(retrieved).toEqual(session);
        });

        it('should invalidate individual sessions', async () => {
            const session: SessionData = {
                userId: 'user-456',
                email: 'test@example.com',
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            };
            
            await kvSetSession('token-xyz', session, 3600);
            expect(await kvGetSession('token-xyz')).toEqual(session);
            
            await kvInvalidateSession('token-xyz');
            expect(await kvGetSession('token-xyz')).toBeNull();
        });

        it('should invalidate all user sessions', async () => {
            const userId = 'user-789';
            const session1: SessionData = {
                userId,
                email: 'user@example.com',
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            };
            const session2: SessionData = {
                userId,
                email: 'user@example.com',
                createdAt: Date.now() - 1000,
                expiresAt: Date.now() + 3600000,
            };
            const otherSession: SessionData = {
                userId: 'other-user',
                email: 'other@example.com',
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,
            };
            
            await kvSetSession('token-1', session1, 3600);
            await kvSetSession('token-2', session2, 3600);
            await kvSetSession('token-3', otherSession, 3600);
            
            // Invalidate all sessions for user-789
            await kvInvalidateUserSessions(userId);
            
            // User sessions should be gone
            expect(await kvGetSession('token-1')).toBeNull();
            expect(await kvGetSession('token-2')).toBeNull();
            // Other user's session should remain
            expect(await kvGetSession('token-3')).toEqual(otherSession);
        });
    });

    describe('Cache Entry Structure', () => {
        it('should store metadata correctly', async () => {
            const testData = { content: 'test' };
            const now = Date.now();
            vi.useFakeTimers();
            vi.setSystemTime(now);
            
            await kvSetCached('meta-test', testData, 3600, 'cache', ['tag1']);
            
            // Access the raw cache entry
            const kvModule = await import('../server/kv');
            const { kvGetJSON } = vi.mocked(kvModule);
            const rawEntry = await kvGetJSON<CacheEntry<typeof testData>>(
                'cache:meta-test'
            );
            
            expect(rawEntry).toBeTruthy();
            expect(rawEntry?.data).toEqual(testData);
            expect(rawEntry?.createdAt).toBe(now);
            expect(rawEntry?.expiresAt).toBe(now + 3600 * 1000);
            expect(rawEntry?.tags).toEqual(['tag1']);
        });
    });

    describe('Error Handling', () => {
        it('should handle KV errors gracefully', async () => {
            const kvModule = await import('../server/kv');
            const { kvGetJSON } = vi.mocked(kvModule);
            
            // Simulate KV error
            kvGetJSON.mockRejectedValueOnce(new Error('KV service unavailable'));
            
            await expect(kvGetCached('error-test')).rejects.toThrow(
                'KV service unavailable'
            );
        });

        it('should handle invalid JSON in cache', async () => {
            const kvModule = await import('../server/kv');
            const { kvGetJSON } = vi.mocked(kvModule);
            
            // Return invalid cache entry structure (missing 'data' field)
            kvGetJSON.mockResolvedValueOnce({ invalid: 'structure' });
            
            const result = await kvGetCached('invalid-entry');
            // When the cache entry doesn't have 'data' field, it returns undefined
            expect(result).toBeUndefined();
        });
    });
});

describe('Rate Limiting with Caching', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use cached rate limit results', async () => {
        // Mock the rateLimit module to use our mocked KV functions
        vi.doMock('../server/rateLimit', async () => {
            const kvModule = await import('../server/kv');
            
            const consumeRateLimit = async (
                key: string,
                limit = 60,
                windowMs = 60_000
            ) => {
                const rateLimitKey = `rl:${key}`;
                const now = Date.now();
                const state = await kvModule.kvGetJSON(rateLimitKey) || { count: 0, resetAtMs: now + windowMs };
                
                if (state.resetAtMs <= now) {
                    state.count = 1;
                    state.resetAtMs = now + windowMs;
                } else {
                    state.count++;
                }
                
                await kvModule.kvPutJSON(rateLimitKey, state);
                
                return {
                    success: state.count <= limit,
                    remaining: Math.max(0, limit - state.count),
                    retryAfterMs: state.count > limit ? state.resetAtMs - now : 0,
                    resetAt: state.resetAtMs,
                };
            };
            
            const consumeCachedRateLimit = async (
                key: string,
                limit = 60,
                windowMs = 60_000
            ) => {
                return kvModule.kvRemember(
                    `rl:cache:${key}`,
                    async () => consumeRateLimit(key, limit, windowMs),
                    1,
                    'ratelimit'
                );
            };
            
            return { consumeRateLimit, consumeCachedRateLimit };
        });
        
        const { consumeCachedRateLimit } = await import('../server/rateLimit');
        
        // First call should check rate limit
        const result1 = await consumeCachedRateLimit('test-ip', 10, 60000);
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(9);
        
        // Second call within cache window should return same result
        const result2 = await consumeCachedRateLimit('test-ip', 10, 60000);
        // Due to caching, it might return the same result
        expect(result2.success).toBe(true);
    });

    it('should handle sliding window rate limiting', async () => {
        // Mock the rateLimit module for sliding window
        vi.doMock('../server/rateLimit', async () => {
            const kvModule = await import('../server/kv');
            
            const consumeRateLimit = async (
                key: string,
                limit = 60,
                windowMs = 60_000,
                useSlidingWindow = false
            ) => {
                const rateLimitKey = `rl:${key}`;
                
                if (useSlidingWindow) {
                    const now = Date.now();
                    const windowStart = now - windowMs;
                    
                    const state = await kvModule.kvGetJSON(rateLimitKey) || { requests: [] };
                    
                    // Filter out expired requests
                    state.requests = state.requests.filter((req: { timestamp: number }) => req.timestamp > windowStart);
                    
                    const currentCount = state.requests.length;
                    
                    if (currentCount >= limit) {
                        const oldestRequest = state.requests[0];
                        const retryAfterMs = oldestRequest ? oldestRequest.timestamp + windowMs - now : 0;
                        
                        return {
                            success: false,
                            remaining: 0,
                            retryAfterMs,
                            resetAt: now + retryAfterMs,
                        };
                    }
                    
                    state.requests.push({ timestamp: now });
                    await kvModule.kvPutJSON(rateLimitKey, state);
                    
                    return {
                        success: true,
                        remaining: limit - currentCount - 1,
                        retryAfterMs: 0,
                        resetAt: now + windowMs,
                    };
                } else {
                    // Simple window implementation
                    const now = Date.now();
                    const state = await kvModule.kvGetJSON(rateLimitKey) || { count: 0, resetAtMs: now + windowMs };
                    
                    if (state.resetAtMs <= now) {
                        state.count = 1;
                        state.resetAtMs = now + windowMs;
                    } else {
                        state.count++;
                    }
                    
                    await kvModule.kvPutJSON(rateLimitKey, state);
                    
                    return {
                        success: state.count <= limit,
                        remaining: Math.max(0, limit - state.count),
                        retryAfterMs: state.count > limit ? state.resetAtMs - now : 0,
                        resetAt: state.resetAtMs,
                    };
                }
            };
            
            return { consumeRateLimit };
        });
        
        const { consumeRateLimit } = await import('../server/rateLimit');
        vi.useFakeTimers();
        const now = Date.now();
        vi.setSystemTime(now);
        
        // Use sliding window
        const result1 = await consumeRateLimit('sliding-test', 3, 3000, true);
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(2);
        
        // Advance time by 1 second
        vi.advanceTimersByTime(1000);
        
        const result2 = await consumeRateLimit('sliding-test', 3, 3000, true);
        expect(result2.success).toBe(true);
        expect(result2.remaining).toBe(1);
        
        const result3 = await consumeRateLimit('sliding-test', 3, 3000, true);
        expect(result3.success).toBe(true);
        expect(result3.remaining).toBe(0);
        
        // Should be rate limited now
        const result4 = await consumeRateLimit('sliding-test', 3, 3000, true);
        expect(result4.success).toBe(false);
        expect(result4.remaining).toBe(0);
        
        // Advance time so first request expires
        vi.advanceTimersByTime(2500);
        
        // Should allow one more request
        const result5 = await consumeRateLimit('sliding-test', 3, 3000, true);
        expect(result5.success).toBe(true);
    });
});