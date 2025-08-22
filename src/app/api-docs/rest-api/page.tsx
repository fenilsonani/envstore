import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  Shield, 
  AlertCircle,
  Clock,
  Database,
  Key,
  Upload,
  Download,
  Heart,
  ArrowRight
} from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/kv/health',
    title: 'Health Check',
    description: 'System health check and KV store connectivity validation',
    auth: 'None',
    rateLimit: '10 requests/minute (unauthenticated)',
    icon: Heart,
    color: 'green'
  },
  {
    method: 'POST',
    path: '/api/v1/env/upload',
    title: 'Upload Environment',
    description: 'Upload environment variables with automatic encryption',
    auth: 'API Key Required',
    rateLimit: '20/min (pre-auth), 60/min (post-auth)',
    icon: Upload,
    color: 'blue'
  },
  {
    method: 'GET',
    path: '/api/v1/env/latest',
    title: 'Get Latest Environment',
    description: 'Retrieve the latest version of an environment file',
    auth: 'API Key Required',
    rateLimit: '60/min (pre-auth), 120/min (post-auth)',
    icon: Download,
    color: 'purple'
  }
];

export default function RestApiPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<section className="space-y-4">
				<div className="space-y-2">
					<Badge variant="outline" className="w-fit">
						RESTful HTTP API
					</Badge>
					<h1 className="text-3xl font-bold tracking-tight">REST API Endpoints</h1>
					<p className="text-xl text-muted-foreground">
						RESTful HTTP endpoints for environment management, health monitoring, and secure file operations.
					</p>
				</div>
			</section>

			{/* Quick Reference */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Quick Reference</h2>
					<p className="text-muted-foreground">
						All REST endpoints are available under the <code className="bg-muted px-1 py-0.5 rounded text-sm">/api/v1</code> prefix.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4">
					{endpoints.map((endpoint) => {
						const Icon = endpoint.icon;
						const methodColor = endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'outline';
						const authColor = endpoint.auth === 'None' ? 'outline' : 'destructive';
						
						return (
							<Card key={endpoint.path} className="group hover:shadow-md transition-shadow">
								<CardHeader className="pb-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Icon className={`h-5 w-5 text-${endpoint.color}-500`} />
											<div>
												<CardTitle className="flex items-center gap-2">
													<Badge variant={methodColor}>{endpoint.method}</Badge>
													<code className="text-sm font-mono">{endpoint.path}</code>
												</CardTitle>
												<CardDescription className="mt-1">{endpoint.description}</CardDescription>
											</div>
										</div>
										<Badge variant={authColor} className="text-xs">
											{endpoint.auth}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="flex items-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{endpoint.rateLimit}
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Health Check Endpoint */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Heart className="h-6 w-6 text-green-500" />
						Health Check
					</h2>
					<p className="text-muted-foreground">
						Monitor system health and KV store connectivity without authentication.
					</p>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Badge variant="secondary">GET</Badge>
								<code>/api/v1/kv/health</code>
							</CardTitle>
							<Badge variant="outline">No Authentication</Badge>
						</div>
						<CardDescription>
							Performs a comprehensive health check including KV store connectivity and environment validation.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<h4 className="font-medium text-lg">Request</h4>
								<CodeBlock 
									code={`curl -X GET 'https://your-domain.com/api/v1/kv/health' \\
  -H 'Accept: application/json'`}
									language="bash"
								/>
								
								<div className="space-y-2">
									<h5 className="font-medium">Rate Limiting</h5>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• 10 requests per minute (unauthenticated)</li>
										<li>• IP-based rate limiting</li>
										<li>• No API key required</li>
									</ul>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="font-medium text-lg">Response Schema</h4>
								<CodeBlock 
									code={`interface HealthCheckResponse {
  ok: boolean;              // Overall health status
  error?: string;           // Error message if not ok
  config?: {
    hasAccount: boolean;    // CF account configured
    hasNamespace: boolean;  // KV namespace configured  
    hasToken: boolean;      // API token configured
  };
  timestamp?: number;       // Response timestamp
}`}
									language="typescript"
								/>
							</div>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Example Responses</h4>
							<Tabs defaultValue="success" className="w-full">
								<TabsList>
									<TabsTrigger value="success">Healthy</TabsTrigger>
									<TabsTrigger value="config-error">Configuration Error</TabsTrigger>
									<TabsTrigger value="kv-error">KV Store Error</TabsTrigger>
								</TabsList>
								
								<TabsContent value="success">
									<CodeBlock 
										code={`HTTP/1.1 200 OK
Content-Type: application/json
X-KV-Health: OK

{
  "ok": true,
  "config": {
    "hasAccount": true,
    "hasNamespace": true, 
    "hasToken": true
  },
  "timestamp": 1642234567890
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="config-error">
									<CodeBlock 
										code={`HTTP/1.1 500 Internal Server Error
Content-Type: application/json
X-KV-Health: FAIL

{
  "ok": false,
  "error": "kv_env_missing",
  "config": {
    "hasAccount": true,
    "hasNamespace": false,
    "hasToken": true
  }
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="kv-error">
									<CodeBlock 
										code={`HTTP/1.1 500 Internal Server Error
Content-Type: application/json 
X-KV-Health: FAIL

{
  "ok": false,
  "error": "kv_connection_failed"
}`}
										language="json"
									/>
								</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Upload Environment Endpoint */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Upload className="h-6 w-6 text-blue-500" />
						Upload Environment
					</h2>
					<p className="text-muted-foreground">
						Upload and encrypt environment variables with automatic versioning and secure storage.
					</p>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Badge>POST</Badge>
								<code>/api/v1/env/upload</code>
							</CardTitle>
							<Badge variant="destructive">API Key Required</Badge>
						</div>
						<CardDescription>
							Upload environment files with client-side encryption or pre-encrypted payloads.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<h4 className="font-medium text-lg">Authentication & Rate Limits</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 border rounded-lg">
									<h5 className="font-medium mb-2">Pre-Authentication</h5>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• 20 requests per minute per IP</li>
										<li>• Applied before API key validation</li>
										<li>• Prevents brute force attacks</li>
									</ul>
								</div>
								<div className="p-4 border rounded-lg">
									<h5 className="font-medium mb-2">Post-Authentication</h5>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• 60 requests per minute per API key</li>
										<li>• Applied after successful validation</li>
										<li>• Higher limits for authenticated users</li>
									</ul>
								</div>
							</div>
						</div>

						<Tabs defaultValue="plaintext" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="plaintext">Plaintext Upload</TabsTrigger>
								<TabsTrigger value="encrypted">Pre-encrypted Upload</TabsTrigger>
							</TabsList>

							<TabsContent value="plaintext" className="space-y-6">
								<div className="space-y-4">
									<h4 className="font-medium text-lg">Request Schema</h4>
									<CodeBlock 
										code={`interface UploadPlaintextRequest {
  projectId: string;       // UUID format, must exist and be owned by user
  environment: string;     // Environment name (e.g., "production", "staging")
  content: string;         // Raw .env file content
  passphrase: string;      // Encryption passphrase (minimum 8 characters)
}

// Content example:
// "DATABASE_URL=postgres://user:pass@host:5432/db\\nAPI_KEY=secret123"`}
										language="typescript"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Example Request</h4>
									<CodeBlock 
										code={`curl -X POST 'https://your-domain.com/api/v1/env/upload' \\
  -H 'x-api-key: esk_live_your_32_character_api_key' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "environment": "production",
    "content": "DATABASE_URL=postgres://user:pass@host:5432/db\\nAPI_KEY=secret_key_here\\nREDIS_URL=redis://localhost:6379",
    "passphrase": "your-secure-passphrase-min-8-chars"
  }'`}
										language="bash"
									/>
								</div>

								<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<Shield className="h-5 w-5 text-blue-500 mt-0.5" />
										<div>
											<h5 className="font-medium text-blue-900 dark:text-blue-100">Encryption Process</h5>
											<p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
												Content is encrypted client-side using AES-256-GCM with PBKDF2 key derivation (210,000 iterations). 
												The server never sees your plaintext data.
											</p>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="encrypted" className="space-y-6">
								<div className="space-y-4">
									<h4 className="font-medium text-lg">Request Schema</h4>
									<CodeBlock 
										code={`interface UploadEncryptedRequest {
  projectId: string;       // UUID format
  environment: string;     // Environment name
  ciphertext: string;      // AES-256-GCM encrypted content (base64)
  iv: string;              // Initialization vector (base64)
  salt: string;            // PBKDF2 salt (base64)  
  checksum: string;        // Content integrity checksum
}`}
										language="typescript"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Example Request</h4>
									<CodeBlock 
										code={`curl -X POST 'https://your-domain.com/api/v1/env/upload' \\
  -H 'x-api-key: esk_live_your_32_character_api_key' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000", 
    "environment": "production",
    "ciphertext": "base64_encoded_encrypted_content_here",
    "iv": "base64_encoded_initialization_vector", 
    "salt": "base64_encoded_pbkdf2_salt",
    "checksum": "sha256_content_checksum"
  }'`}
										language="bash"
									/>
								</div>

								<div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
										<div>
											<h5 className="font-medium text-amber-900 dark:text-amber-100">Advanced Usage</h5>
											<p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
												Pre-encrypted uploads allow you to implement your own encryption logic while maintaining compatibility 
												with EnvStore&apos;s storage format.
											</p>
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Success Response</h4>
							<CodeBlock 
								code={`HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "env_abc123def456ghi789",    // Unique environment file ID
  "version": 3                       // Auto-incremented version number
}

// The version number is automatically incremented for each upload
// to the same project/environment combination`}
								language="json"
							/>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Get Latest Environment Endpoint */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Download className="h-6 w-6 text-purple-500" />
						Get Latest Environment
					</h2>
					<p className="text-muted-foreground">
						Retrieve the most recent version of an environment file with intelligent caching.
					</p>
				</div>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="flex items-center gap-2">
								<Badge variant="secondary">GET</Badge>
								<code>/api/v1/env/latest</code>
							</CardTitle>
							<Badge variant="destructive">API Key Required</Badge>
						</div>
						<CardDescription>
							Fetch the latest version of an encrypted environment file with caching support.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<h4 className="font-medium text-lg">Query Parameters</h4>
							<CodeBlock 
								code={`// Required parameters
projectId: string     // UUID of the project (must be owned by authenticated user)
environment: string   // Environment name (case-sensitive)

// Example URL:
/api/v1/env/latest?projectId=550e8400-e29b-41d4-a716-446655440000&environment=production`}
								language="typescript"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Authentication & Rate Limits</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 border rounded-lg">
									<h5 className="font-medium mb-2">Pre-Authentication</h5>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• 30 requests per minute per IP</li>
										<li>• Higher limit due to read-only nature</li>
									</ul>
								</div>
								<div className="p-4 border rounded-lg">
									<h5 className="font-medium mb-2">Post-Authentication</h5>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• 120 requests per minute per API key</li>
										<li>• Generous limits for retrieval operations</li>
									</ul>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Example Request</h4>
							<CodeBlock 
								code={`curl -X GET 'https://your-domain.com/api/v1/env/latest?projectId=550e8400-e29b-41d4-a716-446655440000&environment=production' \\
  -H 'x-api-key: esk_live_your_32_character_api_key' \\
  -H 'Accept: application/json'`}
								language="bash"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Response Schema</h4>
							<CodeBlock 
								code={`interface LatestEnvResponse {
  id: string;              // Unique environment file ID
  version: number;         // Version number of this environment  
  ciphertext: string;      // AES-256-GCM encrypted content (base64)
  iv: string;              // Initialization vector (base64)
  salt: string;            // PBKDF2 salt (base64)
  checksum: string;        // Content integrity checksum
  createdAt?: string;      // ISO 8601 timestamp (optional)
}`}
								language="typescript"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Caching Headers</h4>
							<CodeBlock 
								code={`// Response includes caching information
X-Cache: HIT                           // Cache status (HIT/MISS)
Cache-Control: private, max-age=60     // Client caching instructions
ETag: "abc123def456"                   // Entity tag for validation

// Cache behavior:
// - 60-second TTL for cached responses
// - Automatic cache invalidation on new uploads
// - Per-project/environment cache keys`}
								language="bash"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Example Response</h4>
							<Tabs defaultValue="success" className="w-full">
								<TabsList>
									<TabsTrigger value="success">Success (Cache MISS)</TabsTrigger>
									<TabsTrigger value="cached">Success (Cache HIT)</TabsTrigger>
									<TabsTrigger value="not-found">Not Found</TabsTrigger>
								</TabsList>
								
								<TabsContent value="success">
									<CodeBlock 
										code={`HTTP/1.1 200 OK
Content-Type: application/json
X-Cache: MISS
Cache-Control: private, max-age=60
ETag: "v3-abc123def456"

{
  "id": "env_abc123def456ghi789",
  "version": 3,
  "ciphertext": "base64_encoded_encrypted_content",
  "iv": "base64_encoded_initialization_vector", 
  "salt": "base64_encoded_pbkdf2_salt",
  "checksum": "sha256_content_checksum",
  "createdAt": "2024-01-15T10:30:00.000Z"
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="cached">
									<CodeBlock 
										code={`HTTP/1.1 200 OK
Content-Type: application/json  
X-Cache: HIT
Cache-Control: private, max-age=60
ETag: "v3-abc123def456"

{
  "id": "env_abc123def456ghi789",
  "version": 3,
  "ciphertext": "base64_encoded_encrypted_content",
  "iv": "base64_encoded_initialization_vector",
  "salt": "base64_encoded_pbkdf2_salt", 
  "checksum": "sha256_content_checksum"
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="not-found">
									<CodeBlock 
										code={`HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "not_found",
  "message": "Environment not found for the specified project"
}`}
										language="json"
									/>
								</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Error Responses */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<AlertCircle className="h-6 w-6" />
						Common Error Responses
					</h2>
					<p className="text-muted-foreground">
						Standard error formats returned by all REST API endpoints.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="destructive">401</Badge>
								Unauthorized
							</CardTitle>
							<CardDescription>Invalid or missing API key</CardDescription>
						</CardHeader>
						<CardContent>
							<CodeBlock 
								code={`{
  "error": "unauthorized",
  "message": "Invalid or missing API key"
}

// Causes:
// - Missing x-api-key header
// - Invalid API key format  
// - Revoked/expired API key`}
								language="json"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="destructive">429</Badge>
								Rate Limited
							</CardTitle>
							<CardDescription>Too many requests within time window</CardDescription>
						</CardHeader>
						<CardContent>
							<CodeBlock 
								code={`{
  "error": "rate_limited"
}

// Headers:
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T10:45:00Z  
Retry-After: 45`}
								language="json"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="destructive">400</Badge>
								Bad Request
							</CardTitle>
							<CardDescription>Invalid request format or parameters</CardDescription>
						</CardHeader>
						<CardContent>
							<CodeBlock 
								code={`{
  "error": "invalid", 
  "message": "Invalid request body or parameters"
}

// Causes:
// - Invalid JSON format
// - Missing required fields
// - Invalid UUID format`}
								language="json"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="destructive">404</Badge>
								Not Found
							</CardTitle>
							<CardDescription>Resource does not exist</CardDescription>
						</CardHeader>
						<CardContent>
							<CodeBlock 
								code={`{
  "error": "not_found",
  "message": "Project or environment not found"
}

// Causes:
// - Invalid project ID
// - Project not owned by user
// - Environment doesn't exist`}
								language="json"
							/>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Next Steps */}
			<section className="space-y-6 pt-8 border-t">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-semibold">Ready to integrate?</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Start using the REST API endpoints with your API key and explore our comprehensive examples.
					</p>
				</div>
				
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button asChild size="lg">
						<Link href="/dashboard/api-keys">
							<Key className="mr-2 h-4 w-4" />
							Generate API Key
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/examples">
							View Examples <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/trpc">
							<Database className="mr-2 h-4 w-4" />
							tRPC Procedures
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}