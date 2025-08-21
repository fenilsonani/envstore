'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trpc } from '../../providers';
import ClientOnly from '@/components/ClientOnly';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DecryptDrawer from '@/components/DecryptDrawer';
import {
    Server,
    Upload,
    Eye,
    Copy,
    FileText,
    Clock,
    Shield,
} from 'lucide-react';

// Utility functions from original dashboard
function inferEnvironmentFromFilename(name?: string) {
    if (!name) return 'development';
    const lower = name.toLowerCase();
    if (/(prod|production)\.env|\.env\.prod(uction)?/.test(lower))
        return 'production';
    if (/(stag|staging)\.env|\.env\.stag(ing)?/.test(lower)) return 'staging';
    if (/(preview|pre)\.env|\.env\.preview/.test(lower)) return 'preview';
    if (/\.env\.local|local\.env/.test(lower)) return 'development';
    return 'development';
}

function inferEnvironmentFromContent(content: string) {
    const lc = content.toLowerCase();
    if (
        /node_env\s*=\s*production/.test(lc) ||
        /app_env\s*=\s*production/.test(lc) ||
        /env\s*=\s*production/.test(lc)
    )
        return 'production' as const;
    if (
        /node_env\s*=\s*staging/.test(lc) ||
        /app_env\s*=\s*staging/.test(lc) ||
        /env\s*=\s*staging/.test(lc)
    )
        return 'staging' as const;
    if (/vercel_env\s*=\s*preview/.test(lc) || /env\s*=\s*preview/.test(lc))
        return 'preview' as const;
    return 'development' as const;
}

