import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeBlock from '@/components/CodeBlock';
import '@testing-library/jest-dom';

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
    Prism: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <pre data-testid="syntax-highlighter" {...props}>
            <code>{children}</code>
        </pre>
    ),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
    tomorrow: {},
    vscDarkPlus: {},
}));

describe('CodeBlock Component', () => {
    const defaultProps = {
        code: 'const hello = "world";',
        language: 'javascript' as const,
    };

    it('should render code content', () => {
        render(<CodeBlock {...defaultProps} />);
        
        expect(screen.getByText('const hello = "world";')).toBeInTheDocument();
    });

    it('should display the correct language', () => {
        render(<CodeBlock {...defaultProps} />);
        
        expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('should have a copy button', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy/i });
        expect(copyButton).toBeInTheDocument();
    });

    it('should copy code to clipboard when copy button is clicked', async () => {
        const mockWriteText = vi.fn();
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        render(<CodeBlock {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);
        
        expect(mockWriteText).toHaveBeenCalledWith('const hello = "world";');
    });

    it('should show copied feedback after copying', async () => {
        const mockWriteText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        render(<CodeBlock {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);
        
        await waitFor(() => {
            expect(screen.getByText(/copied/i)).toBeInTheDocument();
        });
    });

    it('should render with custom className', () => {
        render(
            <CodeBlock 
                {...defaultProps} 
                className="custom-class" 
            />
        );
        
        const container = screen.getByTestId('syntax-highlighter').parentElement;
        expect(container).toHaveClass('custom-class');
    });

    it('should handle multiline code', () => {
        const multilineCode = `function test() {
    console.log("line 1");
    console.log("line 2");
}`;
        
        render(<CodeBlock code={multilineCode} language="javascript" />);
        
        expect(screen.getByText(multilineCode)).toBeInTheDocument();
    });

    it('should support different languages', () => {
        const languages = ['typescript', 'javascript', 'bash', 'json'] as const;
        
        languages.forEach(lang => {
            const { unmount } = render(
                <CodeBlock code="test code" language={lang} />
            );
            
            expect(screen.getByText(lang)).toBeInTheDocument();
            unmount();
        });
    });

    it('should handle empty code gracefully', () => {
        render(<CodeBlock code="" language="javascript" />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
    });

    it('should handle special characters in code', () => {
        const specialCode = '<div>{"test": "value"}</div>';
        
        render(<CodeBlock code={specialCode} language="javascript" />);
        
        expect(screen.getByText(specialCode)).toBeInTheDocument();
    });

    it('should be accessible with proper ARIA attributes', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy/i });
        expect(copyButton).toHaveAttribute('aria-label');
    });

    it('should handle copy failure gracefully', async () => {
        const mockWriteText = vi.fn().mockRejectedValue(new Error('Copy failed'));
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText,
            },
        });

        render(<CodeBlock {...defaultProps} />);
        
        const copyButton = screen.getByRole('button', { name: /copy/i });
        fireEvent.click(copyButton);
        
        // Should not crash
        expect(copyButton).toBeInTheDocument();
    });
});