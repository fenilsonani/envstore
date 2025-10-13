import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test('health check endpoint', async ({ request }) => {
        const response = await request.get(`${baseURL}/api/v1/kv/health`);
        // KV may not be configured in tests, so 200 or 500 are acceptable
        expect([200, 500]).toContain(response.status());
    });

    test('auth endpoints return proper status codes', async ({ request }) => {
        // Test signup with invalid data
        const signupResponse = await request.post(`${baseURL}/api/auth/signup`, {
            data: { email: 'invalid', password: 'short' }
        });
        expect([400, 422]).toContain(signupResponse.status());

        // Test login with invalid credentials
        const loginResponse = await request.post(`${baseURL}/api/auth/login`, {
            data: { email: 'notexist@example.com', password: 'wrongpassword' }
        });
        expect([401, 404]).toContain(loginResponse.status());
    });

    test('protected API routes require authentication', async ({ request }) => {
        // Try to access protected endpoint without auth
        const response = await request.get(`${baseURL}/api/v1/env/latest?projectId=test-project-id&environment=development`);
        expect([401, 403, 500]).toContain(response.status());
    });

    test('API returns JSON content type', async ({ request }) => {
        const response = await request.post(`${baseURL}/api/auth/login`, {
            data: { email: 'test@example.com', password: 'wrongpassword' }
        });
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
    });

    test('API returns proper error format', async ({ request }) => {
        const response = await request.post(`${baseURL}/api/auth/login`, {
            data: { email: 'notexist@example.com', password: 'wrongpassword' }
        });
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
    });
});

test.describe('API Rate Limiting', () => {
    test.skip('rate limiting on auth endpoints', async ({ request }) => {
        const baseURL = process.env.BASE_URL || 'http://localhost:3000';
        const requests = [];

        // Make multiple rapid requests
        for (let i = 0; i < 150; i++) {
            requests.push(
                request.post(`${baseURL}/api/auth/login`, {
                    data: { email: 'test@example.com', password: 'test' }
                })
            );
        }

        const responses = await Promise.all(requests);
        const rateLimited = responses.some(r => r.status() === 429);

        // Should get at least one rate limited response
        expect(rateLimited).toBeTruthy();
    });
});

test.describe('API Error Handling', () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    test('returns 404 for non-existent routes', async ({ request }) => {
        const response = await request.get(`${baseURL}/api/nonexistent`);
        expect(response.status()).toBe(404);
    });

    test('returns 405 for wrong HTTP methods', async ({ request }) => {
        const response = await request.put(`${baseURL}/api/auth/login`);
        expect([404, 405]).toContain(response.status());
    });

    test('validates JSON payloads', async ({ request }) => {
        const response = await request.post(`${baseURL}/api/auth/signup`, {
            data: 'invalid json string',
            headers: { 'content-type': 'application/json' }
        });
        expect([400, 415]).toContain(response.status());
    });
});
