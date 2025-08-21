'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type SupportedLanguage = 'typescript' | 'javascript' | 'bash' | 'json';

export interface CodeBlockProps {
    code: string;
    language?: SupportedLanguage;
    className?: string;
}

// Map our simplified language names to react-syntax-highlighter language identifiers
function mapLanguage(lang: string): SupportedLanguage {
    switch (lang) {
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'curl':
        case 'sh':
            return 'bash';
        case 'json':
            return 'json';
        default:
            return 'typescript';
    }
}

export default function CodeBlock({
    code,
    language = 'typescript',
    className,
}: CodeBlockProps) {
    const mappedLanguage = mapLanguage(language);

    // Custom style that matches the app's theme
    const customStyle = {
        ...oneDark,
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            background: 'hsl(var(--muted))',
            margin: 0,
            padding: '1rem',
            fontSize: '0.75rem',
            lineHeight: '1.6',
            fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        },
        'code[class*="language-"]': {
            ...oneDark['code[class*="language-"]'],
            background: 'transparent',
            color: 'hsl(var(--foreground))',
            fontSize: '0.75rem',
            lineHeight: '1.6',
        },
        comment: { color: 'hsl(var(--muted-foreground))' },
        string: { color: '#10b981' }, // emerald-500
        number: { color: '#f59e0b' }, // amber-500
        boolean: { color: '#a855f7' }, // purple-500
        keyword: { color: '#0ea5e9', fontWeight: '500' }, // sky-500
        function: { color: '#06b6d4' }, // cyan-500
        operator: { color: 'hsl(var(--foreground))' },
        punctuation: { color: 'hsl(var(--muted-foreground))' },
    };

    return (
        <div
            className={`relative mt-3 w-full max-w-full overflow-hidden rounded-lg border ${className ?? ''}`}
        >
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={mappedLanguage}
                    style={customStyle}
                    customStyle={{
                        margin: 0,
                        background: 'hsl(var(--muted))',
                        fontSize: '0.75rem',
                        lineHeight: '1.6',
                    }}
                    wrapLongLines={false}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
