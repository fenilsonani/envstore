'use client';
import ClientOnly from '@/components/ClientOnly';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Settings,
    User,
    Shield,
    Download,
    Trash2,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { trpc } from '@/app/providers';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
    const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
    const [deleteDataOpen, setDeleteDataOpen] = useState(false);
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

    const { data: userProfile, isLoading: userLoading } =
        trpc.getUserProfile.useQuery();
    const { data: usageStats, isLoading: statsLoading } =
        trpc.getUsageStats.useQuery();

    const changePasswordMutation = trpc.changePassword.useMutation({
        onSuccess: () => {
            setPasswordChangeOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            alert('Password changed successfully!');
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const deleteAllDataMutation = trpc.deleteAllUserData.useMutation({
        onSuccess: () => {
            setDeleteDataOpen(false);
            setDeletePassword('');
            alert('All data deleted successfully!');
            window.location.reload();
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const deleteAccountMutation = trpc.deleteAccount.useMutation({
        onSuccess: () => {
            alert('Account deleted successfully!');
            router.push('/login');
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long!');
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

    const handleDeleteAllData = () => {
        deleteAllDataMutation.mutate({ confirmPassword: deletePassword });
    };

    const handleDeleteAccount = () => {
        deleteAccountMutation.mutate({
            confirmPassword: deleteAccountPassword,
        });
    };

    const isLoading = userLoading || statsLoading;

    return (
        <ClientOnly>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Settings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Account Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="h-5 w-5 mr-2" />
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email Address
                                            </Label>
                                            {isLoading ? (
                                                <Skeleton className="h-9 w-full max-w-sm" />
                                            ) : (
                                                <Input
                                                    id="email"
                                                    value={
                                                        userProfile?.email || ''
                                                    }
                                                    readOnly
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account Status</Label>
                                            {isLoading ? (
                                                <Skeleton className="h-6 w-20" />
                                            ) : (
                                                <div>
                                                    <Badge variant="secondary">
                                                        Active
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Member Since</Label>
                                        {isLoading ? (
                                            <Skeleton className="h-4 w-40" />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {userProfile?.createdAt
                                                    ? new Date(
                                                          userProfile.createdAt
                                                      ).toLocaleDateString(
                                                          'en-US',
                                                          {
                                                              year: 'numeric',
                                                              month: 'long',
                                                              day: 'numeric',
                                                          }
                                                      )
                                                    : ''}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="h-5 w-5 mr-2" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                Password
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Change your password to keep
                                                your account secure
                                            </p>
                                            <Dialog
                                                open={passwordChangeOpen}
                                                onOpenChange={
                                                    setPasswordChangeOpen
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button variant="outline">
                                                        Change Password
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Change Password
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Enter your current
                                                            password and choose
                                                            a new one.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="current-password">
                                                                Current Password
                                                            </Label>
                                                            <Input
                                                                id="current-password"
                                                                type="password"
                                                                value={
                                                                    currentPassword
                                                                }
                                                                onChange={(e) =>
                                                                    setCurrentPassword(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new-password">
                                                                New Password
                                                            </Label>
                                                            <Input
                                                                id="new-password"
                                                                type="password"
                                                                value={
                                                                    newPassword
                                                                }
                                                                onChange={(e) =>
                                                                    setNewPassword(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="confirm-password">
                                                                Confirm New
                                                                Password
                                                            </Label>
                                                            <Input
                                                                id="confirm-password"
                                                                type="password"
                                                                value={
                                                                    confirmPassword
                                                                }
                                                                onChange={(e) =>
                                                                    setConfirmPassword(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                setPasswordChangeOpen(
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                changePasswordMutation.isPending
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={
                                                                handlePasswordChange
                                                            }
                                                            disabled={
                                                                changePasswordMutation.isPending
                                                            }
                                                        >
                                                            {changePasswordMutation.isPending && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Change Password
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-medium mb-2">
                                                Two-Factor Authentication
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Add an extra layer of security
                                                to your account
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className="mb-3"
                                            >
                                                Not Enabled
                                            </Badge>
                                            <div>
                                                <Button
                                                    variant="outline"
                                                    disabled
                                                >
                                                    Enable 2FA (Coming Soon)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preferences */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Settings className="h-5 w-5 mr-2" />
                                        Preferences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">
                                                Default Environment
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Set the default environment name
                                                for new uploads
                                            </p>
                                            <Input
                                                placeholder="development"
                                                className="max-w-xs"
                                            />
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-medium mb-2">
                                                Auto-detect Environment
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Automatically detect environment
                                                from filename and content
                                            </p>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="rounded"
                                                />
                                                <span className="text-sm">
                                                    Enable auto-detection
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Data Export */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base">
                                        <Download className="h-4 w-4 mr-2" />
                                        Data Export
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Export your account data and environment
                                        metadata
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Usage Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Usage Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        {isLoading ? (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-4 w-10" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-4 w-36" />
                                                    <Skeleton className="h-4 w-10" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-4 w-10" />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-4 w-16" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Projects
                                                    </span>
                                                    <span className="font-medium">
                                                        {usageStats?.projects ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Environments
                                                    </span>
                                                    <span className="font-medium">
                                                        {usageStats?.environments ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        API Keys
                                                    </span>
                                                    <span className="font-medium">
                                                        {usageStats?.apiKeys ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Storage Used
                                                    </span>
                                                    <span className="font-medium">
                                                        {usageStats?.storageUsed ||
                                                            0}{' '}
                                                        MB
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-base text-destructive">
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-medium text-sm">
                                                Delete All Data
                                            </h4>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Permanently delete all your
                                                projects, environments, and API
                                                keys
                                            </p>
                                            <Dialog
                                                open={deleteDataOpen}
                                                onOpenChange={setDeleteDataOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete All Data
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Delete All Data
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            This will
                                                            permanently delete
                                                            all your projects,
                                                            environments, and
                                                            API keys. This
                                                            action cannot be
                                                            undone.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="delete-password">
                                                                Confirm with
                                                                your password
                                                            </Label>
                                                            <Input
                                                                id="delete-password"
                                                                type="password"
                                                                value={
                                                                    deletePassword
                                                                }
                                                                onChange={(e) =>
                                                                    setDeletePassword(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter your password"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                setDeleteDataOpen(
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                deleteAllDataMutation.isPending
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={
                                                                handleDeleteAllData
                                                            }
                                                            disabled={
                                                                deleteAllDataMutation.isPending
                                                            }
                                                        >
                                                            {deleteAllDataMutation.isPending && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Delete All Data
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h4 className="font-medium text-sm">
                                                Delete Account
                                            </h4>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                Permanently delete your account
                                                and all associated data
                                            </p>
                                            <Dialog
                                                open={deleteAccountOpen}
                                                onOpenChange={
                                                    setDeleteAccountOpen
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Account
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Delete Account
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            This will
                                                            permanently delete
                                                            your account and all
                                                            associated data.
                                                            This action cannot
                                                            be undone and you
                                                            will be logged out.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="delete-account-password">
                                                                Confirm with
                                                                your password
                                                            </Label>
                                                            <Input
                                                                id="delete-account-password"
                                                                type="password"
                                                                value={
                                                                    deleteAccountPassword
                                                                }
                                                                onChange={(e) =>
                                                                    setDeleteAccountPassword(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Enter your password"
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                setDeleteAccountOpen(
                                                                    false
                                                                )
                                                            }
                                                            disabled={
                                                                deleteAccountMutation.isPending
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            onClick={
                                                                handleDeleteAccount
                                                            }
                                                            disabled={
                                                                deleteAccountMutation.isPending
                                                            }
                                                        >
                                                            {deleteAccountMutation.isPending && (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            )}
                                                            Delete Account
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ClientOnly>
    );
}
