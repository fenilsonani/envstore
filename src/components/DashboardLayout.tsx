'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, FolderOpen, Server, Key, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navigationItems = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Environments', href: '/dashboard/environments', icon: Server },
    { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <Sidebar variant="inset">
                <SidebarHeader>
                    <div className="flex items-center space-x-2 px-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">
                                E
                            </span>
                        </div>
                        <span className="text-xl font-bold">EnvStore</span>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        pathname === item.href ||
                                        (item.href !== '/dashboard' &&
                                            pathname.startsWith(item.href));

                                    return (
                                        <SidebarMenuItem key={item.name}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                            >
                                                <Link href={item.href}>
                                                    <Icon />
                                                    <span>{item.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <form
                                action="/api/auth/logout"
                                method="post"
                                className="w-full"
                            >
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-destructive hover:text-destructive"
                                    type="submit"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </form>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
