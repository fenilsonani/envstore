import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import { 
  Database, 
  FolderOpen, 
  Server,
  Key,
  User,
  Shield,
  Code,
  ArrowRight,
  CheckCircle,
  FileText,
  Settings,
  Trash2,
  Plus,
  Eye,
  Download
} from 'lucide-react';

const procedureCategories = [
  {
    id: 'projects',
    title: 'Project Management',
    description: 'CRUD operations for projects with statistics',
    icon: FolderOpen,
    color: 'blue',
    count: '5 procedures'
  },
  {
    id: 'environments',
    title: 'Environment Management', 
    description: 'Upload, retrieve, and manage environment files',
    icon: Server,
    color: 'green',
    count: '6 procedures'
  },
  {
    id: 'apikeys',
    title: 'API Key Management',
    description: 'Generate and manage API keys',
    icon: Key,
    color: 'amber',
    count: '3 procedures'
  },
  {
    id: 'user',
    title: 'User Management',
    description: 'Profile, stats, and account management',
    icon: User,
    color: 'purple',
    count: '5 procedures'
  }
];

const trpcFeatures = [
  {
    title: 'End-to-End Type Safety',
    description: 'Full TypeScript support from client to server with automatic inference',
    icon: Shield,
    details: ['Runtime validation', 'Compile-time checks', 'Auto-completion', 'Error catching']
  },
  {
    title: 'Automatic Serialization',
    description: 'Seamless handling of complex data types and Date objects',
    icon: Code,
    details: ['JSON serialization', 'Date handling', 'Complex objects', 'Array support']
  },
  {
    title: 'Built-in Caching',
    description: 'Intelligent query caching and invalidation strategies',
    icon: Database,
    details: ['Query caching', 'Mutation invalidation', 'Background refetch', 'Optimistic updates']
  }
];

