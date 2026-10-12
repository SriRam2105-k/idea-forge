import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { TeamSession, AdminSession } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

const TEAM_COOKIE = 'npr_team_session';
const ADMIN_COOKIE = 'npr_admin_session';
const SESSION_DURATION = '8h';
const COOKIE_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// ============================================================
// Token helpers
// ============================================================

export async function signToken(payload: object): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as T;
  } catch {
    return null;
  }
}

// ============================================================
// Team session
// ============================================================

export async function createTeamSession(session: Omit<TeamSession, 'iat' | 'exp'>): Promise<void> {
  const token = await signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(TEAM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getTeamSession(): Promise<TeamSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_COOKIE)?.value;
  if (!token) return null;
  return verifyToken<TeamSession>(token);
}

export async function clearTeamSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TEAM_COOKIE);
}

// ============================================================
// Admin session
// ============================================================

export async function createAdminSession(session: Omit<AdminSession, 'iat' | 'exp'>): Promise<void> {
  const token = await signToken(session);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken<AdminSession>(token);
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
