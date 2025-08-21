'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashboardLayout = dynamic(() => import('@/components/DashboardLayout'), {
    loading: () => (
        <div className="flex h-screen w-full">
            <div className="w-64 bg-muted/20 animate-pulse" />
            <div className="flex-1 p-8">
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="h-8 bg-muted animate-pulse rounded mb-4" />
                        <div className="h-32 bg-muted animate-pulse rounded" />
                    </CardContent>
                </Card>
            </div>
        </div>
    ),
});

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen w-full">
                    <div className="w-64 bg-muted/20 animate-pulse" />
                    <div className="flex-1 p-8">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="h-8 bg-muted animate-pulse rounded mb-4" />
                                <div className="h-32 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            }
        >
            <DashboardLayout>{children}</DashboardLayout>
        </Suspense>
    );
}