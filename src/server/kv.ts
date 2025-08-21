// Latest Cloudflare KV REST API client (2024/2025)
type KvPutOptions = {
    expirationTtl?: number;
    metadata?: Record<string, unknown>;
};

type KvListOptions = {
    limit?: number;
    cursor?: string;
    prefix?: string;
};

type KvListResponse = {
    result: Array<{
        name: string;
        expiration?: number;
        metadata?: Record<string, unknown>;
    }>;
    result_info: { count: number; cursor?: string };
    success: boolean;
    errors: Array<{ code: number; message: string }>;
    messages: Array<unknown>;
};

type KvMetadata = {
    value: string;
    metadata?: Record<string, unknown>;
};

function getKvConfig() {
    const accountId = process.env.CF_ACCOUNT_ID;
    const namespaceId = process.env.CF_KV_NAMESPACE_ID;
    const token = process.env.CF_API_TOKEN;

    if (!accountId || !namespaceId || !token) {
        throw new Error(
            'Cloudflare KV env not configured: CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, and CF_API_TOKEN are required'
        );
    }

    return {
        baseUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
}

export async function kvGetString(key: string): Promise<string | null> {
    const { baseUrl, headers } = getKvConfig();
    const url = `${baseUrl}/values/${encodeURIComponent(key)}`;

    const res = await fetch(url, {
        headers: { ...headers, 'Content-Type': 'text/plain' },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`KV get failed ${res.status}: ${errorText}`);
    }

    return await res.text();
}

export async function kvGetJSON<T = unknown>(key: string): Promise<T | null> {
    const value = await kvGetString(key);
    if (value == null) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

export async function kvGetWithMetadata(
    key: string
): Promise<KvMetadata | null> {
    const { baseUrl, headers } = getKvConfig();
    const url = `${baseUrl}/values/${encodeURIComponent(key)}`;

    const res = await fetch(url, {
        headers: { ...headers, Accept: 'application/json' },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(
            `KV get with metadata failed ${res.status}: ${errorText}`
        );
    }

    return (await res.json()) as KvMetadata;
}

export async function kvPutString(
    key: string,
    value: string,
    options?: KvPutOptions
): Promise<void> {
    const { baseUrl, headers } = getKvConfig();
    const url = new URL(`${baseUrl}/values/${encodeURIComponent(key)}`);

    // Add query parameters
    if (options?.expirationTtl) {
        // Ensure minimum TTL of 60 seconds as per Cloudflare requirements
        const ttl = Math.max(60, options.expirationTtl);
        url.searchParams.set('expiration_ttl', String(ttl));
    }

    // Prepare request body
    let body: string | FormData = value;
    let requestHeaders: Record<string, string> = {
        ...headers,
        'Content-Type': 'text/plain',
    };

    // If metadata is provided, use multipart form data
    if (options?.metadata) {
        const formData = new FormData();
        formData.append('value', value);
        formData.append('metadata', JSON.stringify(options.metadata));
        body = formData;
        // Remove Content-Type to let fetch set it with boundary
        requestHeaders = { ...headers };
    }

    const res = await fetch(url, {
        method: 'PUT',
        headers: requestHeaders,
        body,
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(
            `KV put failed ${res.status}: ${errorText} (key: ${key})`
        );
    }
}

export async function kvPutJSON(
    key: string,
    value: unknown,
    options?: KvPutOptions
): Promise<void> {
    return kvPutString(key, JSON.stringify(value), options);
}

export async function kvDelete(key: string): Promise<void> {
    const { baseUrl, headers } = getKvConfig();
    const url = `${baseUrl}/values/${encodeURIComponent(key)}`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers,
    });

    if (res.status === 404) return; // Key doesn't exist, that's fine
    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`KV delete failed ${res.status}: ${errorText}`);
    }
}

export async function kvList(options?: KvListOptions): Promise<KvListResponse> {
    const { baseUrl, headers } = getKvConfig();
    const url = new URL(`${baseUrl}/keys`);

    if (options?.limit)
        url.searchParams.set('limit', String(Math.min(1000, options.limit)));
    if (options?.cursor) url.searchParams.set('cursor', options.cursor);
    if (options?.prefix) url.searchParams.set('prefix', options.prefix);

    const res = await fetch(url, { headers });

    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`KV list failed ${res.status}: ${errorText}`);
    }

    return (await res.json()) as KvListResponse;
}

export async function kvBulkDelete(keys: string[]): Promise<void> {
    const { baseUrl, headers } = getKvConfig();
    const url = `${baseUrl}/bulk`;

    const res = await fetch(url, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(keys),
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        throw new Error(`KV bulk delete failed ${res.status}: ${errorText}`);
    }
}

export function getClientIpFromHeaders(headers: Headers): string {
    // Cloudflare-specific headers (most reliable)
    const cfIp = headers.get('cf-connecting-ip');
    if (cfIp) return cfIp;

    // Standard proxy headers
    const xff = headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0]!.trim();

    const real = headers.get('x-real-ip');
    if (real) return real;

    // Fallback
    return '0.0.0.0';
}

// Health check utility
export async function kvHealthCheck(): Promise<{
    ok: boolean;
    roundtripMs: number;
    error?: string;
}> {
    const start = Date.now();
    const testKey = `health:${Date.now()}:${Math.random()}`;
    const testValue = { timestamp: start, nonce: Math.random() };

    try {
        // Write test data
        await kvPutJSON(testKey, testValue, { expirationTtl: 60 });

        // Read it back
        const readBack = await kvGetJSON<typeof testValue>(testKey);

        // Clean up
        await kvDelete(testKey);

        const roundtripMs = Date.now() - start;
        const ok = Boolean(readBack && readBack.nonce === testValue.nonce);

        return { ok, roundtripMs };
    } catch (error) {
        return {
            ok: false,
            roundtripMs: Date.now() - start,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
