'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const isValid = useMemo(
        () => email.includes('@') && password.length >= 8,
        [email, password]
    );

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        setLoading(true);
        setError(null);
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        setLoading(false);
        if (!res.ok) {
            setError('Could not sign up with those details');
            return;
        }
        router.replace('/dashboard');
    };

    return (
        <ClientOnly>
            <main className="mx-auto max-w-6xl px-6 py-20 md:py-28">
                <section className="relative text-center mb-10">
                    <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent_70%)]">
                        <div className="mx-auto h-56 max-w-4xl bg-[radial-gradient(ellipse_at_center,oklch(0.828_0.189_84.429)/20%,transparent_60%)]" />
                    </div>
                    <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        <ShieldCheck className="size-4" /> Create your account
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Get started with EnvStore
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Encrypt, version, and manage your environment files
                        securely.
                    </p>
                </section>

                <div className="grid place-items-center">
                    <Card className="w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Create account</CardTitle>
                            <CardDescription>
                                It’s free — you can upgrade anytime.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={onSubmit}>
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="password">
                                        Password (min 8)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            minLength={8}
                                            required
                                        />
                                        <button
                                            type="button"
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                            className="absolute inset-y-0 right-2 my-auto rounded-sm p-1 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                        >
                                            {showPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    className="w-full"
                                    disabled={loading || !isValid}
                                >
                                    {loading ? (
                                        'Creating...'
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            <UserPlus className="size-4" />{' '}
                                            Create account
                                        </span>
                                    )}
                                </Button>
                                {error ? (
                                    <p className="text-destructive text-sm">
                                        {error}
                                    </p>
                                ) : null}
                                <p className="text-sm text-muted-foreground">
                                    Have an account?{' '}
                                    <Link className="underline" href="/login">
                                        Sign in
                                    </Link>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    <Link
                                        className="underline underline-offset-4"
                                        href="/"
                                    >
                                        Back to home
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </ClientOnly>
    );
}
