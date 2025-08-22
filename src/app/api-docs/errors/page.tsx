import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  AlertTriangle, 
  XCircle,
  Clock,
  Shield,
  Server,
  Code,
  CheckCircle,
  ArrowRight,
  Info,
  Zap,
  Bug,
  HelpCircle
} from 'lucide-react';

const httpStatusCodes = [
  {
    code: 200,
    title: 'OK',
    description: 'Request successful',
    color: 'green',
    icon: CheckCircle,
    details: 'The request was successful and returned the expected data.'
  },
  {
    code: 400,
    title: 'Bad Request',
    description: 'Invalid request format or parameters',
    color: 'yellow',
    icon: AlertTriangle,
    details: 'The request is malformed, contains invalid parameters, or fails validation.'
  },
  {
    code: 401,
    title: 'Unauthorized',
    description: 'Invalid or missing authentication',
    color: 'red',
    icon: XCircle,
    details: 'Authentication is required but was not provided or is invalid.'
  },
  {
    code: 403,
    title: 'Forbidden',
    description: 'Insufficient permissions',
    color: 'red',
    icon: Shield,
    details: 'Authentication was successful but the user lacks permission for this resource.'
  },
  {
    code: 404,
    title: 'Not Found',
    description: 'Resource does not exist',
    color: 'blue',
    icon: HelpCircle,
    details: 'The requested resource was not found or the user does not have access to it.'
  },
  {
    code: 429,
    title: 'Too Many Requests',
    description: 'Rate limit exceeded',
    color: 'amber',
    icon: Clock,
    details: 'The client has exceeded the allowed rate limit for the endpoint.'
  },
  {
    code: 500,
    title: 'Internal Server Error',
    description: 'Server-side error',
    color: 'red',
    icon: Server,
    details: 'An unexpected error occurred on the server side.'
  }
];

const commonErrors = [
  {
    error: 'unauthorized',
    description: 'Invalid or missing API key/session',
    solutions: [
      'Verify your API key is correct and active',
      'Ensure the x-api-key header is included',
      'Check that your session is still valid',
      'Generate a new API key if needed'
    ]
  },
  {
    error: 'rate_limited',
    description: 'Too many requests within the time window',
    solutions: [
      'Wait for the time specified in Retry-After header',
      'Implement exponential backoff in your client',
      'Reduce request frequency',
      'Consider upgrading your plan for higher limits'
    ]
  },
  {
    error: 'invalid',
    description: 'Request validation failed',
    solutions: [
      'Check request body format and required fields',
      'Ensure UUIDs are properly formatted',
      'Validate input parameters match schema requirements',
      'Check Content-Type header is set correctly'
    ]
  },
  {
    error: 'not_found',
    description: 'Resource not found or access denied',
    solutions: [
      'Verify the resource ID is correct',
      'Ensure you have access to the resource',
      'Check that the project/environment exists',
      'Confirm resource ownership'
    ]
  },
  {
    error: 'kv_env_missing',
    description: 'KV store configuration missing',
    solutions: [
      'This is a server-side configuration issue',
      'Contact support if this error persists',
      'Check system status page for known issues'
    ]
  }
];

const troubleshootingSteps = [
  {
    step: 1,
    title: 'Check Authentication',
    description: 'Verify your API key or session is valid and properly formatted',
    icon: Shield,
    actions: [
      'Confirm API key format: esk_live_32_character_token',
      'Verify API key is active in dashboard',
      'Check session cookie is being sent',
      'Test with a fresh API key'
    ]
  },
  {
    step: 2,
    title: 'Validate Request Format',
    description: 'Ensure your request follows the correct schema and format',
    icon: Code,
    actions: [
      'Verify Content-Type: application/json header',
      'Check JSON syntax is valid',
      'Confirm all required fields are present',
      'Validate UUID formats for IDs'
    ]
  },
  {
    step: 3,
    title: 'Check Rate Limits',
    description: 'Monitor rate limiting headers and implement proper backoff',
    icon: Clock,
    actions: [
      'Inspect X-RateLimit-Remaining header',
      'Implement exponential backoff',
      'Respect Retry-After header values',
      'Consider request batching where possible'
    ]
  },
  {
    step: 4,
    title: 'Review Permissions',
    description: 'Ensure you have access to the requested resources',
    icon: Shield,
    actions: [
      'Verify project ownership',
      'Check resource exists and is accessible',
      'Confirm API key has necessary permissions',
      'Test with a different resource'
    ]
  }
];

