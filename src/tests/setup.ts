import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: vi.fn(),
            replace: vi.fn(),
            refresh: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            prefetch: vi.fn(),
        };
    },
    useSearchParams() {
        return new URLSearchParams();
    },
    usePathname() {
        return '/';
    },
}));

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.TURSO_DATABASE_URL = 'libsql://test.turso.io';
process.env.TURSO_AUTH_TOKEN = 'test-token';

// Import and setup fetch mock
import { setupFetchMock, resetMockState } from './mocks/fetch';

// Setup fetch mock with route-specific handling
setupFetchMock();

// Don't reset state between tests in same suite
// This allows tests to build on each other (e.g., signup then login)

// Mock crypto for Node.js environment
if (typeof window === 'undefined') {
    const { webcrypto } = require('crypto');
    global.crypto = webcrypto;
}

// Add TextEncoder/TextDecoder for Node.js
if (typeof TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}