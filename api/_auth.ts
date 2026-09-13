import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error('AUTH_SECRET no está definida.');
  }
  return value;
}

export type SessionPayload = { sub: string; email: string };

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: MAX_AGE_SECONDS });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, secret()) as SessionPayload;
  } catch {
    return null;
  }
}

function isLocalhost(req: VercelRequest): boolean {
  const host = req.headers.host ?? '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export function setSessionCookie(req: VercelRequest, res: VercelResponse, token: string): void {
  const secure = isLocalhost(req) ? '' : ' Secure;';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax;${secure}`,
  );
}

export function clearSessionCookie(req: VercelRequest, res: VercelResponse): void {
  const secure = isLocalhost(req) ? '' : ' Secure;';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax;${secure}`);
}

export function getSession(req: VercelRequest): SessionPayload | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return null;
  }
  return verifySession(token);
}

export function requireAuth(req: VercelRequest, res: VercelResponse): SessionPayload | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'No autenticado.' });
    return null;
  }
  return session;
}
