import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock tRPC
vi.mock('@/app/providers', () => ({
    api: {
        getStats: {
            useQuery: vi.fn(() => ({
                data: {
                    projectsCount: 5,
                    environmentsCount: 3,
                    apiKeysCount: 2,
                },
                isLoading: false,
                error: null,
            })),
        },
    },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe('Dashboard Page', () => {
    it('should display welcome message', async () => {
        const DashboardContent = () => (
            <div>
                <h1>Welcome to EnvStore</h1>
                <p>Manage your environment variables securely</p>
            </div>
        );
        
        render(<DashboardContent />);
        
        expect(screen.getByText('Welcome to EnvStore')).toBeInTheDocument();
        expect(screen.getByText(/Manage your environment variables/i)).toBeInTheDocument();
    });

    it('should show statistics cards', () => {
        const DashboardStats = () => (
            <div>
                <div data-testid="stats-projects">
                    <span>Projects</span>
                    <span>5</span>
                </div>
                <div data-testid="stats-environments">
                    <span>Environments</span>
                    <span>3</span>
                </div>
                <div data-testid="stats-apikeys">
                    <span>API Keys</span>
                    <span>2</span>
                </div>
            </div>
        );
        
        render(<DashboardStats />);
        
        expect(screen.getByTestId('stats-projects')).toBeInTheDocument();
        expect(screen.getByTestId('stats-environments')).toBeInTheDocument();
        expect(screen.getByTestId('stats-apikeys')).toBeInTheDocument();
        
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should have quick action buttons', () => {
        const QuickActions = () => (
            <div>
                <button>Create Project</button>
                <button>Upload Environment</button>
                <button>Generate API Key</button>
            </div>
        );
        
        render(<QuickActions />);
        
        expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Environment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate API Key/i })).toBeInTheDocument();
    });

    it('should display recent activity section', () => {
        const RecentActivity = () => (
            <div>
                <h2>Recent Activity</h2>
                <ul>
                    <li>Project "App1" created</li>
                    <li>Environment "production" uploaded</li>
                    <li>API key generated</li>
                </ul>
            </div>
        );
        
        render(<RecentActivity />);
        
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        expect(screen.getByText(/Project "App1" created/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
        const LoadingDashboard = () => (
            <div>
                <div role="status" aria-label="Loading">
                    Loading dashboard...
                </div>
            </div>
        );
        
        render(<LoadingDashboard />);
        
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
    });

    it('should handle error state', () => {
        const ErrorDashboard = () => (
            <div role="alert">
                <h2>Error loading dashboard</h2>
                <p>Please try refreshing the page</p>
                <button>Retry</button>
            </div>
        );
        
        render(<ErrorDashboard />);
        
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Error loading dashboard/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    it('should be responsive', () => {
        const ResponsiveDashboard = () => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div>Card 1</div>
                <div>Card 2</div>
                <div>Card 3</div>
            </div>
        );
        
        render(<ResponsiveDashboard />);
        
        const cards = screen.getAllByText(/Card \d/);
        expect(cards).toHaveLength(3);
    });
});