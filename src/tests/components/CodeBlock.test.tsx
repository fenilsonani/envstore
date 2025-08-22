import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeBlock from '@/components/CodeBlock';
import '@testing-library/jest-dom';

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
    Prism: ({ children, language, ...props }: { children: React.ReactNode; language?: string; [key: string]: unknown }) => (
        <pre data-testid="syntax-highlighter" data-language={language} {...props}>
            <code>{children}</code>
        </pre>
    ),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
    oneDark: {
        'pre[class*="language-"]': {},
        'code[class*="language-"]': {},
    },
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
        
        // The language is used as a prop to SyntaxHighlighter
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
        // Language prop is mapped - 'javascript' input becomes 'typescript' due to default mapping
        expect(highlighter.getAttribute('data-language')).toBe('typescript');
    });

    it('should render the syntax highlighter', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
    });

    it('should handle different props correctly', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
        expect(screen.getByText('const hello = "world";')).toBeInTheDocument();
    });

    it('should apply custom styles', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        // Check that the highlighter is rendered with proper structure
        expect(highlighter).toBeInTheDocument();
        expect(highlighter.tagName.toLowerCase()).toBe('pre');
    });

    it('should render with custom className', () => {
        const { container } = render(
            <CodeBlock 
                {...defaultProps} 
                className="custom-class" 
            />
        );
        
        // Check that the wrapper div has the custom class
        const wrapperDiv = container.querySelector('.custom-class');
        expect(wrapperDiv).toBeInTheDocument();
    });

    it('should handle multiline code', () => {
        const multilineCode = `function test() {
    console.log("line 1");
    console.log("line 2");
}`;
        
        render(<CodeBlock code={multilineCode} language="javascript" />);
        
        // Check that the code block contains the multiline content
        const codeElement = screen.getByTestId('syntax-highlighter').querySelector('code');
        expect(codeElement?.textContent).toBe(multilineCode);
    });

    it('should support different languages', () => {
        const languages = ['typescript', 'javascript', 'bash', 'json'] as const;
        
        languages.forEach(lang => {
            const { unmount } = render(
                <CodeBlock code="test code" language={lang} />
            );
            
            const highlighter = screen.getByTestId('syntax-highlighter');
            expect(highlighter).toBeInTheDocument();
            unmount();
        });
    });

    it('should handle empty code gracefully', () => {
        render(<CodeBlock code="" language="javascript" />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
        const codeElement = highlighter.querySelector('code');
        expect(codeElement?.textContent).toBe('');
    });

    it('should handle special characters in code', () => {
        const specialCode = '<div>{"test": "value"}</div>';
        
        render(<CodeBlock code={specialCode} language="javascript" />);
        
        const codeElement = screen.getByTestId('syntax-highlighter').querySelector('code');
        expect(codeElement?.textContent).toBe(specialCode);
    });

    it('should be accessible with proper structure', () => {
        render(<CodeBlock {...defaultProps} />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter.tagName.toLowerCase()).toBe('pre');
    });

    it('should handle edge cases gracefully', () => {
        const longCode = 'a'.repeat(1000);
        render(<CodeBlock code={longCode} language="javascript" />);
        
        const highlighter = screen.getByTestId('syntax-highlighter');
        expect(highlighter).toBeInTheDocument();
    });
});