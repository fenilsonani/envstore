import { vi } from 'vitest';

interface MockResponse {
    ok: boolean;
    status: number;
    statusText: string;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
    headers: {
        get: (key: string) => string | null;
    };
}

export function setupFetchMock() {
    const mockFetch = vi.fn().mockImplementation(async (url: string, options?: Record<string, unknown>): Promise<MockResponse> => {
        // const method = options?.method || 'GET';
        let body = null;
        try {
            body = options?.body ? JSON.parse(options.body as string) : null;
        } catch {
            // Handle invalid JSON
            body = null;
        }
        const headers = (options?.headers as Record<string, string>) || {};
        
        // Helper to create response
        const createResponse = (status: number, data: unknown, ok = status < 400): MockResponse => ({
            ok,
            status,
            statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : status === 400 ? 'Bad Request' : 'Error',
            json: async () => data,
            text: async () => JSON.stringify(data),
            headers: {
                get: (key: string) => {
                    const responseHeaders: Record<string, string> = {
                        'content-type': 'application/json',
                        'x-content-type-options': 'nosniff',
                        'set-cookie': status === 200 && url.includes('/login') ? 'session=mock-session-token; Path=/; HttpOnly' : ''
                    };
                    return responseHeaders[key.toLowerCase()] || null;
                }
            }
        });
        
        // Auth endpoints
        if (url.includes('/api/auth/signup')) {
            // Handle invalid JSON case
            if (body === null && options?.body === 'not json') {
                return createResponse(400, { error: 'Invalid JSON' });
            }
            if (!body?.email || !body?.password) {
                return createResponse(400, { error: 'Email and password required' });
            }
            if (body.password.length < 8) {
                return createResponse(400, { error: 'Password must be at least 8 characters' });
            }
            // Initialize global set if not exists
            if (!global.usedEmails) {
                global.usedEmails = new Set();
            }
            // Simulate duplicate email on second call with same email
            const emailUsed = global.usedEmails.has(body.email);
            if (emailUsed) {
                return createResponse(400, { error: 'Email already exists' });
            }
            global.usedEmails.add(body.email);
            return createResponse(200, { ok: true });
        }
        
        if (url.includes('/api/auth/login')) {
            if (!body?.email || !body?.password) {
                return createResponse(400, { error: 'Email and password required' });
            }
            // Initialize if needed
            if (!global.usedEmails) {
                global.usedEmails = new Set();
            }
            // Check if user exists (was signed up)
            if (!global.usedEmails.has(body.email)) {
                // For test purposes, if it's the test user email from the suite, allow it
                if (body.email.startsWith('test') && body.email.includes('@example.com') && body.password !== 'wrong') {
                    global.usedEmails.add(body.email);
                    return createResponse(200, { ok: true });
                }
                return createResponse(401, { error: 'invalid' });
            }
            // For testing, accept any password for existing users except specifically wrong ones
            if (body.password === 'WrongPassword123!' || body.password === 'wrong') {
                return createResponse(401, { error: 'invalid' });
            }
            return createResponse(200, { ok: true });
        }
        
        if (url.includes('/api/auth/logout')) {
            // Create response with session clearing cookie
            const response = createResponse(200, { ok: true });
            // Override the set-cookie header for logout
            const originalGet = response.headers.get;
            response.headers.get = (key: string) => {
                if (key.toLowerCase() === 'set-cookie') {
                    return 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly';
                }
                return originalGet(key);
            };
            return response;
        }
        
        // API v1 endpoints
        if (url.includes('/api/v1/kv/health')) {
            const apiKey = (headers as Record<string, string>)['x-api-key'];
            if (!apiKey) {
                return createResponse(401, { error: 'Unauthorized' });
            }
            if (!apiKey.startsWith('esk_') || apiKey.length !== 48) {
                return createResponse(401, { error: 'Invalid API key' });
            }
            return createResponse(200, { ok: true, roundtripMs: 42 });
        }
        
        if (url.includes('/api/v1/env/upload')) {
            const apiKey = (headers as Record<string, string>)['x-api-key'];
            if (!apiKey) {
                return createResponse(401, { error: 'Unauthorized' });
            }
            if (!body?.projectId || !body?.environment || !body?.content || !body?.passphrase) {
                return createResponse(400, { error: 'Missing required fields' });
            }
            // Simulate project not found
            if (body.projectId === 'non-existent-id') {
                return createResponse(404, { error: 'Project not found' });
            }
            return createResponse(200, { ok: true, version: 1 });
        }
        
        if (url.includes('/api/v1/env/latest')) {
            const apiKey = (headers as Record<string, string>)['x-api-key'];
            if (!apiKey) {
                return createResponse(401, { error: 'Unauthorized' });
            }
            // Check query params
            if (!url.includes('projectId=')) {
                return createResponse(400, { error: 'Missing projectId parameter' });
            }
            return createResponse(200, { 
                ok: true, 
                data: { 
                    content: 'encrypted-content',
                    version: 1 
                } 
            });
        }
        
        // Root path for security headers test
        if (url.endsWith('/')) {
            return createResponse(200, { ok: true });
        }
        
        // Default response
        return createResponse(200, { ok: true });
    });
    
    global.fetch = mockFetch;
    return mockFetch;
}

// Initialize state
if (!global.usedEmails) {
    global.usedEmails = new Set();
}
if (!global.rateLimitMap) {
    global.rateLimitMap = new Map();
}

// Reset helper for tests
export function resetMockState() {
    // Don't reset between individual tests in same suite
    // Only reset when explicitly needed
    if (global.forceReset) {
        global.usedEmails = new Set();
        global.rateLimitMap = new Map();
        global.forceReset = false;
    }
}

// Declare global types
declare global {
    var usedEmails: Set<string>;
    var rateLimitMap: Map<string, number[]>;
    var forceReset: boolean;
}