export default function ErrorsPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<section className="space-y-4">
				<div className="space-y-2">
					<Badge variant="outline" className="w-fit">
						Error Reference & Troubleshooting
					</Badge>
					<h1 className="text-3xl font-bold tracking-tight">Error Handling</h1>
					<p className="text-xl text-muted-foreground">
						Comprehensive guide to API error codes, standard response formats, and troubleshooting steps for common issues.
					</p>
				</div>
			</section>

			{/* Standard Error Format */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Standard Error Format</h2>
					<p className="text-muted-foreground">
						All EnvStore API errors follow a consistent JSON structure for predictable error handling.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Code className="h-5 w-5" />
							Error Response Schema
						</CardTitle>
						<CardDescription>
							Consistent error format across all REST and tRPC endpoints
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<h4 className="font-medium text-lg">TypeScript Interface</h4>
							<CodeBlock 
								code={`interface ApiError {
  error: string;           // Error code identifier
  message?: string;        // Human-readable error description (optional)
  code?: number;           // HTTP status code (optional)
  details?: {              // Additional error context (optional)
    field?: string;        // Field that caused validation error
    reason?: string;       // Specific reason for failure
    [key: string]: any;    // Additional context
  };
}`}
								language="typescript"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Example Error Responses</h4>
							<Tabs defaultValue="validation" className="w-full">
								<TabsList>
									<TabsTrigger value="validation">Validation Error</TabsTrigger>
									<TabsTrigger value="auth">Authentication</TabsTrigger>
									<TabsTrigger value="ratelimit">Rate Limit</TabsTrigger>
								</TabsList>
								
								<TabsContent value="validation">
									<CodeBlock 
										code={`HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "invalid",
  "message": "Request validation failed", 
  "code": 400,
  "details": {
    "field": "projectId",
    "reason": "Invalid UUID format"
  }
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="auth">
									<CodeBlock 
										code={`HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "unauthorized",
  "message": "Invalid or missing API key",
  "code": 401
}`}
										language="json"
									/>
								</TabsContent>
								
								<TabsContent value="ratelimit">
									<CodeBlock 
										code={`HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T10:45:00.000Z
Retry-After: 45

{
  "error": "rate_limited",
  "message": "Rate limit exceeded",
  "code": 429
}`}
										language="json"
									/>
								</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* HTTP Status Codes */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">HTTP Status Codes</h2>
					<p className="text-muted-foreground">
						Complete reference of HTTP status codes used by EnvStore APIs.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{httpStatusCodes.map((status) => {
						const Icon = status.icon;
						const colorClasses = {
							green: 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800',
							yellow: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800',
							red: 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800',
							blue: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800',
							amber: 'border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800'
						};
						
						const iconColor = status.color === 'green' ? 'text-green-500' : 
										  status.color === 'yellow' ? 'text-yellow-500' :
										  status.color === 'red' ? 'text-red-500' :
										  status.color === 'blue' ? 'text-blue-500' :
										  'text-amber-500';

						return (
							<Card key={status.code} className={`border-2 ${colorClasses[status.color as keyof typeof colorClasses]}`}>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2">
										<Icon className={`h-5 w-5 ${iconColor}`} />
										<Badge variant="outline">{status.code}</Badge>
										{status.title}
									</CardTitle>
									<CardDescription>{status.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">{status.details}</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Common Errors */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Common Error Codes</h2>
					<p className="text-muted-foreground">
						Detailed explanations of common error codes and their solutions.
					</p>
				</div>

				<div className="space-y-4">
					{commonErrors.map((error) => (
						<Card key={error.error}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<AlertTriangle className="h-5 w-5 text-amber-500" />
									<code className="bg-muted px-2 py-1 rounded text-sm">{error.error}</code>
								</CardTitle>
								<CardDescription>{error.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<h4 className="font-medium text-sm">Solutions:</h4>
									<ul className="space-y-1">
										{error.solutions.map((solution, index) => (
											<li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												{solution}
											</li>
										))}
									</ul>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Rate Limiting */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Clock className="h-6 w-6" />
						Rate Limiting Details
					</h2>
					<p className="text-muted-foreground">
						Understanding rate limits, headers, and best practices for handling rate-limited responses.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Rate Limiting Headers</CardTitle>
						<CardDescription>
							Headers included with all API responses to help you monitor and handle rate limits
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<h4 className="font-medium text-lg">Response Headers</h4>
							<CodeBlock 
								code={`// Included with all API responses
X-RateLimit-Remaining: "45"                    // Requests remaining in current window
X-RateLimit-Reset: "2024-01-15T10:45:00.000Z"  // When the rate limit resets (ISO 8601)

// Additional headers on 429 responses  
Retry-After: "60"                              // Seconds to wait before retrying
X-RateLimit-Limit: "60"                        // Total requests allowed per window`}
								language="bash"
							/>
						</div>

						<div className="space-y-4">
							<h4 className="font-medium text-lg">Rate Limit Handling Example</h4>
							<Tabs defaultValue="typescript" className="w-full">
								<TabsList>
									<TabsTrigger value="typescript">TypeScript</TabsTrigger>
									<TabsTrigger value="python">Python</TabsTrigger>
									<TabsTrigger value="bash">Bash</TabsTrigger>
								</TabsList>
								
								<TabsContent value="typescript">
									<CodeBlock 
										code={`async function makeApiRequest(url: string, options: RequestInit) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // Check rate limit headers
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      console.log(\`Rate limit: \${remaining} requests remaining\`);
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        console.log(\`Rate limited. Waiting \${retryAfter} seconds...\`);
        
        // Exponential backoff with jitter
        const delay = Math.min(retryAfter * 1000 * Math.pow(2, retryCount), 60000);
        const jitter = Math.random() * 1000;
        
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
        retryCount++;
        continue;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(\`API Error: \${error.error} - \${error.message}\`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (retryCount === maxRetries - 1) {
        throw error;
      }
      retryCount++;
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
    }
  }
}`}
										language="typescript"
									/>
								</TabsContent>
								
								<TabsContent value="python">
									<CodeBlock 
										code={`import asyncio
import httpx
from typing import Dict, Any

async def make_api_request(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs
) -> Dict[str, Any]:
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            response = await client.request(method, url, **kwargs)
            
            # Check rate limit headers
            remaining = response.headers.get('X-RateLimit-Remaining')
            reset = response.headers.get('X-RateLimit-Reset')
            
            print(f"Rate limit: {remaining} requests remaining")
            
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"Rate limited. Waiting {retry_after} seconds...")
                
                # Exponential backoff with jitter
                delay = min(retry_after * (2 ** retry_count), 60)
                jitter = __import__('random').random()
                
                await asyncio.sleep(delay + jitter)
                retry_count += 1
                continue
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            if retry_count == max_retries - 1:
                raise
            retry_count += 1
            
            # Wait before retrying
            await asyncio.sleep(2 ** retry_count)`}
										language="bash"
									/>
								</TabsContent>
								
								<TabsContent value="bash">
									<CodeBlock 
										code={`#!/bin/bash
# Rate limit aware API request function

api_request_with_retry() {
    local url="$1"
    local method="$\\{2:-GET\\}"
    local data="$3"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        # Make the request and capture response + headers
        if [ -n "$data" ]; then
            response=$(curl -s -w "\\\\nHTTP_STATUS:%{http_code}\\\\nRATE_REMAINING:%{header_x_ratelimit_remaining}\\\\nRETRY_AFTER:%{header_retry_after}" \\\\
                -X "$method" \\\
                -H "x-api-key: $API_KEY" \\\
                -H "Content-Type: application/json" \\\
                -d "$data" \\\
                "$url")
        else
            response=$(curl -s -w "\\\\nHTTP_STATUS:%{http_code}\\\\nRATE_REMAINING:%{header_x_ratelimit_remaining}\\\\nRETRY_AFTER:%{header_retry_after}" \\\\
                -X "$method" \\\
                -H "x-api-key: $API_KEY" \\\
                "$url")
        fi
        
        # Parse response
        http_body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | head -n -1)
        http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
        rate_remaining=$(echo "$response" | grep "RATE_REMAINING:" | cut -d: -f2)
        retry_after=$(echo "$response" | grep "RETRY_AFTER:" | cut -d: -f2)
        
        echo "Rate limit: $rate_remaining requests remaining"
        
        if [ "$http_status" -eq 429 ]; then
            retry_delay=$\\{retry_after:-60\\}
            echo "Rate limited. Waiting $retry_delay seconds..."
            sleep "$retry_delay"
            ((retry_count++))
            continue
        fi
        
        if [ "$http_status" -ge 200 ] && [ "$http_status" -lt 300 ]; then
            echo "$http_body"
            return 0
        else
            echo "Request failed with status: $http_status" \>\&2
            echo "$http_body" \>\&2
            
            if [ $retry_count -eq $\(\(max_retries - 1\)\) ]; then
                return 1
            fi
            
            ((retry_count++))
            sleep $\(\(2 ** retry_count\)\)
        fi
    done
}`}
										language="bash"
									/>
								</TabsContent>
							</Tabs>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Troubleshooting Guide */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold flex items-center gap-2">
						<Bug className="h-6 w-6" />
						Troubleshooting Guide
					</h2>
					<p className="text-muted-foreground">
						Step-by-step troubleshooting process for common API integration issues.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{troubleshootingSteps.map((step) => {
						const Icon = step.icon;
						return (
							<Card key={step.step} className="group hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-sm font-semibold text-primary">{step.step}</span>
										</div>
										<div className="flex items-center gap-2">
											<Icon className="h-5 w-5 text-muted-foreground" />
											{step.title}
										</div>
									</CardTitle>
									<CardDescription>{step.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{step.actions.map((action, index) => (
											<li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
												<CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
												{action}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Debug Checklist */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Debug Checklist</h2>
					<p className="text-muted-foreground">
						Quick checklist to diagnose and resolve common API integration issues.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Info className="h-5 w-5 text-blue-500" />
							Pre-flight Debug Checklist
						</CardTitle>
						<CardDescription>
							Run through this checklist before reporting issues or seeking support
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<h4 className="font-medium text-lg">Request Validation</h4>
								<ul className="space-y-2">
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										API key format is correct (esk_live_...)
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Content-Type header is set to application/json
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Request body is valid JSON
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										All required fields are present
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										UUIDs are properly formatted
									</li>
								</ul>
							</div>
							
							<div className="space-y-4">
								<h4 className="font-medium text-lg">Response Analysis</h4>
								<ul className="space-y-2">
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										HTTP status code is as expected
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Response body contains expected fields
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Rate limit headers are being monitored
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Error messages provide actionable information
									</li>
									<li className="flex items-center gap-2 text-sm">
										<input type="checkbox" className="rounded" />
										Retry logic is implemented for 429 errors
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Error Handling Examples */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Error Handling Examples</h2>
					<p className="text-muted-foreground">
						Production-ready error handling patterns for different client libraries.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Zap className="h-5 w-5" />
							Robust Error Handling
						</CardTitle>
						<CardDescription>
							Comprehensive error handling with retries, logging, and graceful degradation
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CodeBlock 
							code={`import { TRPCError } from '@trpc/server';

// Comprehensive error handling wrapper
class ApiErrorHandler {
  static async handleApiCall<T>(
    apiCall: () => Promise<T>,
    context: string = 'API call'
  ): Promise<T | null> {
    try {
      return await apiCall();
    } catch (error) {
      return this.processError(error, context);
    }
  }

  private static processError(error: any, context: string): null {
    // Log the error with context
    console.error(\`[\${context}] Error occurred:\`, error);

    // Handle different error types
    if (error instanceof TRPCError) {
      return this.handleTrpcError(error, context);
    }
    
    if (error.status || error.response?.status) {
      return this.handleHttpError(error, context);
    }

    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      return this.handleNetworkError(error, context);
    }

    // Unknown error
    this.handleUnknownError(error, context);
    return null;
  }

  private static handleTrpcError(error: TRPCError, context: string): null {
    switch (error.code) {
      case 'UNAUTHORIZED':
        console.warn(\`[\${context}] Authentication failed. Please check your session.\`);
        // Redirect to login or refresh session
        break;
      
      case 'FORBIDDEN':
        console.warn(\`[\${context}] Access denied. Insufficient permissions.\`);
        // Show permission error to user
        break;
      
      case 'NOT_FOUND':
        console.warn(\`[\${context}] Resource not found.\`);
        // Handle missing resource gracefully
        break;
      
      case 'BAD_REQUEST':
        console.warn(\`[\${context}] Invalid request: \${error.message}\`);
        // Show validation errors to user
        break;
      
      default:
        console.error(\`[\${context}] Unexpected tRPC error:\`, error);
        // Show generic error message
    }
    
    return null;
  }

  private static handleHttpError(error: any, context: string): null {
    const status = error.status || error.response?.status;
    const data = error.data || error.response?.data;

    switch (status) {
      case 401:
        console.warn(\`[\${context}] Unauthorized - invalid or missing credentials\`);
        // Clear stored credentials and redirect to login
        break;
      
      case 403:
        console.warn(\`[\${context}] Forbidden - insufficient permissions\`);
        // Show access denied message
        break;
      
      case 404:
        console.warn(\`[\${context}] Not found - resource may have been deleted\`);
        // Handle missing resource
        break;
      
      case 429:
        const retryAfter = error.headers?.['retry-after'] || '60';
        console.warn(\`[\${context}] Rate limited - retry after \${retryAfter}s\`);
        // Implement exponential backoff
        break;
      
      case 500:
        console.error(\`[\${context}] Server error - the issue is being investigated\`);
        // Show maintenance message
        break;
      
      default:
        console.error(\`[\${context}] HTTP error \${status}:\`, data?.error || 'Unknown error');
    }

    return null;
  }

  private static handleNetworkError(error: any, context: string): null {
    console.error(\`[\${context}] Network error - please check your connection\`, error);
    // Show offline message and retry options
    return null;
  }

  private static handleUnknownError(error: any, context: string): null {
    console.error(\`[\${context}] Unknown error type:\`, error);
    // Report to error tracking service
    this.reportError(error, context);
    return null;
  }

  private static reportError(error: any, context: string): void {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { context },
        extra: { timestamp: new Date().toISOString() }
      });
    }
  }
}

// Usage examples
export class EnvStoreService {
  async createProject(name: string) {
    return ApiErrorHandler.handleApiCall(
      () => client.createProject.mutate({ name }),
      'Create Project'
    );
  }

  async uploadEnvironment(params: UploadParams) {
    return ApiErrorHandler.handleApiCall(
      () => client.uploadEnv.mutate(params),
      'Upload Environment'
    );
  }

  async getProjects() {
    return ApiErrorHandler.handleApiCall(
      () => client.listProjects.query(),
      'List Projects'
    );
  }
}`}
							language="typescript"
						/>
					</CardContent>
				</Card>
			</section>

			{/* Support & Resources */}
			<section className="space-y-6 pt-8 border-t">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-semibold">Need More Help?</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						If you&apos;re still experiencing issues after following this guide, here are additional resources to help you.
					</p>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="text-center">
						<CardHeader>
							<CardTitle className="flex items-center justify-center gap-2">
								<Code className="h-5 w-5" />
								API Reference
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Review the complete API documentation and examples
							</p>
							<Button variant="outline" size="sm" asChild className="w-full">
								<Link href="/api-docs">
									View Documentation
								</Link>
							</Button>
						</CardContent>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<CardTitle className="flex items-center justify-center gap-2">
								<CheckCircle className="h-5 w-5" />
								System Status
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Check for ongoing issues or maintenance
							</p>
							<Button variant="outline" size="sm" className="w-full">
								Check Status
							</Button>
						</CardContent>
					</Card>

					<Card className="text-center">
						<CardHeader>
							<CardTitle className="flex items-center justify-center gap-2">
								<HelpCircle className="h-5 w-5" />
								Contact Support
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Get help from our technical support team
							</p>
							<Button variant="outline" size="sm" className="w-full">
								Contact Support
							</Button>
						</CardContent>
					</Card>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-3 mt-8">
					<Button asChild size="lg">
						<Link href="/api-docs/examples">
							<Code className="mr-2 h-4 w-4" />
							View Examples
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/dashboard/api-keys">
							Test API Keys <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}