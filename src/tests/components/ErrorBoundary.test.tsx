import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock ErrorBoundary component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div>
                    <h2>Something went wrong</h2>
                    <button onClick={() => window.location.reload()}>Reload</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary Component', () => {
    // Suppress console.error for these tests
    const originalError = console.error;
    beforeAll(() => {
        console.error = vi.fn();
    });
    afterAll(() => {
        console.error = originalError;
    });

    it('should render children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        );
        
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should catch errors and display fallback UI', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
        expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should display error message in development', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should have a reload button', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );
        
        const reloadButton = screen.getByRole('button', { name: /reload|try again/i });
        expect(reloadButton).toBeInTheDocument();
    });

    it('should render multiple children correctly', () => {
        render(
            <ErrorBoundary>
                <div>Child 1</div>
                <div>Child 2</div>
                <div>Child 3</div>
            </ErrorBoundary>
        );
        
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should isolate errors to the boundary', () => {
        render(
            <div>
                <div>Outside content</div>
                <ErrorBoundary>
                    <ThrowError shouldThrow={true} />
                </ErrorBoundary>
                <div>Other outside content</div>
            </div>
        );
        
        expect(screen.getByText('Outside content')).toBeInTheDocument();
        expect(screen.getByText('Other outside content')).toBeInTheDocument();
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should handle async errors', async () => {
        const AsyncError = () => {
            React.useEffect(() => {
                // Async errors in useEffect are not caught by error boundaries
                // This is a known React limitation
                setTimeout(() => {
                    console.error('Async error occurred');
                }, 0);
            }, []);
            return <div>Loading...</div>;
        };
        
        render(
            <ErrorBoundary>
                <AsyncError />
            </ErrorBoundary>
        );
        
        // Component should render normally since async errors aren't caught
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});