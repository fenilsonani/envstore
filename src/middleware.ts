import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath =
        path === '/login' ||
        path === '/signup' ||
        path === '/' ||
        path === '/logout';

    // Get the session token from cookies
    const sessionToken = request.cookies.get('envstore_session')?.value || '';

    // If there's no session token and the path is not public, redirect to login
    if (!sessionToken && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If there is a session token and the path is public (login/signup), redirect to dashboard
    if (sessionToken && isPublicPath) {
        try {
            // Verify the token (we're not using the result, just checking if it's valid)
            const jwtSecret = new TextEncoder().encode(
                process.env.JWT_SECRET ||
                    'envstore_development_secret_key_do_not_use_in_production'
            );
            await jwtVerify(sessionToken, jwtSecret);

            // If we get here, the token is valid
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch {
            // If token verification fails, clear the cookie and let them stay on the public page
            const response = NextResponse.next();
            response.cookies.delete('envstore_session');
            return response;
        }
    }

    // For all other cases, continue with the request
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup', '/'],
};
