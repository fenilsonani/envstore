import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    const title = 'EnvStore';
    const subtitle = 'Secure encrypted .env management';
    const tagline = 'Upload • Encrypt • Version • Retrieve';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    position: 'relative',
                    color: '#E6ECF2',
                    background:
                        'linear-gradient(180deg, #0B1220 0%, #0E1526 100%)',
                    fontFamily:
                        'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif',
                }}
            >
                {/* Glow gradients */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                            'radial-gradient(1200px 600px at -5% 0%, rgba(61,134,245,0.25), transparent 60%), radial-gradient(800px 400px at 110% 100%, rgba(147,51,234,0.20), transparent 60%)',
                    }}
                />

                {/* Subtle grid mask */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        backgroundPosition: '-1px -1px',
                        WebkitMaskImage:
                            'radial-gradient(900px 450px at 50% 50%, rgba(0,0,0,0.5), transparent 70%)',
                        maskImage:
                            'radial-gradient(900px 450px at 50% 50%, rgba(0,0,0,0.5), transparent 70%)',
                    }}
                />

                {/* Framed hero card */}
                <div
                    style={{
                        position: 'absolute',
                        top: 30,
                        left: 30,
                        right: 30,
                        bottom: 30,
                        borderRadius: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 48,
                        background:
                            'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow:
                            '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                            style={{
                                height: 56,
                                width: 56,
                                borderRadius: 12,
                                background:
                                    'linear-gradient(135deg, #60A5FA, #34D399)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0B1220',
                                fontWeight: 800,
                                fontSize: 36,
                            }}
                        >
                            .e
                        </div>
                        <div
                            style={{
                                fontSize: 48,
                                fontWeight: 800,
                                letterSpacing: -1,
                            }}
                        >
                            {title}
                        </div>
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            marginTop: 16,
                            fontSize: 36,
                            fontWeight: 700,
                            opacity: 0.95,
                        }}
                    >
                        {subtitle}
                    </div>

                    {/* Subheadline */}
                    <div style={{ marginTop: 8, fontSize: 24, opacity: 0.8 }}>
                        {tagline}
                    </div>

                    {/* Feature badges */}
                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 9999,
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                fontSize: 20,
                            }}
                        >
                            Zero‑knowledge encryption
                        </div>
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 9999,
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                fontSize: 20,
                            }}
                        >
                            Versioned .env files
                        </div>
                        <div
                            style={{
                                padding: '10px 14px',
                                borderRadius: 9999,
                                background: 'rgba(255,255,255,0.10)',
                                border: '1px solid rgba(255,255,255,0.18)',
                                fontSize: 20,
                            }}
                        >
                            Simple retrieval API
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 56,
                            bottom: 56,
                            fontSize: 24,
                            opacity: 0.7,
                        }}
                    >
                        envstore.fenilsonani.com
                    </div>
                </div>
            </div>
        ),
        {
            width: size.width,
            height: size.height,
        }
    );
}


