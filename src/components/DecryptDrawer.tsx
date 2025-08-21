'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Eye,
    EyeOff,
    Copy,
    Download,
    Shield,
    AlertTriangle,
    Loader2,
    Search,
    ClipboardPaste,
    X,
    FileText,
    CheckCircle2,
    KeyRound,
} from 'lucide-react';

interface DecryptDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDecrypt: (passphrase: string) => Promise<void>;
    decryptedContent: string | null;
    decryptError: string | null;
    isLoading: boolean;
    environment?: string;
}

interface ParsedPair {
    key: string;
    value: string;
}

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

const maskValue = (value: string) => {
    if (value.length <= 8) {
        return '•'.repeat(Math.max(6, value.length));
    }

    // For longer values, show first 3 chars + dots + last 3 chars
    const firstPart = value.slice(0, 3);
    const lastPart = value.slice(-3);
    const middleLength = Math.max(3, Math.min(8, value.length - 6));
    const dots = '•'.repeat(middleLength);

    return firstPart + dots + lastPart;
};

export default function DecryptDrawer({
    open,
    onOpenChange,
    onDecrypt,
    decryptedContent,
    decryptError,
    isLoading,
    environment = 'development',
}: DecryptDrawerProps) {
    const [passphrase, setPassphrase] = useState('');
    const [showValues, setShowValues] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [showPassphrase, setShowPassphrase] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'table' | 'raw'>('table');
    const [copiedAll, setCopiedAll] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const handleDecrypt = async () => {
        if (!passphrase.trim()) return;
        await onDecrypt(passphrase);
    };

    const copyToClipboard = async (text: string, key?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (key) {
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const downloadAsEnvFile = () => {
        if (!decryptedContent) return;
        const blob = new Blob([decryptedContent], {
            type: 'text/plain;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `.env.${environment}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const pairs = useMemo(
        () => (decryptedContent ? parseEnv(decryptedContent) : []),
        [decryptedContent]
    );

    const filteredPairs = useMemo(() => {
        if (!filter.trim()) return pairs;
        const q = filter.toLowerCase();
        return pairs.filter(
            (p) =>
                p.key.toLowerCase().includes(q) ||
                p.value.toLowerCase().includes(q)
        );
    }, [pairs, filter]);

    const sensitiveCount = pairs.filter(
        (p) =>
            p.key.toLowerCase().includes('key') ||
            p.key.toLowerCase().includes('secret') ||
            p.key.toLowerCase().includes('password') ||
            p.key.toLowerCase().includes('token')
    ).length;

    useEffect(() => {
        if (open) {
            // Focus the passphrase field when opening and reset local state
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setPassphrase('');
            setShowPassphrase(false);
            setCapsLockOn(false);
            setFilter('');
            setShowValues(false);
            setCopiedKey(null);
            setCopiedAll(false);
            setActiveTab('table');
        }
    }, [open]);

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setPassphrase('');
            setShowPassphrase(false);
            setCapsLockOn(false);
        }
        onOpenChange(next);
    };

    const copyAll = async () => {
        if (!decryptedContent) return;
        await copyToClipboard(decryptedContent);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
    };

    // Focus search input when decrypted content is available
    useEffect(() => {
        if (decryptedContent && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [decryptedContent]);

    const isSensitive = (key: string) => {
        const lowerKey = key.toLowerCase();
        return (
            lowerKey.includes('key') ||
            lowerKey.includes('secret') ||
            lowerKey.includes('password') ||
            lowerKey.includes('token')
        );
    };

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent
                side="bottom"
                className="h-[90vh] max-h-[90vh] flex flex-col p-0 rounded-t-xl"
            >
                <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {decryptedContent
                            ? `Environment Variables - ${environment}`
                            : 'Decrypt Environment Variables'}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6">
                    {!decryptedContent ? (
                        <div className="space-y-4 py-4">
                            <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        Enter your passphrase to decrypt
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Decryption happens securely in your
                                        browser - your passphrase is never sent
                                        to the server
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passphrase">Passphrase</Label>
                                <div className="relative">
                                    <Input
                                        id="passphrase"
                                        ref={inputRef}
                                        type={
                                            showPassphrase ? 'text' : 'password'
                                        }
                                        value={passphrase}
                                        onChange={(e) =>
                                            setPassphrase(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.getModifierState &&
                                                e.getModifierState('CapsLock')
                                            )
                                                setCapsLockOn(true);
                                            else setCapsLockOn(false);
                                            if (
                                                (e.key === 'Enter' ||
                                                    e.key === 'Return') &&
                                                !isLoading
                                            )
                                                handleDecrypt();
                                            if (
                                                (e.metaKey || e.ctrlKey) &&
                                                e.key.toLowerCase() ===
                                                    'enter' &&
                                                !isLoading
                                            )
                                                handleDecrypt();
                                        }}
                                        placeholder="Enter your secure passphrase"
                                        className="font-mono pr-24"
                                        aria-invalid={Boolean(decryptError)}
                                        disabled={isLoading}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck={false}
                                    />
                                    <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setShowPassphrase((s) => !s)
                                            }
                                            disabled={isLoading}
                                            aria-label={
                                                showPassphrase
                                                    ? 'Hide passphrase'
                                                    : 'Show passphrase'
                                            }
                                        >
                                            {showPassphrase ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={async () => {
                                                try {
                                                    const t =
                                                        await navigator.clipboard.readText();
                                                    if (t) setPassphrase(t);
                                                } catch {}
                                            }}
                                            disabled={isLoading}
                                            aria-label="Paste from clipboard"
                                        >
                                            <ClipboardPaste className="h-4 w-4" />
                                        </Button>
                                        {passphrase && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setPassphrase('')
                                                }
                                                disabled={isLoading}
                                                aria-label="Clear passphrase"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {capsLockOn && (
                                    <div className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />{' '}
                                        Caps Lock is on
                                    </div>
                                )}
                                {passphrase && passphrase.length < 8 && (
                                    <div className="text-xs text-muted-foreground">
                                        Use at least 8 characters for better
                                        security.
                                    </div>
                                )}
                            </div>

                            {decryptError && (
                                <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm">{decryptError}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 py-4">
                            {/* Summary and Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant={
                                            environment === 'production'
                                                ? 'destructive'
                                                : environment === 'staging'
                                                  ? 'secondary'
                                                  : 'outline'
                                        }
                                    >
                                        {environment}
                                    </Badge>
                                    <span className="text-sm">
                                        {pairs.length} variables
                                    </span>
                                    {sensitiveCount > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-50"
                                        >
                                            {sensitiveCount} sensitive
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyAll}
                                        className="flex-1 sm:flex-auto"
                                    >
                                        {copiedAll ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy all
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadAsEnvFile}
                                        className="flex-1 sm:flex-auto"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                    <Button
                                        variant={
                                            showValues
                                                ? 'destructive'
                                                : 'default'
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setShowValues(!showValues)
                                        }
                                        className="flex-1 sm:flex-auto"
                                    >
                                        {showValues ? (
                                            <>
                                                <EyeOff className="h-4 w-4 mr-2" />
                                                Hide Values
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4 mr-2" />
                                                Show Values
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* View Tabs */}
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) =>
                                    setActiveTab(v as 'table' | 'raw')
                                }
                                className="flex-1 flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList>
                                        <TabsTrigger
                                            value="table"
                                            className="flex items-center gap-1"
                                        >
                                            <Shield className="h-4 w-4" />
                                            Table View
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="raw"
                                            className="flex items-center gap-1"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Raw File
                                        </TabsTrigger>
                                    </TabsList>

                                    {activeTab === 'table' && (
                                        <div className="relative max-w-xs">
                                            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                ref={searchInputRef}
                                                value={filter}
                                                onChange={(e) =>
                                                    setFilter(e.target.value)
                                                }
                                                placeholder="Filter variables"
                                                className="pl-8 h-9"
                                            />
                                            {filter && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                                    onClick={() =>
                                                        setFilter('')
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <TabsContent
                                    value="table"
                                    className="flex-1 overflow-hidden flex flex-col mt-0 data-[state=active]:flex-1"
                                >
                                    <ScrollArea className="flex-1 border rounded-lg">
                                        <div className="max-h-[calc(90vh-300px)]">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[35%] min-w-[200px]">
                                                            Key
                                                        </TableHead>
                                                        <TableHead className="w-[50%] min-w-[300px]">
                                                            Value
                                                        </TableHead>
                                                        <TableHead className="w-[15%] min-w-[120px] text-right">
                                                            Actions
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredPairs.length ===
                                                        0 && (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={3}
                                                            >
                                                                <div className="text-sm text-muted-foreground py-6 text-center">
                                                                    {filter
                                                                        ? 'No variables match your filter.'
                                                                        : 'No environment variables found.'}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {filteredPairs.map(
                                                        (pair) => {
                                                            const sensitive =
                                                                isSensitive(
                                                                    pair.key
                                                                );
                                                            return (
                                                                <TableRow
                                                                    key={
                                                                        pair.key
                                                                    }
                                                                    className={
                                                                        sensitive
                                                                            ? 'bg-amber-50/30'
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <TableCell className="font-mono">
                                                                        <div className="flex items-center gap-2 min-w-0">
                                                                            <span className="break-all">
                                                                                {
                                                                                    pair.key
                                                                                }
                                                                            </span>
                                                                            {sensitive && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="bg-amber-50 border-amber-200 flex-shrink-0"
                                                                                >
                                                                                    secret
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="font-mono">
                                                                        <div className="min-w-0">
                                                                            <span
                                                                                className={`break-all ${sensitive && !showValues ? 'text-amber-600' : ''}`}
                                                                            >
                                                                                {showValues
                                                                                    ? pair.value
                                                                                    : maskValue(
                                                                                          pair.value
                                                                                      )}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                copyToClipboard(
                                                                                    pair.value,
                                                                                    pair.key
                                                                                )
                                                                            }
                                                                            className="h-8 flex-shrink-0"
                                                                        >
                                                                            {copiedKey ===
                                                                            pair.key ? (
                                                                                <>
                                                                                    <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                                                                                    <span className="text-green-500">
                                                                                        Copied
                                                                                    </span>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <Copy className="h-4 w-4 mr-1" />
                                                                                    Copy
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent
                                    value="raw"
                                    className="flex-1 overflow-hidden flex flex-col mt-0 data-[state=active]:flex-1"
                                >
                                    <ScrollArea className="flex-1 border rounded-lg bg-muted/30">
                                        <div className="max-h-[calc(90vh-300px)]">
                                            <pre className="font-mono text-sm whitespace-pre-wrap break-all p-4">
                                                {decryptedContent}
                                            </pre>
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>

                <SheetFooter className="px-6 py-4 border-t">
                    {decryptedContent ? (
                        <Button onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    ) : (
                        <Button
                            onClick={handleDecrypt}
                            disabled={isLoading || !passphrase.trim()}
                            className="min-w-[100px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Decrypting...
                                </>
                            ) : (
                                'Decrypt'
                            )}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
