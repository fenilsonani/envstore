'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClientOnly from '@/components/ClientOnly';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Shield, 
  Server, 
  Database, 
  Code, 
  AlertTriangle,
  Home,
  Key
} from 'lucide-react';

const navigationItems = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/api-docs',
    icon: Home,
    description: 'API introduction and capabilities'
  },
  {
    id: 'authentication',
    label: 'Authentication',
    href: '/api-docs/authentication',
    icon: Shield,
    description: 'Session and API key authentication'
  },
  {
    id: 'rest-api',
    label: 'REST API',
    href: '/api-docs/rest-api',
    icon: Server,
    description: 'REST endpoints and schemas'
  },
  {
    id: 'trpc',
    label: 'tRPC Procedures',
    href: '/api-docs/trpc',
    icon: Database,
    description: 'Type-safe procedure calls'
  },
  {
    id: 'examples',
    label: 'Client Examples',
    href: '/api-docs/examples',
    icon: Code,
    description: 'Integration examples and SDKs'
  },
  {
    id: 'errors',
    label: 'Error Handling',
    href: '/api-docs/errors',
    icon: AlertTriangle,
    description: 'Error codes and troubleshooting'
  }
];

interface ApiDocsLayoutProps {
  children: React.ReactNode;
}

export default function ApiDocsLayout({ children }: ApiDocsLayoutProps) {
  const pathname = usePathname();

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-semibold">EnvStore</span>
                </Link>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  API Documentation
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href="/dashboard">
                    Dashboard
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard/api-keys">
                    <Key className="mr-2 h-4 w-4" />
                    Generate Key
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    API Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start text-left h-auto py-3 px-3"
                        asChild
                      >
                        <Link href={item.href}>
                          <div className="flex items-start space-x-3">
                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium">
                                {item.label}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="mt-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/api-keys">
                      <Key className="mr-2 h-4 w-4" />
                      API Keys
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard/projects">
                      <Server className="mr-2 h-4 w-4" />
                      Projects
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}