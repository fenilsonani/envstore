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
import { ShieldCheck, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LogoutPage() {
    return (
        <ClientOnly>
            <main className="mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
                <section className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent_70%)]">
                        <div className="mx-auto h-64 max-w-4xl bg-[radial-gradient(ellipse_at_center,oklch(0.828_0.189_84.429)/20%,transparent_60%)]" />
                    </div>
                    <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4" /> You are now signed
                        out
                    </p>
                    <h1 className="mx-auto max-w-3xl text-balance bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
                        See you next time
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
                        You’ve been securely logged out. Jump back in anytime —
                        your encrypted environment files will be here when you
                        need them.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <Button asChild className="px-6">
                            <Link href="/login">
                                <LogOut className="mr-2 size-4" /> Sign in again
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="px-6">
                            <Link href="/">Go to home</Link>
                        </Button>
                        <Button variant="secondary" asChild className="px-6">
                            <Link href="/signup">Create an account</Link>
                        </Button>
                    </div>
                </section>

                <section className="mt-16">
                    <Card className="mx-auto max-w-2xl">
                        <CardHeader>
                            <CardTitle>What’s EnvStore?</CardTitle>
                            <CardDescription>
                                Secure, end‑to‑end encrypted storage and
                                versioning for your environment files.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-sm">
                            <p>
                                Upload, encrypt, and retrieve `.env` files per
                                project and environment. Keep secrets out of
                                repos and share them safely across teams and CI.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </main>
        </ClientOnly>
    );
}
