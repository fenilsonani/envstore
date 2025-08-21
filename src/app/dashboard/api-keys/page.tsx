'use client';
import { useEffect, useState } from 'react';
import { trpc } from '../../providers';
import ClientOnly from '@/components/ClientOnly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Key,
    Plus,
    Copy,
    Trash2,
    Eye,
    AlertTriangle,
    Code,
    ExternalLink,
    Loader2,
} from 'lucide-react';

// Client-side component for API example code
const ApiExampleCode = () => {
    const [origin, setOrigin] = useState('https://example.com');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    return (
        <pre className="text-xs overflow-x-auto">
            {`curl -H "x-api-key: YOUR_API_KEY" \\
  "${origin}/api/v1/env/latest?projectId=YOUR_PROJECT_ID&environment=development"`}
        </pre>
    );
};

export default function ApiKeysPage() {
    const [apiKeyName, setApiKeyName] = useState('');
    const [apiKeyPlain, setApiKeyPlain] = useState<string | null>(null);
    const [apiKeyCopied, setApiKeyCopied] = useState(false);
    const [showNewKeyAlert, setShowNewKeyAlert] = useState(false);

    const listKeys = trpc.listApiKeys.useQuery();
    const createKey = trpc.createApiKey.useMutation({
        onSuccess: (data) => {
            setApiKeyPlain(data.token);
            setApiKeyName('');
            setShowNewKeyAlert(true);
            listKeys.refetch();
        },
    });
    const revokeApiKey = trpc.revokeApiKey.useMutation({
        onSuccess: () => listKeys.refetch(),
    });

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setApiKeyCopied(true);
            setTimeout(() => setApiKeyCopied(false), 2000);
        } catch {}
    };

    const handleCreateKey = async () => {
        if (!apiKeyName.trim()) return;
        await createKey.mutateAsync({ name: apiKeyName.trim() });
    };

    const handleRevokeKey = async (id: string) => {
        if (
            confirm(
                'Are you sure you want to revoke this API key? This action cannot be undone.'
            )
        ) {
            await revokeApiKey.mutateAsync({ id });
        }
    };

    return (
        <ClientOnly>
            <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            API Keys
                        </h1>
                        <p className="text-muted-foreground">
                            Manage API keys for programmatic access to your
                            environments
                        </p>
                    </div>

                    {/* Create API Key */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Plus className="h-5 w-5 mr-2" />
                                Create New API Key
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="key-name">Key Name</Label>
                                    <Input
                                        id="key-name"
                                        placeholder="e.g., CI/CD, Development, Production Deploy"
                                        value={apiKeyName}
                                        onChange={(e) =>
                                            setApiKeyName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' &&
                                            handleCreateKey()
                                        }
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleCreateKey}
                                        disabled={
                                            createKey.isPending ||
                                            !apiKeyName.trim()
                                        }
                                    >
                                        {createKey.isPending
                                            ? 'Creating...'
                                            : 'Create API Key'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* New API Key Alert */}
                    {apiKeyPlain && showNewKeyAlert && (
                        <Card className="border-primary bg-primary/5">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <AlertTriangle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-primary mb-2">
                                            New API Key Created
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            This key will only be shown once.
                                            Copy it now and store it securely.
                                        </p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Input
                                                readOnly
                                                value={apiKeyPlain}
                                                className="font-mono text-sm bg-background"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    copyToClipboard(apiKeyPlain)
                                                }
                                            >
                                                {apiKeyCopied ? (
                                                    <>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setApiKeyPlain(null);
                                                setShowNewKeyAlert(false);
                                            }}
                                        >
                                            I&apos;ve saved it securely
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Existing API Keys */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Key className="h-5 w-5 mr-2" />
                                Your API Keys
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {listKeys.isLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    <p className="text-muted-foreground">
                                        Loading API keys…
                                    </p>
                                </div>
                            ) : listKeys.data && listKeys.data.length > 0 ? (
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>
                                                    Key Prefix
                                                </TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead>Last Used</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {listKeys.data.map((key) => (
                                                <TableRow key={key.id}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Key className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {key.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="bg-muted px-2 py-1 rounded text-sm">
                                                            {key.prefix}...
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(
                                                            key.createdAt
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {key.lastUsedAt ? (
                                                            new Date(
                                                                key.lastUsedAt
                                                            ).toLocaleDateString()
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Never
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="default"
                                                            className="bg-green-100 text-green-800 border-green-200"
                                                        >
                                                            Active
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                handleRevokeKey(
                                                                    key.id
                                                                )
                                                            }
                                                            disabled={
                                                                revokeApiKey.isPending
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        No API keys created yet
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Create your first API key to access your
                                        environments programmatically
                                    </p>
                                    <Button
                                        onClick={() =>
                                            setApiKeyName('My First API Key')
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First API Key
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* API Usage Documentation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Code className="h-5 w-5 mr-2" />
                                    API Usage Example
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Use your API key in the{' '}
                                    <code className="bg-muted px-1 rounded">
                                        x-api-key
                                    </code>{' '}
                                    header to authenticate requests:
                                </p>
                                <div className="bg-muted p-3 rounded-lg">
                                    <ApiExampleCode />
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href="/api-docs"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Full API Documentation
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security Best Practices</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Store keys securely
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Never commit API keys to version
                                                control
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Use environment-specific keys
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Create separate keys for
                                                different environments
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Rotate keys regularly
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Revoke and recreate keys
                                                periodically
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Monitor usage
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Check the &quot;Last Used&quot;
                                                column regularly
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
            </div>
        </ClientOnly>
    );
}
