'use client';
import { useState, useCallback, useMemo, memo } from 'react';
import { trpc } from '../../providers';
import ClientOnly from '@/components/ClientOnly';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import { FolderOpen, Plus, Server, Calendar, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const projects = trpc.listProjectsWithStats.useQuery();
    const createProject = trpc.createProject.useMutation({
        onSuccess: () => {
            projects.refetch();
            setProjectName('');
            setIsCreating(false);
        },
    });
    const renameProject = trpc.renameProject.useMutation({
        onSuccess: () => projects.refetch(),
    });
    const deleteProject = trpc.deleteProject.useMutation({
        onSuccess: () => projects.refetch(),
    });

    const handleCreateProject = useCallback(async () => {
        if (!projectName.trim()) return;
        await createProject.mutateAsync({ name: projectName.trim() });
    }, [projectName, createProject]);

    const handleSetIsCreating = useCallback((value: boolean) => {
        setIsCreating(value);
    }, []);

    const handleCancelCreate = useCallback(() => {
        setIsCreating(false);
        setProjectName('');
    }, []);

    const handleRenameProject = useCallback((id: string, name: string) => {
        renameProject.mutate({ id, name });
    }, [renameProject]);

    const handleDeleteProject = useCallback((id: string) => {
        deleteProject.mutate({ id });
    }, [deleteProject]);

    const handleProjectNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setProjectName(e.target.value);
    }, []);

    const handleProjectNameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateProject();
        }
    }, [handleCreateProject]);

    const projectList = useMemo(() => {
        if (!projects.data) return [];
        return projects.data.map((project) => ({
            ...project,
            createdAt: new Date(project.createdAt),
        }));
    }, [projects.data]);

    return (
        <ClientOnly>
            <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Projects
                            </h1>
                            <p className="text-muted-foreground">
                                Organize your environment files by project
                            </p>
                        </div>
                        <Button onClick={() => handleSetIsCreating(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>

                    {/* Create Project Card */}
                    {isCreating && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Project</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="project-name">
                                        Project Name
                                    </Label>
                                    <Input
                                        id="project-name"
                                        placeholder="Enter project name"
                                        value={projectName}
                                        onChange={handleProjectNameChange}
                                        onKeyDown={handleProjectNameKeyDown}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCreateProject}
                                        disabled={
                                            createProject.isPending ||
                                            !projectName.trim()
                                        }
                                    >
                                        {createProject.isPending
                                            ? 'Creating...'
                                            : 'Create Project'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelCreate}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Projects Grid */}
                    {projects.isLoading ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="h-44 rounded-xl bg-muted animate-pulse" />
                                    <div className="h-44 rounded-xl bg-muted animate-pulse" />
                                    <div className="h-44 rounded-xl bg-muted animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    ) : projectList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projectList.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onRename={handleRenameProject}
                                    onDelete={handleDeleteProject}
                                    isDeleting={deleteProject.isPending}
                                    isRenaming={renameProject.isPending}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    No projects yet
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Create your first project to start
                                    organizing your environment files
                                </p>
                                <Button onClick={() => handleSetIsCreating(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Project
                                </Button>
                            </CardContent>
                        </Card>
                    )}
            </div>
        </ClientOnly>
    );
}

const ProjectCard = memo(function ProjectCard({
    project,
    onRename,
    onDelete,
    isDeleting,
    isRenaming,
}: {
    project: { id: string; name: string; createdAt: Date } & {
        environmentsCount?: number;
        lastActivity?: number | null;
    };
    onRename: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
    isRenaming: boolean;
}) {
    const environmentCount = project.environmentsCount ?? 0;
    const lastActivity = project.lastActivity
        ? new Date(project.lastActivity)
        : project.createdAt;
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [newName, setNewName] = useState(project.name);

    const handleRenameClick = useCallback(() => {
        setNewName(project.name);
        setRenameOpen(true);
    }, [project.name]);

    const handleDeleteClick = useCallback(() => {
        setDeleteOpen(true);
    }, []);

    const handleRenameSubmit = useCallback(() => {
        const n = newName.trim();
        if (n) {
            onRename(project.id, n);
            setRenameOpen(false);
        }
    }, [newName, onRename, project.id]);

    const handleRenameCancel = useCallback(() => {
        setRenameOpen(false);
    }, []);

    const handleDeleteSubmit = useCallback(() => {
        onDelete(project.id);
        setDeleteOpen(false);
    }, [onDelete, project.id]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteOpen(false);
    }, []);

    const handleNewNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    }, []);

    const handleRenameOpenChange = useCallback((o: boolean) => {
        setRenameOpen(o);
        if (!o) setNewName(project.name);
    }, [project.name]);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                {project.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Created{' '}
                                {new Date(
                                    project.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRenameClick}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={isDeleting}
                            onClick={handleDeleteClick}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Sheet
                            open={renameOpen}
                            onOpenChange={handleRenameOpenChange}
                        >
                            <SheetContent
                                side="right"
                                className="w-full sm:max-w-sm"
                            >
                                <SheetHeader>
                                    <SheetTitle>Rename Project</SheetTitle>
                                    <SheetDescription>
                                        Update the project name. This won&apos;t
                                        affect environments.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="p-4 pt-2 space-y-2">
                                    <Label htmlFor={`rename-${project.id}`}>
                                        Project Name
                                    </Label>
                                    <Input
                                        id={`rename-${project.id}`}
                                        value={newName}
                                        onChange={handleNewNameChange}
                                    />
                                </div>
                                <SheetFooter className="p-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleRenameCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleRenameSubmit}
                                        disabled={isRenaming || !newName.trim()}
                                    >
                                        Save
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                        <Sheet open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <SheetContent
                                side="right"
                                className="w-full sm:max-w-sm"
                            >
                                <SheetHeader>
                                    <SheetTitle>Delete Project</SheetTitle>
                                    <SheetDescription>
                                        This will permanently delete the project
                                        and all its environments. This action
                                        cannot be undone.
                                    </SheetDescription>
                                </SheetHeader>
                                <SheetFooter className="p-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteCancel}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteSubmit}
                                        disabled={isDeleting}
                                    >
                                        Delete
                                    </Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{environmentCount}</p>
                        <p className="text-xs text-muted-foreground">
                            Environments
                        </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-center mb-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium">Last Activity</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(lastActivity).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <Link
                    href={`/dashboard/environments?project=${project.id}`}
                    className="w-full"
                >
                    <Button variant="outline" size="sm" className="w-full">
                        <Server className="h-4 w-4 mr-2" />
                        View Environments
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
});