import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  Shield, 
  Code, 
  Server, 
  Database, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Key,
  AlertTriangle,
  Terminal
} from 'lucide-react';

const quickStartSteps = [
  {
    step: 1,
    title: 'Generate API Key',
    description: 'Create an API key in your dashboard',
    href: '/dashboard/api-keys',
    icon: Key
  },
  {
    step: 2,
    title: 'Choose Your API',
    description: 'Use REST endpoints or tRPC procedures',
    href: '/api-docs/rest-api',
    icon: Server
  },
  {
    step: 3,
    title: 'Start Building',
    description: 'Integrate with our client examples',
    href: '/api-docs/examples',
    icon: Code
  }
];

const apiFeatures = [
  {
    title: 'Security First',
    description: 'AES-256-GCM encryption with zero-knowledge architecture. Your data is encrypted before it leaves your device.',
    icon: Shield,
    details: ['Client-side encryption', 'Zero-knowledge storage', 'PBKDF2 key derivation', 'Secure key management']
  },
  {
    title: 'High Performance',
    description: 'Sub-200ms response times with intelligent caching and optimized database queries.',
    icon: Zap,
    details: ['<200ms response times', 'Intelligent caching', 'Rate limiting', 'Connection pooling']
  },
  {
    title: 'Type Safe',
    description: 'Full TypeScript support with tRPC for end-to-end type safety and excellent developer experience.',
    icon: Code,
    details: ['End-to-end type safety', 'Auto-completion', 'Runtime validation', 'Generated schemas']
  },
  {
    title: 'Developer Experience',
    description: 'Comprehensive documentation, client libraries, and examples for quick integration.',
    icon: Terminal,
    details: ['REST & tRPC APIs', 'Multiple client libraries', 'Comprehensive docs', 'Live examples']
  }
];

const apiSections = [
  {
    title: 'Authentication',
    description: 'Session cookies and API key authentication with rate limiting and security features.',
    href: '/api-docs/authentication',
    icon: Shield,
    badge: 'Security'
  },
  {
    title: 'REST API',
    description: 'RESTful endpoints for environment management, health checks, and file operations.',
    href: '/api-docs/rest-api',
    icon: Server,
    badge: '3 Endpoints'
  },
  {
    title: 'tRPC Procedures',
    description: 'Type-safe procedures for projects, environments, API keys, and user management.',
    href: '/api-docs/trpc',
    icon: Database,
    badge: '23 Procedures'
  },
  {
    title: 'Client Examples',
    description: 'Integration examples in TypeScript, Python, and cURL with complete code samples.',
    href: '/api-docs/examples',
    icon: Code,
    badge: '3 Languages'
  },
  {
    title: 'Error Handling',
    description: 'Standard error formats, HTTP status codes, and troubleshooting information.',
    href: '/api-docs/errors',
    icon: AlertTriangle,
    badge: 'Reference'
  }
];

export default function ApiOverview() {
	return (
		<div className="space-y-8">
			{/* Hero Section */}
			<section className="text-center space-y-6">
				<div className="space-y-4">
					<Badge variant="outline" className="px-3 py-1">
						Complete API Reference
					</Badge>
					<h1 className="text-4xl font-bold tracking-tight">
						EnvStore API Documentation
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Secure, fast, and type-safe APIs for managing environment variables. 
						Built with zero-knowledge encryption and developer experience in mind.
					</p>
				</div>
				
				<div className="flex flex-wrap items-center justify-center gap-3 mt-6">
					<Button asChild size="lg">
						<Link href="/api-docs/authentication">
							Get Started <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/dashboard/api-keys">
							Generate API Key
						</Link>
					</Button>
				</div>
			</section>

			{/* Quick Start */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Quick Start</h2>
					<p className="text-muted-foreground">Get up and running with EnvStore in minutes</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{quickStartSteps.map((step) => {
						const Icon = step.icon;
						return (
							<Card key={step.step} className="relative group hover:shadow-md transition-shadow">
								<CardHeader>
									<div className="flex items-center space-x-3">
										<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-sm font-semibold text-primary">{step.step}</span>
										</div>
										<Icon className="h-5 w-5 text-muted-foreground" />
									</div>
									<CardTitle className="text-lg">{step.title}</CardTitle>
									<CardDescription>{step.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant="outline" size="sm" asChild className="w-full">
										<Link href={step.href}>
											Learn More <ArrowRight className="ml-2 h-3 w-3" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* API Features */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Why Choose EnvStore API?</h2>
					<p className="text-muted-foreground">Built with security, performance, and developer experience as priorities</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{apiFeatures.map((feature) => {
						const Icon = feature.icon;
						return (
							<Card key={feature.title} className="group hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
											<Icon className="h-5 w-5 text-primary" />
										</div>
										{feature.title}
									</CardTitle>
									<CardDescription>{feature.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{feature.details.map((detail, index) => (
											<li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
												<CheckCircle className="h-4 w-4 text-green-500" />
												{detail}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* API Sections */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Explore the API</h2>
					<p className="text-muted-foreground">Comprehensive documentation for all endpoints and procedures</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{apiSections.map((section) => {
						const Icon = section.icon;
						return (
							<Link key={section.title} href={section.href}>
								<Card className="group hover:shadow-md transition-shadow cursor-pointer">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Icon className="h-5 w-5 text-primary" />
												<CardTitle className="text-base">{section.title}</CardTitle>
											</div>
											<Badge variant="secondary" className="text-xs">
												{section.badge}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<CardDescription className="text-sm">
											{section.description}
										</CardDescription>
										<div className="mt-3 flex items-center gap-1 text-sm text-primary group-hover:translate-x-1 transition-transform">
											Learn more <ArrowRight className="h-3 w-3" />
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})}
				</div>
			</section>

			{/* Quick Example */}
			<section className="space-y-6">
				<div className="text-center">
					<h2 className="text-2xl font-semibold mb-2">Quick Example</h2>
					<p className="text-muted-foreground">Upload an environment file in just a few lines of code</p>
				</div>
				
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Terminal className="h-5 w-5" />
							Environment Upload Example
						</CardTitle>
						<CardDescription>
							Upload and encrypt environment variables using the REST API
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CodeBlock 
							code={`curl -X POST 'https://your-domain.com/api/v1/env/upload' \\
  -H 'x-api-key: esk_live_your_api_key_here' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "environment": "production", 
    "content": "DATABASE_URL=postgres://user:pass@host:5432/db\\nAPI_KEY=secret123",
    "passphrase": "your-secure-passphrase"
  }'

# Response
{
  "id": "env_abc123def456",
  "version": 1
}`}
							language="bash"
						/>
					</CardContent>
				</Card>
			</section>

			{/* CTA Section */}
			<section className="text-center space-y-6 py-8 border-t">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Ready to integrate?</h2>
					<p className="text-muted-foreground">
						Generate your API key and start building secure environment variable management into your applications.
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
						<Link href="/api-docs/authentication">
							View Authentication Guide
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/examples">
							See Examples
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}


