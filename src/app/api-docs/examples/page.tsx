import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  Terminal, 
  Key,
  Shield,
  CheckCircle,
  ArrowRight,
  Globe
} from 'lucide-react';
import { 
  SiTypescript,
  SiPython,
  SiNodedotjs,
  SiReact
} from 'react-icons/si';

const clientLibraries = [
  {
    name: 'TypeScript/JavaScript',
    description: 'Full-featured client with tRPC and REST support',
    icon: SiTypescript,
    color: 'blue',
    features: ['End-to-end type safety', 'Auto-completion', 'tRPC procedures', 'REST endpoints']
  },
  {
    name: 'Python',
    description: 'Complete REST API client with async support',
    icon: SiPython,
    color: 'green',
    features: ['REST API client', 'Async/await support', 'Type hints', 'Error handling']
  },
  {
    name: 'cURL',
    description: 'Direct HTTP requests for testing and automation',
    icon: Terminal,
    color: 'gray',
    features: ['Direct HTTP calls', 'Shell scripting', 'CI/CD integration', 'Quick testing']
  }
];

const useCases = [
  {
    title: 'Web Applications',
    description: 'React/Next.js apps with real-time environment management',
    icon: SiReact,
    technologies: ['React', 'Next.js', 'tRPC', 'TypeScript']
  },
  {
    title: 'Backend Services',
    description: 'Node.js/Python services for automated environment deployment',
    icon: SiNodedotjs,
    technologies: ['Node.js', 'Python', 'REST API', 'CI/CD']
  },
  {
    title: 'CLI Tools',
    description: 'Command-line tools for DevOps and deployment automation',
    icon: Terminal,
    technologies: ['Bash', 'Python', 'cURL', 'Scripts']
  },
  {
    title: 'Mobile Apps',
    description: 'React Native and mobile apps with secure environment access',
    icon: Globe,
    technologies: ['React Native', 'HTTP client', 'Mobile SDKs']
  }
];