export default function TrpcPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<section className="space-y-4">
				<div className="space-y-2">
					<Badge variant="outline" className="w-fit">
						Type-Safe API
					</Badge>
					<h1 className="text-3xl font-bold tracking-tight">tRPC Procedures</h1>
					<p className="text-xl text-muted-foreground">
						End-to-end type-safe procedures for seamless client-server communication with full TypeScript support.
					</p>
				</div>
			</section>

			{/* tRPC Features */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Why tRPC?</h2>
					<p className="text-muted-foreground">
						Experience the benefits of type-safe API calls with automatic validation and excellent developer experience.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{trpcFeatures.map((feature) => {
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

			{/* Quick Setup */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Quick Setup</h2>
					<p className="text-muted-foreground">
						Get started with the tRPC client in just a few lines of code.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Code className="h-5 w-5" />
							TypeScript Client Setup
						</CardTitle>
						<CardDescription>
							Initialize the tRPC client with automatic type inference
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CodeBlock 
							code={`import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc/router';

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

// Usage with full type safety
const projects = await client.listProjects.query();
//    ^? Project[] - fully typed!

const newProject = await client.createProject.mutate({ 
  name: 'My Project' 
});
//    ^? { id: string; name: string } - return type inferred!`}
							language="typescript"
						/>
					</CardContent>
				</Card>
			</section>

			{/* Procedure Categories */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Procedure Categories</h2>
					<p className="text-muted-foreground">
						All procedures are available at <code className="bg-muted px-1 py-0.5 rounded text-sm">/api/trpc/[trpc]</code> and require session authentication.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{procedureCategories.map((category) => {
						const Icon = category.icon;
						return (
							<a key={category.id} href={`#${category.id}`}>
								<Card className="group hover:shadow-md transition-shadow cursor-pointer">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<Icon className={`h-5 w-5 text-${category.color}-500`} />
												<CardTitle className="text-base">{category.title}</CardTitle>
											</div>
											<Badge variant="secondary" className="text-xs">
												{category.count}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<CardDescription className="text-sm">
											{category.description}
										</CardDescription>
										<div className="mt-3 flex items-center gap-1 text-sm text-primary group-hover:translate-x-1 transition-transform">
											View procedures <ArrowRight className="h-3 w-3" />
										</div>
									</CardContent>
								</Card>
							</a>
						);
					})}
				</div>
			</section>

			{/* Detailed Procedures */}
			<section className="space-y-8">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Procedure Reference</h2>
					<p className="text-muted-foreground">
						Comprehensive reference for all available tRPC procedures with input/output schemas.
					</p>
				</div>

				<Tabs defaultValue="projects" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="projects" className="flex items-center gap-2">
							<FolderOpen className="h-4 w-4" />
							Projects
						</TabsTrigger>
						<TabsTrigger value="environments" className="flex items-center gap-2">
							<Server className="h-4 w-4" />
							Environments
						</TabsTrigger>
						<TabsTrigger value="apikeys" className="flex items-center gap-2">
							<Key className="h-4 w-4" />
							API Keys
						</TabsTrigger>
						<TabsTrigger value="user" className="flex items-center gap-2">
							<User className="h-4 w-4" />
							User
						</TabsTrigger>
					</TabsList>

					<TabsContent value="projects" id="projects" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FolderOpen className="h-5 w-5 text-blue-500" />
									Project Management
								</CardTitle>
								<CardDescription>
									Create, read, update, and delete projects with comprehensive statistics
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="border-l-4 border-blue-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Plus className="h-4 w-4" />
											createProject
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface CreateProjectInput {
  name: string;  // Project name (minimum 1 character)
}

// Output Schema  
interface CreateProjectOutput {
  id: string;    // Generated UUID
  name: string;  // Project name
}

// Usage Example
const project = await client.createProject.mutate({
  name: "My New Project"
});

console.log(project.id);   // "550e8400-e29b-41d4-a716-446655440000"
console.log(project.name); // "My New Project"`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-green-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Eye className="h-4 w-4" />
											listProjects
										</h4>
										<CodeBlock 
											code={`// Input: None (query procedure)

// Output Schema
interface Project {
  id: string;        // Project UUID
  name: string;      // Project name
  createdAt: Date;   // Creation timestamp
  ownerId: string;   // Owner user ID
}

type ListProjectsOutput = Project[];

// Usage Example
const projects = await client.listProjects.query();

projects.forEach(project => {
  console.log(\`\${project.name} - \${project.createdAt.toLocaleDateString()}\`);
});`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-amber-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<FileText className="h-4 w-4" />
											listProjectsWithStats
										</h4>
										<CodeBlock 
											code={`// Input: None (query procedure)

// Output Schema
interface ProjectWithStats {
  id: string;                    // Project UUID
  name: string;                  // Project name
  createdAt: Date;               // Creation timestamp
  environmentsCount: number;     // Number of environments
  lastActivity: number | null;   // Last activity timestamp
}

type ListProjectsWithStatsOutput = ProjectWithStats[];

// Usage Example
const projectStats = await client.listProjectsWithStats.query();

projectStats.forEach(project => {
  console.log(\`\${project.name}: \${project.environmentsCount} environments\`);
});`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-purple-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Settings className="h-4 w-4" />
											renameProject
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface RenameProjectInput {
  id: string;    // Project UUID
  name: string;  // New project name
}

// Output Schema
interface RenameProjectOutput {
  id: string;    // Project UUID
  name: string;  // Updated name
}

// Usage Example
const updated = await client.renameProject.mutate({
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Updated Project Name"
});`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-red-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											deleteProject
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface DeleteProjectInput {
  id: string;  // Project UUID to delete
}

// Output Schema
interface DeleteProjectOutput {
  success: boolean;  // Deletion success status
}

// Usage Example
const result = await client.deleteProject.mutate({
  id: "550e8400-e29b-41d4-a716-446655440000"
});

if (result.success) {
  console.log("Project deleted successfully");
}

// Note: This also deletes all associated environment files`}
											language="typescript"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="environments" id="environments" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Server className="h-5 w-5 text-green-500" />
									Environment Management
								</CardTitle>
								<CardDescription>
									Upload, retrieve, and manage environment files with encryption and versioning
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="border-l-4 border-green-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Plus className="h-4 w-4" />
											uploadEnv
										</h4>
										<CodeBlock 
											code={`// Input Schema (Plaintext)
interface UploadEnvPlaintextInput {
  projectId: string;     // Project UUID
  environment: string;   // Environment name
  content: string;       // Raw .env content
  passphrase: string;    // Encryption passphrase (min 8 chars)
}

// Input Schema (Pre-encrypted)
interface UploadEnvEncryptedInput {
  projectId: string;     // Project UUID
  environment: string;   // Environment name
  ciphertext: string;    // Encrypted content
  iv: string;            // Initialization vector
  salt: string;          // PBKDF2 salt
  checksum: string;      // Content checksum
}

// Output Schema
interface UploadEnvOutput {
  id: string;      // Environment file UUID
  version: number; // Auto-incremented version
}

// Usage Example
const envFile = await client.uploadEnv.mutate({
  projectId: "550e8400-e29b-41d4-a716-446655440000",
  environment: "production",
  content: "DATABASE_URL=postgres://localhost:5432/db\\nAPI_KEY=secret123",
  passphrase: "secure-passphrase"
});

console.log(\`Uploaded version \${envFile.version}\`);`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-blue-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Eye className="h-4 w-4" />
											listEnvs
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface ListEnvsInput {
  projectId: string;  // Project UUID
}

// Output Schema
interface EnvironmentSummary {
  environment: string;    // Environment name
  latestVersion: number;  // Latest version number
}

type ListEnvsOutput = EnvironmentSummary[];

// Usage Example
const environments = await client.listEnvs.query({
  projectId: "550e8400-e29b-41d4-a716-446655440000"
});

environments.forEach(env => {
  console.log(\`\${env.environment}: v\${env.latestVersion}\`);
});`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-purple-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<FileText className="h-4 w-4" />
											listEnvVersions
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface ListEnvVersionsInput {
  projectId: string;    // Project UUID
  environment: string;  // Environment name
}

// Output Schema
interface EnvironmentVersion {
  id: string;           // Environment file UUID
  version: number;      // Version number
  createdAt: Date;      // Creation timestamp
  checksum: string;     // Content checksum
}

type ListEnvVersionsOutput = EnvironmentVersion[];

// Usage Example
const versions = await client.listEnvVersions.query({
  projectId: "550e8400-e29b-41d4-a716-446655440000",
  environment: "production"
});

console.log(\`Found \${versions.length} versions\`);`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-amber-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Download className="h-4 w-4" />
											getLatestEnv
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface GetLatestEnvInput {
  projectId: string;    // Project UUID
  environment: string;  // Environment name
}

// Output Schema
interface LatestEnvironment {
  id: string;           // Environment file UUID
  projectId: string;    // Project UUID
  environment: string;  // Environment name
  version: number;      // Version number
  ciphertext: string;   // Encrypted content
  iv: string;           // Initialization vector
  salt: string;         // PBKDF2 salt
  checksum: string;     // Content checksum
  createdAt: Date;      // Creation timestamp
}

type GetLatestEnvOutput = LatestEnvironment | null;

// Usage Example
const latest = await client.getLatestEnv.query({
  projectId: "550e8400-e29b-41d4-a716-446655440000", 
  environment: "production"
});

if (latest) {
  console.log(\`Latest version: \${latest.version}\`);
}`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-orange-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Shield className="h-4 w-4" />
											decryptEnv
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface DecryptEnvInput {
  id: string;           // Environment file UUID
  passphrase: string;   // Decryption passphrase
}

// Output Schema
interface DecryptEnvOutput {
  content: string;   // Decrypted plaintext content
  checksum: string;  // Content integrity checksum
}

type DecryptEnvResult = DecryptEnvOutput | null;

// Usage Example
const decrypted = await client.decryptEnv.mutate({
  id: "env_abc123def456",
  passphrase: "secure-passphrase"
});

if (decrypted) {
  console.log("Environment variables:");
  console.log(decrypted.content);
} else {
  console.log("Failed to decrypt - invalid passphrase or file");
}`}
											language="typescript"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="apikeys" id="apikeys" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Key className="h-5 w-5 text-amber-500" />
									API Key Management
								</CardTitle>
								<CardDescription>
									Generate, list, and revoke API keys for programmatic access
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="border-l-4 border-green-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Plus className="h-4 w-4" />
											createApiKey
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface CreateApiKeyInput {
  name: string;  // Descriptive name for the API key
}

// Output Schema
interface CreateApiKeyOutput {
  token: string;   // Full API key token (only returned once)
  prefix: string;  // Key prefix for identification
}

// Usage Example
const apiKey = await client.createApiKey.mutate({
  name: "Production Server Key"
});

console.log("API Key:", apiKey.token);     // "esk_live_abc123..."
console.log("Prefix:", apiKey.prefix);     // "esk_live_abc123"

// IMPORTANT: Store the token securely - it won't be shown again!`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-blue-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Eye className="h-4 w-4" />
											listApiKeys
										</h4>
										<CodeBlock 
											code={`// Input: None (query procedure)

// Output Schema
interface ApiKeySummary {
  id: string;                // API key UUID
  name: string;              // User-defined name
  prefix: string;            // Key prefix for identification
  createdAt: Date;           // Creation timestamp
  lastUsedAt: Date | null;   // Last usage timestamp
}

type ListApiKeysOutput = ApiKeySummary[];

// Usage Example
const apiKeys = await client.listApiKeys.query();

apiKeys.forEach(key => {
  const lastUsed = key.lastUsedAt 
    ? key.lastUsedAt.toLocaleDateString() 
    : 'Never used';
  
  console.log(\`\${key.name} (\${key.prefix}...): \${lastUsed}\`);
});`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-red-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											revokeApiKey
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface RevokeApiKeyInput {
  id: string;  // API key UUID to revoke
}

// Output Schema
interface RevokeApiKeyOutput {
  success: boolean;  // Revocation success status
}

// Usage Example
const result = await client.revokeApiKey.mutate({
  id: "api_key_uuid_here"
});

if (result.success) {
  console.log("API key revoked successfully");
  // The key will no longer work for API requests
}`}
											language="typescript"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="user" id="user" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5 text-purple-500" />
									User Management
								</CardTitle>
								<CardDescription>
									Profile management, statistics, and account operations
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="border-l-4 border-blue-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<User className="h-4 w-4" />
											getUserProfile
										</h4>
										<CodeBlock 
											code={`// Input: None (query procedure)

// Output Schema
interface UserProfile {
  id: string;        // User UUID
  email: string;     // User email address
  createdAt: Date;   // Account creation timestamp
}

// Usage Example
const profile = await client.getUserProfile.query();

console.log(\`Welcome \${profile.email}!\`);
console.log(\`Member since: \${profile.createdAt.toLocaleDateString()}\`);`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-green-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<FileText className="h-4 w-4" />
											getUsageStats
										</h4>
										<CodeBlock 
											code={`// Input: None (query procedure)

// Output Schema
interface UsageStats {
  projects: number;      // Number of projects
  apiKeys: number;       // Number of active API keys
  environments: number;  // Number of environments
  storageUsed: number;   // Storage used in bytes
}

// Usage Example
const stats = await client.getUsageStats.query();

console.log(\`You have:
  \${stats.projects} projects
  \${stats.environments} environments
  \${stats.apiKeys} API keys
  \${(stats.storageUsed / 1024 / 1024).toFixed(2)} MB used\`);`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-amber-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Shield className="h-4 w-4" />
											changePassword
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface ChangePasswordInput {
  currentPassword: string;  // Current password for verification
  newPassword: string;      // New password (min 8 characters)
}

// Output Schema
interface ChangePasswordOutput {
  success: boolean;  // Password change success status
}

// Usage Example
const result = await client.changePassword.mutate({
  currentPassword: "oldpassword123",
  newPassword: "newsecurepassword456"
});

if (result.success) {
  console.log("Password updated successfully");
}`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-orange-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											deleteAllUserData
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface DeleteAllUserDataInput {
  confirmPassword: string;  // Password confirmation
}

// Output Schema
interface DeleteAllUserDataOutput {
  success: boolean;  // Deletion success status
}

// Usage Example
const result = await client.deleteAllUserData.mutate({
  confirmPassword: "userpassword123"
});

if (result.success) {
  console.log("All user data deleted successfully");
  // This deletes projects, environments, and API keys
  // but keeps the user account active
}`}
											language="typescript"
										/>
									</div>

									<div className="border-l-4 border-red-500 pl-4">
										<h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											deleteAccount
										</h4>
										<CodeBlock 
											code={`// Input Schema
interface DeleteAccountInput {
  confirmPassword: string;  // Password confirmation
}

// Output Schema
interface DeleteAccountOutput {
  success: boolean;  // Account deletion success status
}

// Usage Example
const result = await client.deleteAccount.mutate({
  confirmPassword: "userpassword123"
});

if (result.success) {
  console.log("Account deleted successfully");
  // This permanently deletes the user account and all associated data
  // This action cannot be undone!
}`}
											language="typescript"
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</section>

			{/* Error Handling */}
			<section className="space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-semibold">Error Handling</h2>
					<p className="text-muted-foreground">
						tRPC procedures throw typed errors that can be caught and handled appropriately.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Common tRPC Errors</CardTitle>
						<CardDescription>
							Standard error types and how to handle them in your client code
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CodeBlock 
							code={`import { TRPCError } from '@trpc/server';

// Error handling example
try {
  const project = await client.createProject.mutate({
    name: "New Project"
  });
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    console.log('Please log in to continue');
    // Redirect to login
  } else if (error.data?.code === 'NOT_FOUND') {
    console.log('Resource not found');
  } else if (error.data?.code === 'BAD_REQUEST') {
    console.log('Invalid input:', error.message);
  } else {
    console.log('Unknown error:', error.message);
  }
}

// Common error codes:
// - UNAUTHORIZED: Invalid session or permissions
// - NOT_FOUND: Resource doesn't exist
// - BAD_REQUEST: Invalid input data  
// - INTERNAL_SERVER_ERROR: Server-side error
// - FORBIDDEN: Access denied`}
							language="typescript"
						/>
					</CardContent>
				</Card>
			</section>

			{/* Next Steps */}
			<section className="space-y-6 pt-8 border-t">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-semibold">Ready to use tRPC?</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Start building with type-safe procedures and enjoy the excellent developer experience.
					</p>
				</div>
				
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Button asChild size="lg">
						<Link href="/login">
							<Shield className="mr-2 h-4 w-4" />
							Login to Dashboard
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/examples">
							View Examples <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
					<Button variant="outline" size="lg" asChild>
						<Link href="/api-docs/rest-api">
							REST API Docs
						</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}