'use client';
import ClientOnly from '@/components/ClientOnly';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '@/components/CodeBlock';

import {
    Lock,
    History,
    KeyRound,
    ShieldCheck,
    TerminalSquare,
    Globe2,
    Github,
    Heart,
    HelpCircle,
} from 'lucide-react';
import {
    SiNextdotjs,
    SiReact,
    SiTypescript,
    SiTailwindcss,
    SiVercel,
    SiDrizzle,
    SiTrpc,
    SiTurso,
} from 'react-icons/si';

export default function Home() {
    return (
        <ClientOnly>
            <main className="mx-auto max-w-6xl px-6 py-20 md:py-28">
                {/* Hero */}
                <section className="relative text-center">
                    <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent_70%)]">
                        <div className="mx-auto h-64 max-w-5xl bg-[radial-gradient(ellipse_at_center,oklch(0.828_0.189_84.429)/20%,transparent_60%)]" />
                    </div>
                    <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4" /> End‑to‑end encrypted
                        • Zero‑trust by design
                    </p>
                    <h1 className="mx-auto max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
                        EnvStore — the secure home for your .env files
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
                        Upload, version, and retrieve environment files with
                        client‑side encryption and simple APIs. Your secrets
                        never leave your control.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button asChild className="px-6">
                            <a href="/signup">Get started free</a>
                        </Button>
                        <Button variant="outline" asChild className="px-6">
                            <a href="/login">Sign in</a>
                        </Button>
                        <Button variant="secondary" asChild className="px-6">
                            <a href="/dashboard">Go to dashboard</a>
                        </Button>
                    </div>
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-3 opacity-80">
                        <span className="text-xs text-muted-foreground">
                            Built with
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiNextdotjs className="size-4" aria-hidden />{' '}
                            Next.js
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiReact className="size-4" aria-hidden /> React 19
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiTypescript className="size-4" aria-hidden />{' '}
                            TypeScript
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiTailwindcss className="size-4" aria-hidden />{' '}
                            Tailwind CSS
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiTrpc className="size-4" aria-hidden /> tRPC
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiDrizzle className="size-4" aria-hidden />
                            Drizzle ORM
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiTurso className="size-4" aria-hidden />
                            libSQL (Turso)
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                            <SiVercel className="size-4" aria-hidden /> Vercel
                        </span>
                    </div>
                    {/* Secured with badges */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                        <span className="text-xs text-muted-foreground">
                            Secured with
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-muted-foreground">
                            <Lock className="size-3.5" /> Secured with
                            AES‑256‑GCM
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-muted-foreground">
                            <KeyRound className="size-3.5" /> PBKDF2 210k +
                            random salts
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-muted-foreground">
                            <ShieldCheck className="size-3.5" /> Argon2id
                            password hashing
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-muted-foreground">
                            <ShieldCheck className="size-3.5" /> JWT sessions
                            (jose)
                        </span>
                    </div>
                </section>

                {/* Feature grid */}
                <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <Lock className="size-5" />
                                <CardTitle>End‑to‑end encryption</CardTitle>
                            </div>
                            <CardDescription>
                                AES‑GCM 256 with PBKDF2 (210k) and per‑record
                                IVs. We store only ciphertext, IV, salt, and
                                checksum.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <History className="size-5" />
                                <CardTitle>Versioning & rollback</CardTitle>
                            </div>
                            <CardDescription>
                                Every upload bumps a version. Fetch the latest
                                safely or pin a specific version when needed.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <KeyRound className="size-5" />
                                <CardTitle>Simple API keys</CardTitle>
                            </div>
                            <CardDescription>
                                Authenticate with an `x-api-key` header to
                                access your projects and environments.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 text-primary">
                                <TerminalSquare className="size-5" />
                                <CardTitle>Rate‑limited endpoints</CardTitle>
                            </div>
                            <CardDescription>
                                Built‑in protection against abuse. Clear errors
                                with `Retry‑After` headers.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </section>

                {/* How it works */}
                <section className="mt-24 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            How it works
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            A clear, three‑step flow that keeps plaintext out of
                            our servers.
                        </p>
                        <ol className="mt-6 space-y-4 text-left">
                            <li className="flex items-start gap-3">
                                <Lock className="mt-1 size-5 text-primary" />
                                <div>
                                    <p className="font-medium">
                                        Encrypt on upload
                                    </p>
                                    <p className="text-muted-foreground">
                                        Your browser or server derives a key
                                        from your passphrase (PBKDF2 210k) and
                                        encrypts with AES‑256‑GCM. The
                                        passphrase never leaves your machine.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <History className="mt-1 size-5 text-primary" />
                                <div>
                                    <p className="font-medium">
                                        Version & fetch
                                    </p>
                                    <p className="text-muted-foreground">
                                        Every upload creates an immutable
                                        version with timestamps. CI can pin a
                                        version or fetch the latest for any
                                        environment.
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="mt-1 size-5 text-primary" />
                                <div>
                                    <p className="font-medium">
                                        Decrypt where needed
                                    </p>
                                    <p className="text-muted-foreground">
                                        Only your runtime sees plaintext.
                                        Decrypt with Web Crypto using your
                                        passphrase; integrity is verified via
                                        checksum.
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b">
                            <CardTitle>API examples</CardTitle>
                            <CardDescription>
                                Use simple HTTP with an `x-api-key` header.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs defaultValue="node-upload">
                                <TabsList>
                                    <TabsTrigger value="node-upload">
                                        Node · Upload
                                    </TabsTrigger>
                                    <TabsTrigger value="node-latest">
                                        Node · Latest
                                    </TabsTrigger>
                                    <TabsTrigger value="python-latest">
                                        Python · Latest
                                    </TabsTrigger>
                                    <TabsTrigger value="curl-upload">
                                        cURL · Upload
                                    </TabsTrigger>
                                    <TabsTrigger value="curl-latest">
                                        cURL · Latest
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="node-upload">
                                    <CodeBlock
                                        code={`import fetch from "node-fetch";

const API_KEY = process.env.ENVSTORE_API_KEY!;

const res = await fetch("/api/v1/env/upload", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": API_KEY,
  },
  body: JSON.stringify({
    projectId: "00000000-0000-0000-0000-000000000000",
    environment: "production",
    content: "DATABASE_URL=...\nTOKEN=...",
    passphrase: "your-strong-passphrase",
  }),
});
console.log(await res.json());`}
                                    />
                                </TabsContent>
                                <TabsContent value="node-latest">
                                    <CodeBlock
                                        code={`const res = await fetch("/api/v1/env/latest?projectId=PROJECT_ID&environment=production", {
  headers: { "x-api-key": process.env.ENVSTORE_API_KEY! },
});
const { ciphertext, iv, salt } = await res.json();
// Decrypt using Web Crypto (Node 18+/Edge runtimes)
// ... deriveKey(passphrase, salt) → decrypt(ciphertext, iv) → plaintext
`}
                                    />
                                </TabsContent>
                                <TabsContent value="python-latest">
                                    <CodeBlock
                                        code={`import requests

API_KEY = os.getenv("ENVSTORE_API_KEY")

res = requests.get("https://envstore.fenilsonani.com/api/v1/env/latest?projectId=PROJECT_ID&environment=production", headers={"x-api-key": API_KEY})
`}
                                    />
                                </TabsContent>
                                <TabsContent value="curl-upload">
                                    <CodeBlock
                                        code={`curl -X POST \
  -H "content-type: application/json" \
  -H "x-api-key: $ENVSTORE_API_KEY" \
  -d '{
    "projectId": "00000000-0000-0000-0000-000000000000",
    "environment": "staging",
    "content": "KEY=VALUE",
    "passphrase": "your-strong-passphrase"
  }' \
  https://envstore.fenilsonani.com/api/v1/env/upload`}
                                    />
                                </TabsContent>
                                <TabsContent value="curl-latest">
                                    <CodeBlock
                                        code={`curl -s \
  -H "x-api-key: $ENVSTORE_API_KEY" \
  "https://envstore.fenilsonani.com/api/v1/env/latest?projectId=PROJECT_ID&environment=production" | jq .`}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </section>

                {/* Security & methods */}
                <section className="mt-24 grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="size-5 text-primary" />
                                <CardTitle>Security & cryptography</CardTitle>
                            </div>
                            <CardDescription>
                                Modern primitives; no plaintext `.env` stored on
                                the server.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 py-5 text-sm text-muted-foreground">
                            <p>
                                • Client‑side AES‑GCM 256 with per‑record IVs
                                and SHA‑256 checksums.
                            </p>
                            <p>
                                • PBKDF2 key derivation with 210,000 iterations
                                and random salts (Web Crypto).
                            </p>
                            <p>• Passwords hashed with Argon2id.</p>
                            <p>
                                • Sessions: signed JWT (HS256 via{' '}
                                <code>jose</code>) stored in secure HTTP‑only
                                cookies.
                            </p>
                            <p>
                                • API keys stored as SHA‑256 hashes with
                                identifiable prefixes; strict rate limiting.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <TerminalSquare className="size-5 text-primary" />
                                <CardTitle>Architecture & stack</CardTitle>
                            </div>
                            <CardDescription>
                                The tools that power EnvStore.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 py-5 text-sm text-muted-foreground">
                            <p>
                                • Next.js App Router, React 19, TypeScript,
                                Tailwind CSS.
                            </p>
                            <p>• tRPC for typesafe server communication.</p>
                            <p>• Drizzle ORM with libSQL/Turso for storage.</p>
                            <p>
                                • Deployed on Vercel; edge‑friendly Web Crypto
                                APIs.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Use cases */}
                <section className="mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight text-center">
                        Common use cases
                    </h2>
                    <p className="mt-2 text-center text-muted-foreground">
                        Where teams use EnvStore day‑to‑day.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-primary">
                                    <Globe2 className="size-5" />
                                    <CardTitle>Share across envs</CardTitle>
                                </div>
                                <CardDescription>
                                    Keep dev/staging/prod in sync with versioned
                                    uploads and safe rollbacks.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-primary">
                                    <TerminalSquare className="size-5" />
                                    <CardTitle>CI fetch before build</CardTitle>
                                </div>
                                <CardDescription>
                                    Pull the latest secrets in pipelines
                                    just‑in‑time without exposing plaintext.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-primary">
                                    <KeyRound className="size-5" />
                                    <CardTitle>Rotate safely</CardTitle>
                                </div>
                                <CardDescription>
                                    Upload new versions during rotations and pin
                                    exact versions during rollout.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-primary">
                                    <History className="size-5" />
                                    <CardTitle>Preview deployments</CardTitle>
                                </div>
                                <CardDescription>
                                    Create ephemeral envs for PRs; cleanly
                                    retire them without leaving secrets behind.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>

                {/* CI & CLI examples */}
                <section className="mt-24">
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <TerminalSquare className="size-5 text-primary" />
                                <CardTitle>CI & CLI examples</CardTitle>
                            </div>
                            <CardDescription>
                                Fetch secrets in CI and local scripts with
                                simple commands.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs defaultValue="gh-actions">
                                <TabsList>
                                    <TabsTrigger value="gh-actions">
                                        GitHub Actions
                                    </TabsTrigger>
                                    <TabsTrigger value="bash">
                                        Bash script
                                    </TabsTrigger>
                                    <TabsTrigger value="curl">
                                        cURL quickstart
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="gh-actions">
                                    <CodeBlock
                                        language="bash"
                                        code={`# .github/workflows/build.yml
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Fetch env from EnvStore
        env:
          ENVSTORE_API_KEY: \${{ secrets.ENVSTORE_API_KEY }}
        run: |
          curl -s \
            -H "x-api-key: $ENVSTORE_API_KEY" \
            "https://envstore.fenilsonani.com/api/v1/env/latest?projectId=PROJECT_ID&environment=production" \
            -o env.json
          # Decrypt env.json with your passphrase using a small Node/Web Crypto script
          # and write the result to .env
      - name: Build
        run: |
          npm ci
          npm run build`}
                                    />
                                </TabsContent>
                                <TabsContent value="bash">
                                    <CodeBlock
                                        language="bash"
                                        code={`#!/usr/bin/env bash
set -euo pipefail

API_KEY="$ENVSTORE_API_KEY"
PROJECT_ID="00000000-0000-0000-0000-000000000000"
ENVIRONMENT="staging"

curl -s \
  -H "x-api-key: $API_KEY" \
  "https://envstore.fenilsonani.com/api/v1/env/latest?projectId=$PROJECT_ID&environment=$ENVIRONMENT" \
  -o env.json

# Decrypt env.json here using your passphrase and Web Crypto (Node 18+)
# node decrypt.mjs env.json > .env
echo "Wrote decrypted .env"`}
                                    />
                                </TabsContent>
                                <TabsContent value="curl">
                                    <CodeBlock
                                        language="bash"
                                        code={`curl -s \
  -H "x-api-key: $ENVSTORE_API_KEY" \
  "https://envstore.fenilsonani.com/api/v1/env/latest?projectId=PROJECT_ID&environment=production" | jq .`}
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </section>

                {/* Integrations */}
                <section className="mt-24 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Integrations
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Works with your favorite tools and platforms.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            Next.js
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            Vercel
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            Node.js
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            Python
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            Docker
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1">
                            GitHub Actions
                        </span>
                    </div>
                </section>

                {/* Open Source callout */}
                <section className="mt-24">
                    {/* FAQ */}
                    <Card className="mb-6">
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="size-5 text-primary" />
                                <CardTitle>
                                    Frequently asked questions
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Quick answers about how EnvStore works.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <details className="group py-4" open>
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
                                    <span>
                                        Do you ever store plaintext `.env`
                                        files?
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        No
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    No. Files are encrypted client‑side using
                                    AES‑256‑GCM before upload. We store only
                                    ciphertext, IV, salt, and checksum.
                                </p>
                            </details>
                            <details className="group py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
                                    <span>
                                        What happens if I lose my passphrase?
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Self‑custody
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    We cannot recover your data without the
                                    passphrase. Consider using a secure secret
                                    manager to store it for your team.
                                </p>
                            </details>
                            <details className="group py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
                                    <span>How are API keys secured?</span>
                                    <span className="text-xs text-muted-foreground">
                                        Hashed at rest
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    API keys are shown once on creation. We
                                    store only a SHA‑256 hash with a prefix.
                                    Verification compares the hash; raw keys are
                                    never stored.
                                </p>
                            </details>
                            <details className="group py-4">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
                                    <span>
                                        Is EnvStore suitable for production?
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Yes
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Yes. We use strong cryptography, JWT
                                    sessions, rate‑limited endpoints, and a
                                    typed API. Always review and fit your
                                    org&#39;s compliance needs.
                                </p>
                            </details>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center gap-2">
                                <Github className="size-5 text-primary" />
                                <CardTitle>Open source • MIT</CardTitle>
                            </div>
                            <CardDescription>
                                EnvStore is open source and built in public.
                                Star the repo and contribute features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap items-center gap-3 py-5">
                            <Button asChild className="px-5">
                                <a
                                    href="https://github.com/fenilsonani/envstore"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <Github className="size-4" /> Star on GitHub
                                </a>
                            </Button>
                            <Button variant="outline" asChild className="px-5">
                                <a
                                    href="https://fenilsonani.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <Heart className="size-4" /> Author: Fenil
                                    Sonani
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA */}
                <section className="mt-24 text-center">
                    <h3 className="text-2xl font-semibold">
                        Ready to secure your secrets?
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                        Create a project, upload your first encrypted `.env`,
                        and wire it into CI in minutes.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                        <Button asChild className="px-6">
                            <a href="/signup">Create free account</a>
                        </Button>
                        <Button variant="outline" asChild className="px-6">
                            <a href="/login">I already have an account</a>
                        </Button>
                    </div>
                    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Globe2 className="size-4" /> Works anywhere your app
                        runs — Node, Edge, containers, and CI.
                    </p>
                </section>
            </main>

            <footer className="mx-auto mt-24 w-full border-t">
                <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-center sm:text-left">
                            © {new Date().getFullYear()} EnvStore • MIT
                            Licensed • Built by {''}
                            <a
                                href="https://fenilsonani.com"
                                target="_blank"
                                rel="noreferrer"
                                className="underline-offset-4 hover:underline"
                            >
                                Fenil Sonani
                            </a>
                        </p>
                        <nav className="flex items-center gap-4">
                            <a
                                className="inline-flex items-center gap-2 hover:text-foreground"
                                href="https://github.com/fenilsonani/envstore"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                            >
                                <Github className="size-4" /> GitHub
                            </a>
                            <a
                                className="inline-flex items-center gap-2 hover:text-foreground"
                                href="/login"
                            >
                                Sign in
                            </a>
                            <a
                                className="inline-flex items-center gap-2 hover:text-foreground"
                                href="/signup"
                            >
                                Get started
                            </a>
                        </nav>
                    </div>
                </div>
            </footer>
        </ClientOnly>
    );
}
