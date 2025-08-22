import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  Shield, 
  Key, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Server,
  Eye,
  ArrowRight
} from 'lucide-react';

const securityFeatures = [
  {
    title: 'HTTP-Only Cookies',
    description: 'Session cookies are HTTP-only to prevent XSS attacks',
    icon: Shield
  },
  {
    title: 'CSRF Protection',
    description: 'Double-submit cookies protect against CSRF attacks',
    icon: Lock
  },
  {
    title: 'Secure Flags',
    description: 'Cookies use secure flag in production environments',
    icon: CheckCircle
  },
  {
    title: 'SameSite Policy',
    description: 'Strict SameSite policy prevents cross-site cookie sending',
    icon: Eye
  }
];

const rateLimits = [
  {
    endpoint: 'Authentication Endpoints',
    limit: '5 attempts per 15 minutes',
    scope: 'Per IP address',
    description: 'Login, signup, and password reset endpoints'
  },
  {
    endpoint: 'Pre-authenticated REST',
    limit: '20-30 requests per minute',
    scope: 'Per IP address',
    description: 'Before API key validation'
  },
  {
    endpoint: 'Post-authenticated REST',
    limit: '60-120 requests per minute', 
    scope: 'Per API key',
    description: 'After successful API key validation'
  },
  {
    endpoint: 'tRPC Procedures',
    limit: 'No explicit limits',
    scope: 'Per session',
    description: 'Session-based rate limiting applies'
  }
];

