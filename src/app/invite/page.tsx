'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { trpc } from '../providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvitePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [errorMessage, setErrorMessage] = useState('');

    const acceptInvitation = trpc.acceptInvitation.useMutation({
        onSuccess: () => {
            setStatus('success');
            setTimeout(() => {
                router.push('/dashboard/team');
            }, 3000);
        },
        onError: (error) => {
            setStatus('error');
            setErrorMessage(error.message || 'Failed to accept invitation');
        },
    });

    useEffect(() => {
        if (token && status === 'pending') {
            acceptInvitation.mutate({ token });
        }
    }, [token, status, acceptInvitation]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="h-6 w-6 text-destructive" />
                            Invalid Invitation
                        </CardTitle>
                        <CardDescription>
                            This invitation link is invalid or incomplete.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/">Go to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                {status === 'pending' && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Accepting Invitation
                            </CardTitle>
                            <CardDescription>
                                Please wait while we process your invitation...
                            </CardDescription>
                        </CardHeader>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-6 w-6" />
                                Invitation Accepted!
                            </CardTitle>
                            <CardDescription>
                                You&apos;ve successfully joined the organization. Redirecting to your team page...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dashboard/team">Go to Team</Link>
                            </Button>
                        </CardContent>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <XCircle className="h-6 w-6" />
                                Failed to Accept Invitation
                            </CardTitle>
                            <CardDescription>{errorMessage}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                This could happen if:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>The invitation has expired</li>
                                <li>The invitation has already been used</li>
                                <li>You&apos;re not logged in with the invited email</li>
                            </ul>
                            <div className="flex gap-2 pt-4">
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild className="flex-1">
                                    <Link href="/">Go to Home</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
