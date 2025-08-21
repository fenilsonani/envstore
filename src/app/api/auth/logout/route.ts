import { NextResponse, type NextRequest } from 'next/server';
import { clearSession } from '@/server/auth';

export async function POST(request: NextRequest) {
    await clearSession();
    const base = process.env.NEXT_PUBLIC_APP_URL || request.url;
    return NextResponse.redirect(new URL('/logout', base), { status: 303 });
}
