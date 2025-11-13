'use client';
import { useState, useCallback } from 'react';
import { trpc } from '../../providers';
import ClientOnly from '@/components/ClientOnly';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users,
    Plus,
    Mail,
    Shield,
    Crown,
    UserCheck,
    Eye,
    Trash2,
    X,
    Building2,
    UserPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const roleIcons = {
    owner: Crown,
    admin: Shield,
    member: UserCheck,
    viewer: Eye,
};

const roleColors = {
    owner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    member: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export default function TeamPage() {
    const [createOrgOpen, setCreateOrgOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [orgName, setOrgName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<{ id: string; email: string } | null>(null);

    const organizations = trpc.listOrganizations.useQuery();
    const createOrganization = trpc.createOrganization.useMutation({
        onSuccess: () => {
            organizations.refetch();
            setCreateOrgOpen(false);
            setOrgName('');
        },
    });

    const selectedOrg = selectedOrgId
        ? organizations.data?.find((o) => o.id === selectedOrgId)
        : organizations.data?.[0];

    const members = trpc.listOrganizationMembers.useQuery(
        { organizationId: selectedOrg?.id || '' },
        { enabled: !!selectedOrg?.id }
    );

    const invitations = trpc.listInvitations.useQuery(
        { organizationId: selectedOrg?.id || '' },
        { enabled: !!selectedOrg?.id && (selectedOrg.role === 'owner' || selectedOrg.role === 'admin') }
    );

    const inviteMember = trpc.inviteMember.useMutation({
        onSuccess: () => {
            invitations.refetch();
            setInviteOpen(false);
            setInviteEmail('');
            setInviteRole('member');
        },
    });

    const removeMember = trpc.removeMember.useMutation({
        onSuccess: () => {
            members.refetch();
            setMemberToRemove(null);
        },
    });

    const revokeInvitation = trpc.revokeInvitation.useMutation({
        onSuccess: () => {
            invitations.refetch();
        },
    });

    const handleCreateOrg = useCallback(async () => {
        if (!orgName.trim()) return;
        await createOrganization.mutateAsync({ name: orgName.trim() });
    }, [orgName, createOrganization]);

    const handleInviteMember = useCallback(async () => {
        if (!inviteEmail.trim() || !selectedOrg) return;
        await inviteMember.mutateAsync({
            organizationId: selectedOrg.id,
            email: inviteEmail.trim(),
            role: inviteRole,
        });
    }, [inviteEmail, inviteRole, selectedOrg, inviteMember]);

    const handleRemoveMember = useCallback(async () => {
        if (!memberToRemove) return;
        await removeMember.mutateAsync({ memberId: memberToRemove.id });
    }, [memberToRemove, removeMember]);

    const canManageMembers = selectedOrg && (selectedOrg.role === 'owner' || selectedOrg.role === 'admin');

    return (
        <ClientOnly>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                        <p className="text-muted-foreground">
                            Manage your organizations and team members
                        </p>
                    </div>
                    <Button onClick={() => setCreateOrgOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Organization
                    </Button>
                </div>

                {/* Organization Selector */}
                {organizations.data && organizations.data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Organization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {organizations.data.map((org) => (
                                    <Button
                                        key={org.id}
                                        variant={selectedOrg?.id === org.id ? 'default' : 'outline'}
                                        onClick={() => setSelectedOrgId(org.id)}
                                        className="gap-2"
                                    >
                                        <Building2 className="h-4 w-4" />
                                        {org.name}
                                        {org.isPersonal && (
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                Personal
                                            </Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {selectedOrg && (
                    <>
                        {/* Team Members */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>
                                            People with access to {selectedOrg.name}
                                        </CardDescription>
                                    </div>
                                    {canManageMembers && (
                                        <Button size="sm" onClick={() => setInviteOpen(true)}>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Invite Member
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {members.isLoading ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Loading members...
                                    </div>
                                ) : members.data && members.data.length > 0 ? (
                                    <div className="space-y-3">
                                        {members.data.map((member) => {
                                            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex items-center justify-between p-3 border rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{member.email}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={roleColors[member.role as keyof typeof roleColors]}
                                                        >
                                                            <RoleIcon className="h-3 w-3 mr-1" />
                                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                        </Badge>
                                                        {canManageMembers &&
                                                            member.role !== 'owner' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        setMemberToRemove({
                                                                            id: member.id,
                                                                            email: member.email,
                                                                        })
                                                                    }
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No team members yet
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Invitations */}
                        {canManageMembers && invitations.data && invitations.data.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Invitations</CardTitle>
                                    <CardDescription>
                                        Invitations waiting to be accepted
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {invitations.data.map((invitation) => (
                                            <div
                                                key={invitation.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{invitation.email}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Invited {new Date(invitation.createdAt).toLocaleDateString()} •
                                                            Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            revokeInvitation.mutate({ id: invitation.id })
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {organizations.data && organizations.data.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first organization to start collaborating
                            </p>
                            <Button onClick={() => setCreateOrgOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Organization
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Create Organization Dialog */}
                <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                            <DialogDescription>
                                Create a new organization to collaborate with your team
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="org-name">Organization Name</Label>
                                <Input
                                    id="org-name"
                                    placeholder="My Company"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateOrg()}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCreateOrgOpen(false);
                                    setOrgName('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateOrg}
                                disabled={!orgName.trim() || createOrganization.isPending}
                            >
                                {createOrganization.isPending ? 'Creating...' : 'Create Organization'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Invite Member Dialog */}
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                            <DialogDescription>
                                Send an invitation to join {selectedOrg?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Email Address</Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invite-role">Role</Label>
                                <Select
                                    value={inviteRole}
                                    onValueChange={(value) =>
                                        setInviteRole(value as 'admin' | 'member' | 'viewer')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin - Can manage members</SelectItem>
                                        <SelectItem value="member">Member - Can edit projects</SelectItem>
                                        <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setInviteOpen(false);
                                    setInviteEmail('');
                                    setInviteRole('member');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleInviteMember}
                                disabled={!inviteEmail.trim() || inviteMember.isPending}
                            >
                                {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Remove Member Confirmation */}
                <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Team Member</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove {memberToRemove?.email} from this organization?
                                They will lose access to all projects and environments.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRemoveMember}
                                variant="destructive"
                                disabled={removeMember.isPending}
                            >
                                {removeMember.isPending ? 'Removing...' : 'Remove Member'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ClientOnly>
    );
}
