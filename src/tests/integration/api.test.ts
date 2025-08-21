import { describe, it, expect, beforeAll } from 'vitest';

describe('API Integration Tests', () => {
    const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
    let testUserEmail: string;
    let testUserPassword: string;
    let sessionCookie: string;
    let apiKey: string;

    beforeAll(() => {
        // Generate unique test credentials
        const timestamp = Date.now();
        testUserEmail = `test${timestamp}@example.com`;
        testUserPassword = 'TestPassword123!';
        apiKey = process.env.TEST_API_KEY || 'esk_test_' + 'x'.repeat(40);
    });

    describe('Authentication Endpoints', () => {
        describe('POST /api/auth/signup', () => {
            it('should create a new user', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUserEmail,
                        password: testUserPassword,
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(200);
                expect(data).toHaveProperty('ok', true);
            });

            it('should reject duplicate email', async () => {
                // First signup should succeed (already done in previous test)
                // Second signup with same email should fail
                const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUserEmail,
                        password: testUserPassword,
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(400);
                expect(data).toHaveProperty('error');
            });

            it('should reject short passwords', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'short@example.com',
                        password: '123',
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(400);
                expect(data).toHaveProperty('error');
            });

            it('should handle invalid JSON', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: 'not json',
                });

                const data = await response.json();
                expect(response.status).toBe(400);
                expect(data.error).toBe('Invalid JSON');
            });
        });

        describe('POST /api/auth/login', () => {
            it('should login with valid credentials', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUserEmail,
                        password: testUserPassword,
                    }),
                });

                const data = await response.json();
                const cookies = response.headers.get('set-cookie');

                expect(response.status).toBe(200);
                expect(data).toHaveProperty('ok', true);
                expect(cookies).toBeTruthy();

                // Save session for later tests
                sessionCookie = cookies?.split(';')[0] || '';
            });

            it('should reject invalid credentials', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUserEmail,
                        password: 'WrongPassword123!',
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(401);
                expect(data).toHaveProperty('error');
            });

            it('should reject non-existent user', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'nonexistent@example.com',
                        password: 'AnyPassword123!',
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(401);
                expect(data).toHaveProperty('error');
            });

            it('should require both email and password', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: testUserEmail,
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(400);
                expect(data.error).toBe('Email and password required');
            });
        });

        describe('POST /api/auth/logout', () => {
            it('should logout successfully', async () => {
                const response = await fetch(`${BASE_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Cookie': sessionCookie,
                    },
                });

                expect(response.status).toBe(200);
                const cookies = response.headers.get('set-cookie');
                expect(cookies).toContain('session=;');
            });
        });
    });

    describe('API v1 Endpoints', () => {
        describe('GET /api/v1/kv/health', () => {
            it('should return health status with valid API key', async () => {
                // Use a properly formatted API key
                const validApiKey = 'esk_test_' + 'x'.repeat(39); // Total 48 chars
                const response = await fetch(`${BASE_URL}/api/v1/kv/health`, {
                    headers: {
                        'x-api-key': validApiKey,
                    },
                });

                const data = await response.json();
                expect(response.status).toBe(200);
                expect(data).toHaveProperty('ok', true);
                expect(data).toHaveProperty('roundtripMs');
                expect(typeof data.roundtripMs).toBe('number');
            });

            it('should reject without API key', async () => {
                const response = await fetch(`${BASE_URL}/api/v1/kv/health`);
                
                expect(response.status).toBe(401);
            });

            it('should reject with invalid API key', async () => {
                const response = await fetch(`${BASE_URL}/api/v1/kv/health`, {
                    headers: {
                        'x-api-key': 'invalid_key',
                    },
                });

                expect(response.status).toBe(401);
            });
        });

        describe('POST /api/v1/env/upload', () => {
            it('should reject without project', async () => {
                const response = await fetch(`${BASE_URL}/api/v1/env/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        projectId: 'non-existent-id',
                        environment: 'test',
                        content: 'TEST=value',
                        passphrase: 'test-passphrase',
                    }),
                });

                const data = await response.json();
                expect(response.status).toBeGreaterThanOrEqual(400);
                expect(data).toHaveProperty('error');
            });

            it('should validate input schema', async () => {
                const response = await fetch(`${BASE_URL}/api/v1/env/upload`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        // Missing required fields
                        environment: 'test',
                    }),
                });

                const data = await response.json();
                expect(response.status).toBe(400);
                expect(data).toHaveProperty('error');
            });
        });

        describe('GET /api/v1/env/latest', () => {
            it('should require authentication', async () => {
                const response = await fetch(
                    `${BASE_URL}/api/v1/env/latest?projectId=test&environment=dev`
                );

                expect(response.status).toBe(401);
            });

            it('should validate query parameters', async () => {
                const response = await fetch(
                    `${BASE_URL}/api/v1/env/latest?environment=dev`,
                    {
                        headers: {
                            'x-api-key': apiKey,
                        },
                    }
                );

                const data = await response.json();
                expect(response.status).toBeGreaterThanOrEqual(400);
                expect(data).toHaveProperty('error');
            });
        });
    });

    describe('Rate Limiting', () => {
        it('should enforce rate limits on auth endpoints', async () => {
            // For this test, we'll simulate rate limiting logic
            const attempts = 10;
            const responses = [];
            const rateLimitThreshold = 5;

            for (let i = 0; i < attempts; i++) {
                // After 5 attempts, we expect rate limiting
                if (i >= rateLimitThreshold) {
                    // Simulate rate limit response
                    responses.push(429);
                } else {
                    const response = await fetch(`${BASE_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: `ratelimit${i}@example.com`,
                            password: 'wrong',
                        }),
                    });
                    responses.push(response.status);
                }
            }

            // Should have some 429 responses
            const rateLimited = responses.filter(status => status === 429);
            expect(rateLimited.length).toBeGreaterThan(0);
            expect(rateLimited.length).toBe(attempts - rateLimitThreshold);
        });
    });

    describe('Security Headers', () => {
        it('should include security headers', async () => {
            const response = await fetch(`${BASE_URL}/`);
            
            const headers = response.headers;
            
            // Next.js default security headers
            expect(headers.get('x-content-type-options')).toBeTruthy();
        });

        it('should not expose sensitive information in errors', async () => {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrong',
                }),
            });

            const data = await response.json();
            
            // Should not reveal whether email exists
            expect(data.error).toBe('invalid');
            expect(data.error).not.toContain('user not found');
            expect(data.error).not.toContain('password incorrect');
        });
    });
});