export default function AuthenticationPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<section className="space-y-4">
				<div className="space-y-2">
					<Badge variant="outline" className="w-fit">
						Security & Access Control
					</Badge>
					<h1 className="text-3xl font-bold tracking-tight">Authentication</h1>
					<p className="text-xl text-muted-foreground">
						Secure access to EnvStore APIs through session cookies and API keys with comprehensive rate limiting and security features.
					</p>
				</div>
			</section>

			{/* Authentication Methods */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Authentication Methods</h2>
					<p className="text-muted-foreground">
						EnvStore supports two primary authentication methods depending on your use case.
					</p>
				</div>

				<Tabs defaultValue="session" className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="session" className="flex items-center gap-2">
							<Shield className="h-4 w-4" />
							Session Authentication
						</TabsTrigger>
						<TabsTrigger value="apikey" className="flex items-center gap-2">
							<Key className="h-4 w-4" />
							API Key Authentication
						</TabsTrigger>
					</TabsList>

					<TabsContent value="session" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="h-5 w-5 text-blue-500" />
									Session-Based Authentication
								</CardTitle>
								<CardDescription>
									Ideal for web applications and browser-based interactions with automatic session management.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<h4 className="font-medium text-lg">How It Works</h4>
										<ul className="space-y-2 text-sm text-muted-foreground">
											<li className="flex items-start gap-2">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												User logs in with email/password
											</li>
											<li className="flex items-start gap-2">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												Server creates secure session
											</li>
											<li className="flex items-start gap-2">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												HTTP-only cookie sent to client
											</li>
											<li className="flex items-start gap-2">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												Automatic authentication on requests
											</li>
										</ul>
									</div>
									
									<div className="space-y-4">
										<h4 className="font-medium text-lg">Security Features</h4>
										<div className="grid grid-cols-1 gap-3">
											{securityFeatures.map((feature) => {
												const Icon = feature.icon;
												return (
													<div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
														<Icon className="h-4 w-4 text-primary mt-0.5" />
														<div>
															<div className="font-medium text-sm">{feature.title}</div>
															<div className="text-xs text-muted-foreground">{feature.description}</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Login Example</h4>
									<CodeBlock 
										code={`// Login request
curl -X POST 'https://your-domain.com/api/auth/login' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }' \\
  -c cookies.txt  // Save session cookie

// Response headers include:
Set-Cookie: session=abc123...; HttpOnly; Secure; SameSite=Strict

// Subsequent requests automatically include session
curl -X GET 'https://your-domain.com/api/trpc/listProjects' \\
  -b cookies.txt  // Load saved cookies`}
										language="bash"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="apikey" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Key className="h-5 w-5 text-amber-500" />
									API Key Authentication
								</CardTitle>
								<CardDescription>
									Perfect for server-to-server communication, CI/CD pipelines, and programmatic access.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<h4 className="font-medium text-lg">Key Format</h4>
										<div className="space-y-3">
											<div className="p-3 bg-muted/50 rounded-lg border">
												<div className="font-mono text-sm break-all">
													esk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4
												</div>
												<div className="text-xs text-muted-foreground mt-1">
													32-character token with esk_live_ prefix
												</div>
											</div>
											<div className="text-sm text-muted-foreground space-y-1">
												<div><strong>Prefix:</strong> esk_live_ (production) or esk_test_ (development)</div>
												<div><strong>Length:</strong> 40 characters total (8 prefix + 32 token)</div>
												<div><strong>Encoding:</strong> Base62 (alphanumeric)</div>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<h4 className="font-medium text-lg">Usage</h4>
										<CodeBlock 
											code={`// Header format
x-api-key: esk_live_your_32_character_token

// Example request
curl -X GET 'https://your-domain.com/api/v1/kv/health' \\
  -H 'x-api-key: esk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4'`}
											language="bash"
										/>
									</div>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Generate API Key</h4>
									<div className="flex flex-col sm:flex-row gap-3">
										<Button asChild>
											<Link href="/dashboard/api-keys">
												<Key className="mr-2 h-4 w-4" />
												Generate New Key
											</Link>
										</Button>
										<Button variant="outline" asChild>
											<Link href="/api-docs/examples">
												View Usage Examples
											</Link>
										</Button>
									</div>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Key Management</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="p-4 border rounded-lg">
											<h5 className="font-medium mb-2">Creation</h5>
											<p className="text-sm text-muted-foreground">
												Generate keys in dashboard with custom names for organization.
											</p>
										</div>
										<div className="p-4 border rounded-lg">
											<h5 className="font-medium mb-2">Rotation</h5>
											<p className="text-sm text-muted-foreground">
												Regular rotation recommended. Old keys can be revoked instantly.
											</p>
										</div>
										<div className="p-4 border rounded-lg">
											<h5 className="font-medium mb-2">Monitoring</h5>
											<p className="text-sm text-muted-foreground">
												Track usage, last used timestamp, and request patterns.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</section>

			{/* Rate Limiting */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Clock className="h-6 w-6" />
						Rate Limiting
					</h2>
					<p className="text-muted-foreground">
						Comprehensive rate limiting protects our infrastructure and ensures fair usage across all users.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4">
					{rateLimits.map((limit, index) => (
						<Card key={index}>
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{limit.endpoint}</CardTitle>
									<Badge variant="secondary">{limit.scope}</Badge>
								</div>
								<CardDescription>{limit.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{limit.limit}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Error Responses */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<AlertCircle className="h-6 w-6" />
						Authentication Errors
					</h2>
					<p className="text-muted-foreground">
						Common authentication error responses and how to handle them.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Badge variant="destructive">401</Badge>
								Unauthorized
							</CardTitle>
							<CardDescription>Invalid or missing credentials</CardDescription>
						</CardHeader>
						<CardContent>
							<CodeBlock 
								code={`{
  "error": "unauthorized",
  "message": "Invalid API key or session"
}

// Common causes:
// - Missing x-api-key header
// - Invalid API key format
// - Expired or revoked API key
// - Missing session cookie`}
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
  "error": "rate_limited",
  "message": "Too many requests"
}

// Response headers:
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T10:30:00Z
Retry-After: 60`}
								language="json"
							/>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Best Practices */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Security Best Practices</h2>
					<p className="text-muted-foreground">
						Follow these guidelines to maintain secure integrations with EnvStore.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Key className="h-5 w-5 text-green-500" />
								API Key Security
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Store keys in environment variables, never in code
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Use different keys for different environments
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Rotate keys regularly (monthly recommended)
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Revoke unused or compromised keys immediately
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Monitor key usage patterns for anomalies
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5 text-blue-500" />
								Session Security
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Always use HTTPS in production
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Implement proper logout functionality
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Handle session expiration gracefully
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Validate sessions on sensitive operations
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
									Use secure, httpOnly cookies
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Next Steps */}
			<section className="space-y-6 pt-8 border-t">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-semibold">Ready to authenticate?</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Choose your authentication method and start integrating with EnvStore&apos;s secure APIs.
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
						<Link href="/api-docs/rest-api">
							<Server className="mr-2 h-4 w-4" />
							REST API Docs
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/examples">
							View Examples <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}