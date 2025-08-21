import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const appSans = Inter({
    variable: '--font-app-sans',
    subsets: ['latin'],
    display: 'swap',
});

const appMono = JetBrains_Mono({
    variable: '--font-app-mono',
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'EnvStore — Secure encrypted .env management',
        template: '%s • EnvStore',
    },
    description:
        'Upload, encrypt, version, and retrieve .env files with client-side encryption. Secrets stay in your control.',
    metadataBase: new URL('https://envstore.fenilsonani.com'),
    openGraph: {
        title: 'EnvStore — Secure encrypted .env management',
        description:
            'Upload, encrypt, version, and retrieve .env files with client-side encryption.',
        type: 'website',
        url: '/',
        siteName: 'EnvStore',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'EnvStore — Secure encrypted .env management',
        description:
            'Upload, encrypt, version, and retrieve .env files with client-side encryption.',
        creator: '@fenilso',
    },
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${appSans.variable} ${appMono.variable} antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
