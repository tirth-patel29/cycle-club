import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { setSessionCookie, ensureUuid } from '@/lib/auth';

// Rate limiting for admin login: max 5 failed attempts per IP per 15 minutes
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  // In development, do not lock out developer while configuring credentials
  if (process.env.NODE_ENV !== 'production') return false;

  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry) return false;
  if (now > entry.resetAt) {
    failedAttemptsMap.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string) {
  failedAttemptsMap.delete(ip);
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function cleanEnvVal(val: string | undefined | null): string | null {
  if (!val) return null;
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

function readEnvVarFromDisk(targetKey: string): string | null {
  // In production (e.g. Vercel), variables are injected into process.env; disk scanning is only for local dev hot-reloads
  if (process.env.NODE_ENV === 'production') return null;

  try {
    const cwd = process.cwd();
    const candidateFiles = ['.env.local', '.env'];
    for (const f of candidateFiles) {
      const fullPath = path.resolve(cwd, f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const k = trimmed.slice(0, idx).trim().toLowerCase();
            if (k === targetKey.toLowerCase()) {
              return cleanEnvVal(trimmed.slice(idx + 1));
            }
          }
        }
      }
    }
  } catch {
    // Ignore file read error in serverless environments
  }
  return null;
}

const INSECURE_DEFAULT_ADMIN_PASSWORD = 'tirth#2957';

export function getAdminPassword(): string | null {
  // Check process.env with case insensitivity (ADMIN_PASSWORD, admin_password, ADMIN_PASS, admin_pass)
  const fromEnv =
    cleanEnvVal(process.env.ADMIN_PASSWORD) ||
    cleanEnvVal(process.env.admin_password) ||
    cleanEnvVal(process.env.ADMIN_PASS) ||
    cleanEnvVal(process.env.admin_pass);

  // If not found in process.env, read directly from .env.local or .env on disk (catches updates without dev server restart)
  const resolved =
    fromEnv ||
    readEnvVarFromDisk('ADMIN_PASSWORD') ||
    readEnvVarFromDisk('admin_password');

  if (process.env.NODE_ENV === 'production') {
    // In production, must be explicitly configured
    if (!resolved) {
      console.error(
        '[Security Configuration Error] In production, ADMIN_PASSWORD environment variable must be explicitly configured.'
      );
      return null;
    }
    return resolved;
  }

  return resolved || INSECURE_DEFAULT_ADMIN_PASSWORD;
}

export function getAdminEmails(): string[] {
  const rawSources = [
    process.env.ADMIN_EMAILS,
    process.env.admin_emails,
    process.env.ADMIN_EMAIL,
    process.env.admin_email,
    readEnvVarFromDisk('ADMIN_EMAILS'),
    readEnvVarFromDisk('admin_emails'),
    readEnvVarFromDisk('ADMIN_EMAIL'),
    readEnvVarFromDisk('admin_email'),
  ];

  const emails = new Set<string>([
    'admin@anandcyclingclub.in',
    'tirthhpatel29@gmail.com',
  ]);

  for (const raw of rawSources) {
    if (raw && typeof raw === 'string') {
      const stripped = raw.replace(/^["']|["']$/g, '');
      stripped.split(/[,;]+/).forEach(e => {
        const cleaned = e.trim().toLowerCase().replace(/^["']|["']$/g, '');
        if (cleaned && cleaned.includes('@')) {
          emails.add(cleaned);
        }
      });
    }
  }

  return Array.from(emails);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
      {
        status: 429,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // Check email in authorized admin list
  const adminEmails = getAdminEmails();
  const isAuthorizedEmail = adminEmails.includes(email);
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) {
    console.error('[Admin Auth Error] Missing ADMIN_PASSWORD configuration in environment.');
    return NextResponse.json(
      {
        error: 'Admin authentication service is not configured. Missing ADMIN_PASSWORD in environment variables. If recently added on Vercel, please trigger a redeploy so the variable takes effect.',
        code: 'MISSING_ADMIN_PASSWORD'
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  // Safe timing comparison: support both plain-text match and SHA-256 hash match
  const isDirectMatch = safeCompare(password, configuredPassword);
  const sha256Hex = crypto.createHash('sha256').update(password).digest('hex');
  const isShaMatch = safeCompare(sha256Hex, configuredPassword);
  const isPasswordValid = isDirectMatch || isShaMatch;

  // Safe diagnostic log without exposing secret values
  console.log('[Admin Auth Diagnostic]', {
    email,
    isAuthorizedEmail,
    adminEmailsCount: adminEmails.length,
    passwordConfigured: true,
    expectedPasswordLength: configuredPassword.length,
    receivedPasswordLength: password.length,
    passwordMatched: isPasswordValid,
    isShaMatch,
    nodeEnv: process.env.NODE_ENV
  });

  if (!isAuthorizedEmail) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      {
        error: 'The email address is not in the authorized administrator list.',
        code: 'UNAUTHORIZED_EMAIL'
      },
      {
        status: 401,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  if (!isPasswordValid) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      {
        error: 'Invalid master password. Please verify your password or the ADMIN_PASSWORD environment variable.',
        code: 'INVALID_PASSWORD'
      },
      {
        status: 401,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  // Login successful
  clearFailedAttempts(ip);

  const adminName = email.includes('tirth') ? 'Tirth Patel (Super Admin)' : 'Club Operations Admin';

  try {
    await setSessionCookie({
      userId: ensureUuid(`admin-${email}`),
      email,
      fullName: adminName,
      role: 'admin'
    });
  } catch (err: any) {
    console.error('[Admin Login Error] Failed to create session cookie:', err);
    return NextResponse.json(
      {
        error: 'Authentication succeeded but session could not be established. Check SESSION_SECRET configuration.',
        code: 'SESSION_CREATION_FAILED'
      },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: `Welcome back, ${adminName}!`,
      user: {
        email,
        name: adminName,
        role: 'admin'
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
