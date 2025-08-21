'use client';
import React, { useMemo } from 'react';
import { trpc } from '../providers';
import ClientOnly from '@/components/ClientOnly';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    FolderOpen,
    Server,
    Key,
    Upload,
    Activity,
    TrendingUp,
    Clock,
    Shield,
} from 'lucide-react';

export default function DashboardOverview() {
    const projects = trpc.listProjects.useQuery();
    const apiKeys = trpc.listApiKeys.useQuery();
    const usage = trpc.getUsageStats.useQuery();

    // Get environment counts across all projects (currently unused but planned for future use)
    // const allEnvs = useMemo(() => {
    //   if (!projects.data) return [];
    //   return projects.data.map(project => ({
    //     projectId: project.id,
    //     projectName: project.name,
    //   }));
    // }, [projects.data]);

    const stats = useMemo(() => {
        const projectCount = projects.data?.length || 0;
        const apiKeyCount = apiKeys.data?.length || 0;
        const environments = usage.data?.environments || 0;
        return {
            projects: projectCount,
            apiKeys: apiKeyCount,
            environments,
            totalUploads: 0,
        };
    }, [projects.data, apiKeys.data, usage.data]);

    const recentActivity = useMemo(() => {
        const activities: Array<{
            type: string;
            title: string;
            time: Date;
            icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        }> = [];

        // Add recent projects
        if (projects.data) {
            projects.data.slice(0, 3).forEach((project) => {
                activities.push({
                    type: 'project_created',
                    title: `Created project "${project.name}"`,
                    time: new Date(project.createdAt),
                    icon: FolderOpen,
                });
            });
        }

        // Add recent API keys
        if (apiKeys.data) {
            apiKeys.data.slice(0, 2).forEach((key) => {
                activities.push({
                    type: 'api_key_created',
                    title: `Created API key "${key.name}"`,
                    time: new Date(key.createdAt),
                    icon: Key,
                });
            });
        }

        // Sort by time, most recent first
        return activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, 5);
    }, [projects.data, apiKeys.data]);

    const quickActions = [
        {
            title: 'Upload Environment',
            description: 'Upload a new .env file to your project',
            href: '/dashboard/environments',
            icon: Upload,
            color: 'bg-muted',
        },
        {
            title: 'Create Project',
            description: 'Start a new project to organize your environments',
            href: '/dashboard/projects',
            icon: FolderOpen,
            color: 'bg-muted',
        },
        {
            title: 'Generate API Key',
            description: 'Create an API key for programmatic access',
            href: '/dashboard/api-keys',
            icon: Key,
            color: 'bg-muted',
        },
        {
            title: 'View Environments',
            description: 'Browse and manage your stored environments',
            href: '/dashboard/environments',
            icon: Server,
            color: 'bg-muted',
        },
    ];

    return (
        <ClientOnly>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back! Here&apos;s an overview of your
                            EnvStore.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                    <div className="ml-4">
                                        {projects.isLoading ? (
                                            <>
                                                <Skeleton className="h-6 w-10" />
                                                <Skeleton className="mt-2 h-3 w-20" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">
                                                    {stats.projects}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Projects
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Server className="h-8 w-8 text-muted-foreground" />
                                    <div className="ml-4">
                                        {usage.isLoading ? (
                                            <>
                                                <Skeleton className="h-6 w-10" />
                                                <Skeleton className="mt-2 h-3 w-28" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">
                                                    {stats.environments}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Environments
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Key className="h-8 w-8 text-muted-foreground" />
                                    <div className="ml-4">
                                        {apiKeys.isLoading ? (
                                            <>
                                                <Skeleton className="h-6 w-10" />
                                                <Skeleton className="mt-2 h-3 w-24" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">
                                                    {stats.apiKeys}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    API Keys
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Shield className="h-8 w-8 text-muted-foreground" />
                                    <div className="ml-4">
                                        {projects.isLoading ||
                                        apiKeys.isLoading ||
                                        usage.isLoading ? (
                                            <>
                                                <Skeleton className="h-6 w-10" />
                                                <Skeleton className="mt-2 h-3 w-24" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-2xl font-bold">
                                                    {stats.totalUploads}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Total Uploads
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                        >
                                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div
                                                            className={`p-2 rounded-lg ${action.color}`}
                                                        >
                                                            <Icon className="h-4 w-4 text-foreground" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-sm">
                                                                {action.title}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {
                                                                    action.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {projects.isLoading || apiKeys.isLoading ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-muted rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-2/3" />
                                                <Skeleton className="h-3 w-1/3" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-muted rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/2" />
                                                <Skeleton className="h-3 w-1/4" />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-muted rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/5" />
                                                <Skeleton className="h-3 w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ) : recentActivity.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentActivity.map(
                                            (activity, index) => {
                                                const Icon = activity.icon;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex items-center space-x-3"
                                                    >
                                                        <div className="p-2 bg-muted rounded-lg">
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                {activity.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {activity.time.toLocaleDateString()}{' '}
                                                                at{' '}
                                                                {activity.time.toLocaleTimeString(
                                                                    [],
                                                                    {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">
                                            No recent activity
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Start by creating a project or
                                            uploading an environment
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Getting Started */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Getting Started</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                Create a Project
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Organize your environments by
                                                project
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                Upload Environment Files
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Securely store your .env files
                                                with encryption
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                Generate API Keys
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Access your environments
                                                programmatically
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Link href="/dashboard/projects">
                                            <Button className="w-full">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DashboardLayout>
        </ClientOnly>
    );
}
