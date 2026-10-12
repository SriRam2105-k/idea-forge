import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const TEAM_COOKIE = 'npr_team_session';
const ADMIN_COOKIE = 'npr_admin_session';

// Routes that require team authentication
const TEAM_PROTECTED = ['/team'];
// Routes that require admin authentication
const ADMIN_PROTECTED = ['/admin'];
// Routes that should redirect logged-in teams away
const TEAM_AUTH_ROUTES = ['/team/login'];
// Routes that should redirect logged-in admins away
const ADMIN_AUTH_ROUTES = ['/admin/login'];

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const teamToken = request.cookies.get(TEAM_COOKIE)?.value;
  const adminToken = request.cookies.get(ADMIN_COOKIE)?.value;

  const isTeamAuthenticated = teamToken ? await verifyToken(teamToken) : false;
  const isAdminAuthenticated = adminToken ? await verifyToken(adminToken) : false;

  // ── Admin routes ──
  if (ADMIN_AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (isAdminAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (ADMIN_PROTECTED.some(r => pathname.startsWith(r))) {
    if (!isAdminAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Team routes ──
  if (TEAM_AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    if (isTeamAuthenticated) {
      return NextResponse.redirect(new URL('/team', request.url));
    }
    return NextResponse.next();
  }

  if (TEAM_PROTECTED.some(r => pathname.startsWith(r))) {
    if (!isTeamAuthenticated) {
      const loginUrl = new URL('/team/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/team/:path*',
    '/admin/:path*',
  ],
};