type ParsedPair = { key: string; value: string };
function parseEnv(content: string): ParsedPair[] {
    const out: ParsedPair[] = [];
    for (const rawLine of content.split(/\r?\n/)) {
        let line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        if (line.startsWith('export ')) line = line.slice(7).trim();
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        let value = line.slice(eqIdx + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        out.push({ key, value });
    }
    return out;
}

// removed unused helpers

type Detection = {
    key: string;
    kind: 'public' | 'secret';
    service?: string;
    preview: string;
};
function detectKeys(pairs: ParsedPair[]): Detection[] {
    const detections: Detection[] = [];
    const byScheme = (val: string) => {
        if (/^postgres(ql)?:\/\//i.test(val)) return 'Postgres';
        if (/^mysql:\/\//i.test(val)) return 'MySQL';
        if (/^mongodb(\+srv)?:\/\//i.test(val)) return 'MongoDB';
        if (/^redis(:|\+rediss)?:\/\//i.test(val)) return 'Redis';
        if (/^libsql:\/\//i.test(val)) return 'libSQL';
        return undefined;
    };
    for (const { key, value } of pairs) {
        const upper = key.toUpperCase();
        const preview = (() => {
            if (value.length <= 8) {
                return value;
            }
            if (value.length <= 24) {
                return value;
            }
            // For longer values, show first 3 chars + dots + last 3 chars
            const firstPart = value.slice(0, 3);
            const lastPart = value.slice(-3);
            return firstPart + '•••••••' + lastPart;
        })();
        let kind: Detection['kind'] = upper.startsWith('NEXT_PUBLIC_')
            ? 'public'
            : 'secret';
        let service: string | undefined;
        if (upper === 'DATABASE_URL') service = byScheme(value) || 'Database';
        else if (upper.startsWith('STRIPE_')) service = 'Stripe';
        else if (upper === 'OPENAI_API_KEY' && /^sk-/.test(value))
            service = 'OpenAI';
        else if (upper === 'GITHUB_TOKEN' || upper === 'GH_TOKEN')
            service = 'GitHub';
        else if (upper.startsWith('AWS_')) service = 'AWS';
        else if (upper.startsWith('SUPABASE_')) service = 'Supabase';
        else if (upper.startsWith('SENTRY_')) service = 'Sentry';
        else if (upper.includes('RESEND')) service = 'Resend';
        else if (upper.includes('MAILGUN')) service = 'Mailgun';
        else if (upper.includes('TWILIO')) service = 'Twilio';
        else if (upper.includes('VERCEL')) service = 'Vercel';
        else if (upper.includes('JWT') || upper.includes('SECRET'))
            service = 'Secret';
        if (upper === 'SUPABASE_ANON_KEY') kind = 'public';
        if (upper === 'SUPABASE_SERVICE_ROLE_KEY') kind = 'secret';
        detections.push({ key, kind, service, preview });
    }
    return detections;
}

function EnvironmentsPageContent() {
    const searchParams = useSearchParams();
    const preselectedProject = searchParams.get('project');

    const [currentProjectId, setCurrentProjectId] = useState<string | null>(
        preselectedProject
    );
    const [envName, setEnvName] = useState('development');
    const [passphrase, setPassphrase] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [plaintext, setPlaintext] = useState('');
    const [decryptDialogOpen, setDecryptDialogOpen] = useState(false);
    const [decryptSelectionId, setDecryptSelectionId] = useState<string | null>(
        null
    );
    const [decryptLoading, setDecryptLoading] = useState(false);
    const [decryptError, setDecryptError] = useState<string | null>(null);
    const [decryptedContent, setDecryptedContent] = useState<string | null>(
        null
    );

    const projects = trpc.listProjects.useQuery();
    const uploadEnv = trpc.uploadEnv.useMutation();
    const listEnvs = trpc.listEnvs.useQuery(
        {
            projectId:
                currentProjectId ?? '00000000-0000-0000-0000-000000000000',
        },
        { enabled: !!currentProjectId }
    );
    const listVersions = trpc.listEnvVersions.useQuery(
        {
            projectId:
                currentProjectId ?? '00000000-0000-0000-0000-000000000000',
            environment: envName,
        },
        { enabled: !!currentProjectId }
    );
    const getCipher = trpc.getEnvCipher.useMutation();
    const decryptEnv = trpc.decryptEnv.useMutation();

    useEffect(() => {
        if (!currentProjectId && projects.data && projects.data.length > 0) {
            setCurrentProjectId(projects.data[0].id);
        }
    }, [projects.data, currentProjectId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) {
            const text = await file.text();
            setPlaintext(text);
            setEnvName(inferEnvironmentFromFilename(file.name));
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setPlaintext(text);
                setEnvName(inferEnvironmentFromContent(text));
            }
        } catch (e) {
            console.error('Clipboard read failed', e);
        }
    };

    const parsed = useMemo(() => parseEnv(plaintext), [plaintext]);
    const detections = useMemo(() => detectKeys(parsed), [parsed]);

    const canUpload = useMemo(
        () =>
            Boolean(currentProjectId) &&
            passphrase.length >= 8 &&
            plaintext.length > 0,
        [currentProjectId, passphrase, plaintext]
    );

    const handleUpload = async () => {
        if (!currentProjectId || !canUpload) return;
        await uploadEnv.mutateAsync({
            projectId: currentProjectId,
            environment: envName,
            content: plaintext,
            passphrase,
        });
        setPlaintext('');
        setSelectedFile(null);
        setPassphrase('');
        await Promise.all([listEnvs.refetch(), listVersions.refetch()]);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {}
    };

    const handleCopyCipher = async (id: string) => {
        const res = await getCipher.mutateAsync({ id });
        if (!res) return;
        await copyToClipboard(
            JSON.stringify({
                ciphertext: res.ciphertext,
                iv: res.iv,
                salt: res.salt,
                checksum: res.checksum,
            })
        );
    };

    const openDecryptDialog = (id: string) => {
        setDecryptSelectionId(id);
        setDecryptError(null);
        setDecryptedContent(null);
        setDecryptDialogOpen(true);
    };

    const handleDecrypt = async (passphrase: string) => {
        if (!decryptSelectionId || !passphrase) return;
        setDecryptLoading(true);
        setDecryptError(null);
        try {
            const res = await decryptEnv.mutateAsync({
                id: decryptSelectionId,
                passphrase,
            });
            if (!res?.content) {
                setDecryptError('Invalid passphrase or missing record.');
            } else {
                setDecryptedContent(res.content);
            }
        } catch {
            setDecryptError(
                'Decryption failed. Check the passphrase and try again.'
            );
        } finally {
            setDecryptLoading(false);
        }
    };

    // removed unused downloadPlaintext

    // removed unused decryptedPairs

    return (
        <ClientOnly>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Environments
                        </h1>
                        <p className="text-muted-foreground">
                            Upload, manage, and securely store your environment
                            files
                        </p>
                    </div>

                    {/* Project Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={currentProjectId ?? ''}
                                onValueChange={(v) => setCurrentProjectId(v)}
                            >
                                <SelectTrigger className="max-w-sm">
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.data?.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Upload Environment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Upload className="h-5 w-5 mr-2" />
                                Upload Environment File
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Upload File</Label>
                                    <Input
                                        type="file"
                                        accept=".env,text/plain"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handlePasteFromClipboard}
                                    >
                                        Paste from clipboard
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPlaintext('')}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Environment Content</Label>
                                <Textarea
                                    value={plaintext}
                                    onChange={(e) =>
                                        setPlaintext(e.target.value)
                                    }
                                    placeholder="KEY=VALUE&#10;ANOTHER=value"
                                    className="font-mono min-h-[120px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Environment Name</Label>
                                    <Input
                                        value={envName}
                                        onChange={(e) =>
                                            setEnvName(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Passphrase (min 8 characters)</Label>
                                    <Input
                                        type="password"
                                        value={passphrase}
                                        onChange={(e) =>
                                            setPassphrase(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleUpload}
                                disabled={
                                    !canUpload ||
                                    uploadEnv.isPending ||
                                    !currentProjectId
                                }
                                className="w-full md:w-auto"
                            >
                                {uploadEnv.isPending
                                    ? 'Encrypting & Saving...'
                                    : 'Encrypt & Save'}
                            </Button>

                            {selectedFile && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Key Detection Preview */}
                    {parsed.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Detected Keys ({detections.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Preview</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {detections.map((d) => (
                                                <TableRow key={d.key}>
                                                    <TableCell className="font-mono">
                                                        {d.key}
                                                    </TableCell>
                                                    <TableCell>
                                                        {d.kind === 'public' ? (
                                                            <Badge variant="secondary">
                                                                public
                                                            </Badge>
                                                        ) : (
                                                            <Badge>
                                                                secret
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {d.service ? (
                                                            <Badge variant="outline">
                                                                {d.service}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-muted-foreground">
                                                        {d.preview}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                copyToClipboard(
                                                                    parsed.find(
                                                                        (p) =>
                                                                            p.key ===
                                                                            d.key
                                                                    )?.value ??
                                                                        ''
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Stored Environments */}
                    {currentProjectId && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Server className="h-5 w-5 mr-2" />
                                    Stored Environments
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {listEnvs.isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="h-28 rounded-lg bg-muted animate-pulse" />
                                        <div className="h-28 rounded-lg bg-muted animate-pulse" />
                                        <div className="h-28 rounded-lg bg-muted animate-pulse" />
                                    </div>
                                ) : listEnvs.data &&
                                  listEnvs.data.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {listEnvs.data.map((e) => {
                                                let badgeVariant = 'outline';
                                                if (
                                                    e.environment ===
                                                    'production'
                                                )
                                                    badgeVariant =
                                                        'destructive';
                                                else if (
                                                    e.environment === 'staging'
                                                )
                                                    badgeVariant = 'secondary';
                                                else if (
                                                    e.environment ===
                                                    'development'
                                                )
                                                    badgeVariant = 'default';

                                                return (
                                                    <Card
                                                        key={e.environment}
                                                        className={`cursor-pointer transition-all ${e.environment === envName ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                                                        onClick={() =>
                                                            setEnvName(
                                                                e.environment
                                                            )
                                                        }
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge
                                                                    variant={
                                                                        badgeVariant as
                                                                            | 'default'
                                                                            | 'secondary'
                                                                            | 'destructive'
                                                                            | 'outline'
                                                                    }
                                                                >
                                                                    {
                                                                        e.environment
                                                                    }
                                                                </Badge>
                                                                <span className="text-sm text-muted-foreground">
                                                                    v
                                                                    {
                                                                        e.latestVersion
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center text-sm text-muted-foreground">
                                                                <Shield className="h-4 w-4 mr-1" />
                                                                Encrypted
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>

                                        {/* Version History */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold flex items-center">
                                                    <Clock className="h-5 w-5 mr-2" />
                                                    Version History
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {envName}
                                                    </Badge>
                                                    <Select
                                                        value={envName}
                                                        onValueChange={(v) =>
                                                            setEnvName(v)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {listEnvs.data?.map(
                                                                (e) => (
                                                                    <SelectItem
                                                                        key={
                                                                            e.environment
                                                                        }
                                                                        value={
                                                                            e.environment
                                                                        }
                                                                    >
                                                                        {
                                                                            e.environment
                                                                        }
                                                                    </SelectItem>
                                                                )
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="border rounded-lg">
                                                {listVersions.isLoading ? (
                                                    <div className="p-8">
                                                        <div className="h-32 rounded-lg bg-muted animate-pulse" />
                                                    </div>
                                                ) : listVersions.data &&
                                                  listVersions.data.length >
                                                      0 ? (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    Version
                                                                </TableHead>
                                                                <TableHead>
                                                                    Created
                                                                </TableHead>
                                                                <TableHead>
                                                                    Checksum
                                                                </TableHead>
                                                                <TableHead>
                                                                    Actions
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {listVersions.data.map(
                                                                (v) => (
                                                                    <TableRow
                                                                        key={
                                                                            v.id
                                                                        }
                                                                    >
                                                                        <TableCell className="font-medium">
                                                                            v
                                                                            {
                                                                                v.version
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {new Date(
                                                                                v.createdAt
                                                                            ).toLocaleDateString()}{' '}
                                                                            {new Date(
                                                                                v.createdAt
                                                                            ).toLocaleTimeString(
                                                                                [],
                                                                                {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                }
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="font-mono text-xs">
                                                                            {v.checksum.slice(
                                                                                0,
                                                                                12
                                                                            )}
                                                                            …
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="flex gap-2">
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        handleCopyCipher(
                                                                                            v.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Copy className="h-4 w-4 mr-1" />
                                                                                    Copy
                                                                                </Button>
                                                                                <Button
                                                                                    variant="default"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        openDecryptDialog(
                                                                                            v.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                                    Decrypt
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                        <p className="text-muted-foreground">
                                                            No versions
                                                            available for{' '}
                                                            <strong>
                                                                {envName}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Server className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">
                                            No environments uploaded yet
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Upload your first .env file to get
                                            started
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Decrypt Drawer */}
                    <DecryptDrawer
                        open={decryptDialogOpen}
                        onOpenChange={(open) => {
                            setDecryptDialogOpen(open);
                            if (!open) {
                                setDecryptedContent(null);
                                setDecryptError(null);
                            }
                        }}
                        onDecrypt={handleDecrypt}
                        decryptedContent={decryptedContent}
                        decryptError={decryptError}
                        isLoading={decryptLoading}
                        environment={envName}
                    />
                </div>
            </DashboardLayout>
        </ClientOnly>
    );
}

export default function EnvironmentsPage() {
    return (
        <Suspense
            fallback={
                <ClientOnly>
                    <DashboardLayout>
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">
                                    Loading environments...
                                </p>
                            </div>
                        </div>
                    </DashboardLayout>
                </ClientOnly>
            }
        >
            <EnvironmentsPageContent />
        </Suspense>
    );
}