export default function ExamplesPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<section className="space-y-4">
				<div className="space-y-2">
					<Badge variant="outline" className="w-fit">
						Integration Examples
					</Badge>
					<h1 className="text-3xl font-bold tracking-tight">Client Examples</h1>
					<p className="text-xl text-muted-foreground">
						Complete integration examples and client libraries for TypeScript, Python, and cURL with real-world use cases.
					</p>
				</div>
			</section>

			{/* Client Libraries Overview */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Client Libraries</h2>
					<p className="text-muted-foreground">
						Choose the right client library for your technology stack and use case.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{clientLibraries.map((library) => {
						const Icon = library.icon;
						return (
							<Card key={library.name} className="group hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="flex items-center gap-3">
										<div className={`h-10 w-10 rounded-lg bg-${library.color}-500/10 flex items-center justify-center`}>
											<Icon className={`h-5 w-5 text-${library.color}-500`} />
										</div>
										{library.name}
									</CardTitle>
									<CardDescription>{library.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{library.features.map((feature, index) => (
											<li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
												<CheckCircle className="h-4 w-4 text-green-500" />
												{feature}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Use Cases */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Common Use Cases</h2>
					<p className="text-muted-foreground">
						Real-world scenarios where EnvStore API integration adds value to your applications.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{useCases.map((useCase) => {
						const Icon = useCase.icon;
						return (
							<Card key={useCase.title} className="group hover:shadow-md transition-shadow">
								<CardHeader>
									<CardTitle className="flex items-center gap-3">
										<Icon className="h-5 w-5 text-primary" />
										{useCase.title}
									</CardTitle>
									<CardDescription>{useCase.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										{useCase.technologies.map((tech) => (
											<Badge key={tech} variant="secondary" className="text-xs">
												{tech}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</section>

			{/* Code Examples */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Integration Examples</h2>
					<p className="text-muted-foreground">
						Complete, production-ready code examples for integrating with EnvStore APIs.
					</p>
				</div>

				<Tabs defaultValue="typescript" className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="typescript" className="flex items-center gap-2">
							<SiTypescript className="h-4 w-4" />
							TypeScript
						</TabsTrigger>
						<TabsTrigger value="python" className="flex items-center gap-2">
							<SiPython className="h-4 w-4" />
							Python
						</TabsTrigger>
						<TabsTrigger value="curl" className="flex items-center gap-2">
							<Terminal className="h-4 w-4" />
							cURL
						</TabsTrigger>
					</TabsList>

					<TabsContent value="typescript" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<SiTypescript className="h-5 w-5 text-blue-500" />
									TypeScript Client with tRPC
								</CardTitle>
								<CardDescription>
									Complete TypeScript client with full type safety and tRPC integration
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<h4 className="font-medium text-lg">Installation & Setup</h4>
									<CodeBlock 
										code={`# Install required dependencies
npm install @trpc/client @trpc/server
# or
pnpm add @trpc/client @trpc/server

# Install type definitions (if using separate backend)
npm install -D @types/node`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Client Setup</h4>
									<CodeBlock 
										code={`import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc/router';

// Create the tRPC client
const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-domain.com/api/trpc',
      headers: {
        // Session-based authentication
        'Cookie': 'session=your-session-cookie'
      }
    }),
  ],
});

// Type-safe client is ready to use!
export { client };`}
										language="typescript"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Complete Example: Project & Environment Manager</h4>
									<CodeBlock 
										code={`import { client } from './trpc-client';

interface EnvStoreManager {
  // Project operations
  createProject(name: string): Promise<{ id: string; name: string }>;
  listProjects(): Promise<Project[]>;
  deleteProject(id: string): Promise<void>;
  
  // Environment operations
  uploadEnvironment(params: UploadEnvParams): Promise<{ id: string; version: number }>;
  getLatestEnvironment(projectId: string, env: string): Promise<EnvironmentData | null>;
  downloadEnvironment(id: string, passphrase: string): Promise<string | null>;
}

interface UploadEnvParams {
  projectId: string;
  environment: string;
  content: string;
  passphrase: string;
}

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  ownerId: string;
}

interface EnvironmentData {
  id: string;
  version: number;
  ciphertext: string;
  iv: string;
  salt: string;
  checksum: string;
  createdAt: Date;
}

class EnvStoreClient implements EnvStoreManager {
  
  async createProject(name: string) {
    try {
      const project = await client.createProject.mutate({ name });
      console.log(\`✅ Created project: \${project.name} (\${project.id})\`);
      return project;
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      throw error;
    }
  }

  async listProjects() {
    try {
      const projects = await client.listProjects.query();
      console.log(\`📁 Found \${projects.length} projects\`);
      return projects;
    } catch (error) {
      console.error('❌ Failed to list projects:', error);
      throw error;
    }
  }

  async deleteProject(id: string) {
    try {
      const result = await client.deleteProject.mutate({ id });
      if (result.success) {
        console.log(\`🗑️ Deleted project: \${id}\`);
      }
    } catch (error) {
      console.error('❌ Failed to delete project:', error);
      throw error;
    }
  }

  async uploadEnvironment(params: UploadEnvParams) {
    try {
      const result = await client.uploadEnv.mutate(params);
      console.log(\`⬆️ Uploaded \${params.environment} v\${result.version} to \${params.projectId}\`);
      return result;
    } catch (error) {
      console.error('❌ Failed to upload environment:', error);
      throw error;
    }
  }

  async getLatestEnvironment(projectId: string, environment: string) {
    try {
      const env = await client.getLatestEnv.query({ projectId, environment });
      if (env) {
        console.log(\`📥 Retrieved \${environment} v\${env.version}\`);
      } else {
        console.log(\`❌ Environment not found: \${projectId}/\${environment}\`);
      }
      return env;
    } catch (error) {
      console.error('❌ Failed to get environment:', error);
      throw error;
    }
  }

  async downloadEnvironment(id: string, passphrase: string) {
    try {
      const result = await client.decryptEnv.mutate({ id, passphrase });
      if (result) {
        console.log(\`🔓 Successfully decrypted environment\`);
        return result.content;
      } else {
        console.log(\`❌ Failed to decrypt - invalid passphrase or file\`);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to decrypt environment:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUsageStats() {
    try {
      const stats = await client.getUsageStats.query();
      console.log(\`📊 Usage: \${stats.projects} projects, \${stats.environments} environments\`);
      return stats;
    } catch (error) {
      console.error('❌ Failed to get usage stats:', error);
      throw error;
    }
  }

  // Manage API keys
  async createApiKey(name: string) {
    try {
      const apiKey = await client.createApiKey.mutate({ name });
      console.log(\`🔑 Created API key: \${apiKey.prefix}...\`);
      console.log(\`⚠️ Store this token securely: \${apiKey.token}\`);
      return apiKey;
    } catch (error) {
      console.error('❌ Failed to create API key:', error);
      throw error;
    }
  }
}

// Usage example
async function main() {
  const envStore = new EnvStoreClient();
  
  try {
    // Create a new project
    const project = await envStore.createProject("My Application");
    
    // Upload environment variables
    await envStore.uploadEnvironment({
      projectId: project.id,
      environment: "production",
      content: "DATABASE_URL=postgres://localhost:5432/myapp\\nAPI_KEY=secret123",
      passphrase: "secure-passphrase"
    });
    
    // Retrieve and decrypt environment
    const latest = await envStore.getLatestEnvironment(project.id, "production");
    if (latest) {
      const content = await envStore.downloadEnvironment(latest.id, "secure-passphrase");
      if (content) {
        console.log("Environment variables:", content);
      }
    }
    
  } catch (error) {
    console.error("Operation failed:", error);
  }
}

// Run the example
main().catch(console.error);

export { EnvStoreClient };`}
										language="typescript"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">React Hook for Environment Management</h4>
									<CodeBlock 
										code={`import { useState, useEffect } from 'react';
import { client } from './trpc-client';

interface UseEnvironmentResult {
  environments: EnvironmentSummary[] | null;
  loading: boolean;
  error: string | null;
  uploadEnvironment: (params: UploadParams) => Promise<void>;
  refreshEnvironments: () => Promise<void>;
}

interface EnvironmentSummary {
  environment: string;
  latestVersion: number;
}

interface UploadParams {
  environment: string;
  content: string;
  passphrase: string;
}

export function useEnvironments(projectId: string): UseEnvironmentResult {
  const [environments, setEnvironments] = useState<EnvironmentSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvironments = async () => {
    try {
      setLoading(true);
      setError(null);
      const envs = await client.listEnvs.query({ projectId });
      setEnvironments(envs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch environments');
    } finally {
      setLoading(false);
    }
  };

  const uploadEnvironment = async (params: UploadParams) => {
    try {
      await client.uploadEnv.mutate({
        projectId,
        ...params
      });
      // Refresh the list after upload
      await fetchEnvironments();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchEnvironments();
    }
  }, [projectId]);

  return {
    environments,
    loading,
    error,
    uploadEnvironment,
    refreshEnvironments: fetchEnvironments
  };
}

// Usage in React component
export function EnvironmentManager({ projectId }: { projectId: string }) {
  const { environments, loading, error, uploadEnvironment } = useEnvironments(projectId);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (formData: FormData) => {
    try {
      setUploading(true);
      await uploadEnvironment({
        environment: formData.get('environment') as string,
        content: formData.get('content') as string,
        passphrase: formData.get('passphrase') as string
      });
      alert('Environment uploaded successfully!');
    } catch (err) {
      alert(\`Upload failed: \${err}\`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading environments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Environments</h3>
      {environments?.map(env => (
        <div key={env.environment}>
          {env.environment} (v{env.latestVersion})
        </div>
      ))}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleUpload(new FormData(e.currentTarget));
      }}>
        <input name="environment" placeholder="Environment name" required />
        <textarea name="content" placeholder="Environment variables" required />
        <input name="passphrase" type="password" placeholder="Passphrase" required />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}`}
										language="typescript"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="python" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<SiPython className="h-5 w-5 text-green-500" />
									Python REST Client
								</CardTitle>
								<CardDescription>
									Complete Python client with async support and comprehensive error handling
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<h4 className="font-medium text-lg">Installation</h4>
									<CodeBlock 
										code={`# Install required packages
pip install httpx asyncio python-dotenv
# or using poetry
poetry add httpx asyncio python-dotenv

# For type hints (optional but recommended)
pip install typing-extensions`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Complete Python Client</h4>
									<CodeBlock 
										code={`import os
import json
import asyncio
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime
import httpx
from urllib.parse import urlencode

@dataclass
class ProjectSummary:
    id: str
    name: str
    created_at: datetime
    owner_id: str

@dataclass
class EnvironmentSummary:
    environment: str
    latest_version: int

@dataclass
class EnvironmentData:
    id: str
    version: int
    ciphertext: str
    iv: str
    salt: str
    checksum: str
    created_at: Optional[datetime] = None

@dataclass
class UploadResult:
    id: str
    version: int

@dataclass
class ApiKey:
    token: str
    prefix: str

@dataclass
class ApiKeySummary:
    id: str
    name: str
    prefix: str
    created_at: datetime
    last_used_at: Optional[datetime]

class EnvStoreError(Exception):
    """Base exception for EnvStore API errors"""
    def __init__(self, message: str, status_code: Optional[int] = None):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class RateLimitError(EnvStoreError):
    """Raised when API rate limit is exceeded"""
    def __init__(self, message: str, retry_after: Optional[int] = None):
        super().__init__(message, 429)
        self.retry_after = retry_after

class EnvStoreClient:
    """
    Async Python client for EnvStore API
    
    Supports both REST API (with API keys) and provides comprehensive
    error handling, rate limiting, and type hints.
    """
    
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        base_url: str = "https://your-domain.com",
        timeout: int = 30
    ):
        self.api_key = api_key or os.getenv("ENVSTORE_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        
        if not self.api_key:
            raise ValueError("API key is required. Set ENVSTORE_API_KEY environment variable or pass api_key parameter.")
        
        self.session = httpx.AsyncClient(
            headers={
                "x-api-key": self.api_key,
                "Content-Type": "application/json",
                "User-Agent": "EnvStore-Python-Client/1.0"
            },
            timeout=timeout
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def close(self):
        """Close the HTTP client session"""
        await self.session.aclose()

    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make an HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = await self.session.request(
                method, 
                url, 
                json=data,
                params=params
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                raise RateLimitError("Rate limit exceeded", retry_after)
            
            # Handle other HTTP errors
            if response.status_code >= 400:
                try:
                    error_data = response.json()
                    message = error_data.get("error", f"HTTP {response.status_code}")
                except:
                    message = f"HTTP {response.status_code}: {response.text}"
                
                raise EnvStoreError(message, response.status_code)
            
            return response.json()
            
        except httpx.RequestError as e:
            raise EnvStoreError(f"Network error: {e}")

    # Health Check
    async def health_check(self) -> Dict[str, Any]:
        """Check API health status"""
        return await self._request("GET", "/api/v1/kv/health")

    # Environment Operations
    async def upload_environment(
        self,
        project_id: str,
        environment: str,
        content: str,
        passphrase: str
    ) -> UploadResult:
        """Upload an environment file with encryption"""
        data = {
            "projectId": project_id,
            "environment": environment,
            "content": content,
            "passphrase": passphrase
        }
        
        result = await self._request("POST", "/api/v1/env/upload", data)
        return UploadResult(id=result["id"], version=result["version"])

    async def get_latest_environment(
        self, 
        project_id: str, 
        environment: str
    ) -> Optional[EnvironmentData]:
        """Get the latest version of an environment"""
        params = {
            "projectId": project_id,
            "environment": environment
        }
        
        try:
            result = await self._request("GET", "/api/v1/env/latest", params=params)
            return EnvironmentData(
                id=result["id"],
                version=result["version"],
                ciphertext=result["ciphertext"],
                iv=result["iv"],
                salt=result["salt"],
                checksum=result["checksum"],
                created_at=datetime.fromisoformat(result["createdAt"].replace("Z", "+00:00")) if "createdAt" in result else None
            )
        except EnvStoreError as e:
            if e.status_code == 404:
                return None
            raise

    # Utility Methods
    async def upload_env_file(
        self,
        project_id: str,
        environment: str,
        file_path: str,
        passphrase: str
    ) -> UploadResult:
        """Upload environment from a file"""
        with open(file_path, 'r') as f:
            content = f.read()
        
        return await self.upload_environment(project_id, environment, content, passphrase)

    async def download_env_to_file(
        self,
        project_id: str,
        environment: str,
        output_path: str,
        passphrase: str
    ) -> bool:
        """Download and decrypt environment to a file"""
        env_data = await self.get_latest_environment(project_id, environment)
        if not env_data:
            return False
        
        # Note: Decryption would need to be implemented client-side
        # This is a placeholder for the decryption logic
        print(f"Environment data retrieved for {environment} v{env_data.version}")
        print("⚠️  Client-side decryption needed - implement AES-256-GCM decryption")
        
        return True

    # Batch Operations
    async def upload_multiple_environments(
        self,
        uploads: List[Dict[str, str]]
    ) -> List[UploadResult]:
        """Upload multiple environments concurrently"""
        tasks = []
        
        for upload in uploads:
            task = self.upload_environment(
                upload["project_id"],
                upload["environment"], 
                upload["content"],
                upload["passphrase"]
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        success_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ Upload {i} failed: {result}")
            else:
                success_results.append(result)
                print(f"✅ Upload {i} succeeded: v{result.version}")
        
        return success_results

# Usage Examples
async def main():
    """Example usage of the EnvStore client"""
    
    # Initialize client
    async with EnvStoreClient() as client:
        
        try:
            # Check API health
            health = await client.health_check()
            print(f"API Health: {'✅ OK' if health.get('ok') else '❌ Failed'}")
            
            # Upload a single environment
            result = await client.upload_environment(
                project_id="550e8400-e29b-41d4-a716-446655440000",
                environment="production",
                content="DATABASE_URL=postgres://localhost:5432/myapp\\nAPI_KEY=secret123",
                passphrase="secure-passphrase"
            )
            print(f"📤 Uploaded environment: {result.id} v{result.version}")
            
            # Retrieve the environment
            env_data = await client.get_latest_environment(
                "550e8400-e29b-41d4-a716-446655440000",
                "production"
            )
            
            if env_data:
                print(f"📥 Retrieved environment v{env_data.version}")
                print(f"   ID: {env_data.id}")
                print(f"   Checksum: {env_data.checksum[:16]}...")
            else:
                print("❌ Environment not found")
            
            # Batch upload example
            batch_uploads = [
                {
                    "project_id": "550e8400-e29b-41d4-a716-446655440000",
                    "environment": "development",
                    "content": "DATABASE_URL=postgres://localhost:5432/dev_db\\nDEBUG=true",
                    "passphrase": "dev-passphrase"
                },
                {
                    "project_id": "550e8400-e29b-41d4-a716-446655440000", 
                    "environment": "staging",
                    "content": "DATABASE_URL=postgres://staging:5432/staging_db\\nDEBUG=false",
                    "passphrase": "staging-passphrase"
                }
            ]
            
            batch_results = await client.upload_multiple_environments(batch_uploads)
            print(f"📦 Batch upload completed: {len(batch_results)} successful")
            
        except RateLimitError as e:
            print(f"⏳ Rate limited. Retry after {e.retry_after} seconds")
        except EnvStoreError as e:
            print(f"❌ API Error: {e.message}")
        except Exception as e:
            print(f"💥 Unexpected error: {e}")

# CLI Interface
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python envstore_client.py <command> [args...]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "health":
        asyncio.run(main())
    elif command == "upload":
        if len(sys.argv) != 6:
            print("Usage: python envstore_client.py upload <project_id> <environment> <file_path> <passphrase>")
            sys.exit(1)
        
        async def upload_cmd():
            async with EnvStoreClient() as client:
                result = await client.upload_env_file(
                    sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
                )
                print(f"✅ Uploaded: {result.id} v{result.version}")
        
        asyncio.run(upload_cmd())
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Environment File Management Script</h4>
									<CodeBlock 
										code={`#!/usr/bin/env python3
"""
EnvStore deployment script for CI/CD pipelines

Usage:
    python deploy_env.py --project-id PROJECT_ID --environment ENV_NAME --file .env.production --passphrase SECRET

Environment variables:
    ENVSTORE_API_KEY: Your API key
    ENVSTORE_BASE_URL: API base URL (optional)
"""

import os
import sys
import argparse
import asyncio
from pathlib import Path
from envstore_client import EnvStoreClient, EnvStoreError

async def deploy_environment(
    project_id: str,
    environment: str, 
    file_path: str,
    passphrase: str,
    verify: bool = False
) -> bool:
    """Deploy environment file to EnvStore"""
    
    if not Path(file_path).exists():
        print(f"❌ Environment file not found: {file_path}")
        return False
    
    try:
        async with EnvStoreClient() as client:
            # Upload the environment
            print(f"📤 Uploading {file_path} to {project_id}/{environment}...")
            result = await client.upload_env_file(
                project_id, environment, file_path, passphrase
            )
            print(f"✅ Successfully uploaded version {result.version}")
            
            # Verify the upload if requested
            if verify:
                print("🔍 Verifying upload...")
                env_data = await client.get_latest_environment(project_id, environment)
                if env_data and env_data.version == result.version:
                    print(f"✅ Verification successful - v{env_data.version}")
                else:
                    print("❌ Verification failed")
                    return False
            
            return True
            
    except EnvStoreError as e:
        print(f"❌ Deployment failed: {e.message}")
        return False
    except Exception as e:
        print(f"💥 Unexpected error: {e}")
        return False

async def main():
    parser = argparse.ArgumentParser(description="Deploy environment files to EnvStore")
    parser.add_argument("--project-id", required=True, help="Project UUID")
    parser.add_argument("--environment", required=True, help="Environment name")
    parser.add_argument("--file", required=True, help="Path to environment file")
    parser.add_argument("--passphrase", required=True, help="Encryption passphrase")
    parser.add_argument("--verify", action="store_true", help="Verify upload")
    parser.add_argument("--api-key", help="API key (overrides ENVSTORE_API_KEY)")
    
    args = parser.parse_args()
    
    # Set API key if provided
    if args.api_key:
        os.environ["ENVSTORE_API_KEY"] = args.api_key
    
    # Deploy the environment
    success = await deploy_environment(
        args.project_id,
        args.environment,
        args.file,
        args.passphrase,
        args.verify
    )
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())`}
										language="bash"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="curl" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Terminal className="h-5 w-5 text-gray-500" />
									cURL Examples
								</CardTitle>
								<CardDescription>
									Direct HTTP requests for testing, automation, and shell scripting
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<h4 className="font-medium text-lg">Basic Health Check</h4>
									<CodeBlock 
										code={`#!/bin/bash
# Basic health check - no authentication required

curl -X GET 'https://your-domain.com/api/v1/kv/health' \\\\
  -H 'Accept: application/json' \\\\
  -H 'User-Agent: EnvStore-Script/1.0'

# Example response:
# {
#   "ok": true,
#   "config": {
#     "hasAccount": true,
#     "hasNamespace": true,
#     "hasToken": true
#   }
# }`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Environment Upload</h4>
									<CodeBlock 
										code={`#!/bin/bash
# Upload environment variables with encryption

API_KEY="esk_live_your_32_character_api_key_here"
PROJECT_ID="550e8400-e29b-41d4-a716-446655440000"
ENVIRONMENT="production"
PASSPHRASE="your-secure-passphrase"

# Read environment file content
ENV_CONTENT=$(cat .env.production | sed ':a;N;$!ba;s/\\\\n/\\\\\\\\n/g')

curl -X POST 'https://your-domain.com/api/v1/env/upload' \\
  -H "x-api-key: $API_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'User-Agent: EnvStore-Script/1.0' \\
  -d "{
    \\"projectId\\": \\"$PROJECT_ID\\",
    \\"environment\\": \\"$ENVIRONMENT\\",
    \\"content\\": \\"$ENV_CONTENT\\",
    \\"passphrase\\": \\"$PASSPHRASE\\"
  }" \\
  -w "\\nHTTP Status: %{http_code}\\nResponse Time: %{time_total}s\\n"

# Example successful response:
# {
#   "id": "env_abc123def456ghi789",
#   "version": 3
# }
# HTTP Status: 200
# Response Time: 0.234s`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Environment Retrieval</h4>
									<CodeBlock 
										code={`#!/bin/bash
# Retrieve the latest environment version

API_KEY="esk_live_your_32_character_api_key_here"
PROJECT_ID="550e8400-e29b-41d4-a716-446655440000"
ENVIRONMENT="production"

response=$(curl -s -X GET "https://your-domain.com/api/v1/env/latest?projectId=$PROJECT_ID&environment=$ENVIRONMENT" \\
  -H "x-api-key: $API_KEY" \\
  -H 'Accept: application/json' \\
  -w "\\nHTTP_STATUS:%{http_code}")

# Extract response body and status code
http_body=$(echo "$response" | sed -E '$d')
http_status=$(echo "$response" | tail -n1 | sed -E 's/.*HTTP_STATUS:([0-9]+)/\\1/')

if [ "$http_status" -eq 200 ]; then
    echo "✅ Environment retrieved successfully"
    echo "$http_body" | jq .
    
    # Extract version
    version=$(echo "$http_body" | jq -r '.version')
    echo "📋 Environment version: $version"
else
    echo "❌ Request failed with status: $http_status"
    echo "$http_body" | jq -r '.error // "Unknown error"'
fi`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">CI/CD Deployment Script</h4>
									<CodeBlock 
										code={`#!/bin/bash
# Complete CI/CD deployment script for environment variables
# Usage: ./deploy-env.sh <environment> <project-id> <env-file> <passphrase>

set -euo pipefail  # Exit on any error

# Configuration
SCRIPT_NAME="EnvStore-Deploy/1.0"
API_BASE_URL="$\\{ENVSTORE_API_URL:-https://your-domain.com\\}"
API_KEY="$\\{ENVSTORE_API_KEY\\}"

# Colors for output
RED='\\\\033[0;31m'
GREEN='\\\\033[0;32m'
YELLOW='\\\\033[1;33m'
BLUE='\\\\033[0;34m'
NC='\\\\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "$\{BLUE\}[INFO]$\{NC\} $1"
}

log_success() {
    echo -e "$\{GREEN\}[SUCCESS]$\{NC\} $1" 
}

log_warning() {
    echo -e "$\{YELLOW\}[WARNING]$\{NC\} $1"
}

log_error() {
    echo -e "$\{RED\}[ERROR]$\{NC\} $1" \>\&2
}

# Check prerequisites
check_dependencies() {
    command -v curl >/dev/null 2>&1 || { log_error "curl is required but not installed."; exit 1; }
    command -v jq >/dev/null 2>&1 || { log_error "jq is required but not installed."; exit 1; }
    
    if [ -z "$\\{API_KEY:-\\}" ]; then
        log_error "ENVSTORE_API_KEY environment variable is required"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Checking API health..."
    
    local response=$(curl -s -w "\\nHTTP_STATUS:%{http_code}" \\
        -X GET "$API_BASE_URL/api/v1/kv/health" \\
        -H 'Accept: application/json' \\
        -H "User-Agent: $SCRIPT_NAME")
    
    local http_body=$(echo "$response" | sed -E '$d')
    local http_status=$(echo "$response" | tail -n1 | sed -E 's/.*HTTP_STATUS:([0-9]+)/\\1/')
    
    if [ "$http_status" -eq 200 ]; then
        local health_ok=$(echo "$http_body" | jq -r '.ok')
        if [ "$health_ok" = "true" ]; then
            log_success "API health check passed"
            return 0
        else
            log_error "API health check failed: $(echo "$http_body" | jq -r '.error // "Unknown error"')"
            return 1
        fi
    else
        log_error "Health check request failed with status: $http_status"
        return 1
    fi
}

# Deploy environment
deploy_environment() {
    local environment="$1"
    local project_id="$2"
    local env_file="$3"
    local passphrase="$4"
    
    # Validate inputs
    if [ ! -f "$env_file" ]; then
        log_error "Environment file not found: $env_file"
        return 1
    fi
    
    # Validate UUID format
    if [[ ! "$project_id" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
        log_error "Invalid project ID format. Must be a valid UUID."
        return 1
    fi
    
    log_info "Reading environment file: $env_file"
    local env_content=$(cat "$env_file" | sed ':a;N;$!ba;s/\\n/\\\\n/g')
    local file_lines=$(wc -l < "$env_file")
    
    log_info "Environment file contains $file_lines lines"
    log_info "Uploading to project: $project_id"
    log_info "Environment: $environment"
    
    # Upload the environment
    local response=$(curl -s -w "\\nHTTP_STATUS:%{http_code}" \\
        -X POST "$API_BASE_URL/api/v1/env/upload" \\
        -H "x-api-key: $API_KEY" \\
        -H 'Content-Type: application/json' \\
        -H "User-Agent: $SCRIPT_NAME" \\
        -d "{\\"projectId\\": \\"$project_id\\", \\"environment\\": \\"$environment\\", \\"content\\": \\"$env_content\\", \\"passphrase\\": \\"$passphrase\\"}")
    
    local http_body=$(echo "$response" | sed -E '$d')
    local http_status=$(echo "$response" | tail -n1 | sed -E 's/.*HTTP_STATUS:([0-9]+)/\\1/')
    
    if [ "$http_status" -eq 200 ]; then
        local upload_id=$(echo "$http_body" | jq -r '.id')
        local version=$(echo "$http_body" | jq -r '.version')
        
        log_success "Environment uploaded successfully!"
        log_info "Upload ID: $upload_id"
        log_info "Version: $version"
        
        # Verify the upload
        verify_upload "$project_id" "$environment" "$version"
        
        return 0
    else
        log_error "Upload failed with status: $http_status"
        log_error "Response: $(echo "$http_body" | jq -r '.error // .message // "Unknown error"')"
        
        # Handle specific error cases
        case $http_status in
            401)
                log_error "Authentication failed. Check your API key."
                ;;
            404)
                log_error "Project not found or access denied."
                ;;
            429)
                local retry_after=$(echo "$http_body" | jq -r '.retryAfter // "60"')
                log_warning "Rate limited. Retry after $retry_after seconds."
                ;;
        esac
        
        return 1
    fi
}

# Verify upload
verify_upload() {
    local project_id="$1"
    local environment="$2"
    local expected_version="$3"
    
    log_info "Verifying upload..."
    
    local response=$(curl -s -w "\\nHTTP_STATUS:%{http_code}" \\
        -X GET "$API_BASE_URL/api/v1/env/latest?projectId=$project_id&environment=$environment" \\
        -H "x-api-key: $API_KEY" \\
        -H 'Accept: application/json' \\
        -H "User-Agent: $SCRIPT_NAME")
    
    local http_body=$(echo "$response" | sed -E '$d')
    local http_status=$(echo "$response" | tail -n1 | sed -E 's/.*HTTP_STATUS:([0-9]+)/\\1/')
    
    if [ "$http_status" -eq 200 ]; then
        local actual_version=$(echo "$http_body" | jq -r '.version')
        local cache_status=$(echo "$response" | grep -o 'X-Cache: [A-Z]*' || echo "X-Cache: UNKNOWN")
        
        if [ "$actual_version" = "$expected_version" ]; then
            log_success "Verification successful! Version $actual_version is live."
            log_info "Cache status: $cache_status"
        else
            log_warning "Version mismatch. Expected: $expected_version, Actual: $actual_version"
        fi
    else
        log_warning "Verification failed with status: $http_status"
    fi
}

# Main execution
main() {
    if [ $# -ne 4 ]; then
        echo "Usage: $0 <environment> <project-id> <env-file> <passphrase>"
        echo ""
        echo "Examples:"
        echo "  $0 production 550e8400-e29b-41d4-a716-446655440000 .env.production mysecretpassphrase"
        echo "  $0 staging 550e8400-e29b-41d4-a716-446655440000 .env.staging stagingpassphrase"
        echo ""
        echo "Environment variables:"
        echo "  ENVSTORE_API_KEY    - Your API key (required)"
        echo "  ENVSTORE_API_URL    - API base URL (optional, defaults to https://your-domain.com)"
        exit 1
    fi
    
    local environment="$1"
    local project_id="$2" 
    local env_file="$3"
    local passphrase="$4"
    
    log_info "Starting environment deployment..."
    log_info "Script: $SCRIPT_NAME"
    log_info "Target: $environment environment"
    
    # Run checks and deployment
    check_dependencies
    health_check
    deploy_environment "$environment" "$project_id" "$env_file" "$passphrase"
    
    log_success "Deployment completed successfully! 🚀"
}

# Run main function with all arguments
main "$@"`}
										language="bash"
									/>
								</div>

								<div className="space-y-4">
									<h4 className="font-medium text-lg">Docker Container Example</h4>
									<CodeBlock 
										code={`# Dockerfile for EnvStore deployment container
FROM alpine:3.18

# Install required packages
RUN apk add --no-cache curl jq bash

# Copy deployment script
COPY deploy-env.sh /usr/local/bin/deploy-env
RUN chmod +x /usr/local/bin/deploy-env

# Set working directory
WORKDIR /app

# Default entrypoint
ENTRYPOINT ["/usr/local/bin/deploy-env"]

# Usage:
# docker build -t envstore-deploy .
# docker run --rm \\
#   -e ENVSTORE_API_KEY=your_api_key \\
#   -v $(pwd)/.env.production:/app/.env.production \\
#   envstore-deploy production 550e8400-e29b-41d4-a716-446655440000 .env.production mysecretpassphrase`}
										language="bash"
									/>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</section>

			{/* Next Steps */}
			<section className="space-y-6 pt-8 border-t">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-semibold">Start Building</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Choose your preferred language and start integrating with EnvStore&apos;s secure APIs.
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
							<Shield className="mr-2 h-4 w-4" />
							Authentication Guide
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/errors">
							View Error Handling <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}