import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'phphire-secret-key-change-in-production'
const COOKIE_NAME = 'phphire_session'

// ── OTP ───────────────────────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ── Password ──────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ── JWT ───────────────────────────────────────────────────────────────────────
export function signToken(payload: {
  userId:    string
  email:     string
  user_type: string
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string): {
  userId:    string
  email:     string
  user_type: string
} | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId:    string
      email:     string
      user_type: string
    }
    return payload
  } catch {
    return null
  }
}

// ── Session cookie ────────────────────────────────────────────────────────────
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30, // 30 days
    path:     '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
}

// ── Get session user from request ─────────────────────────────────────────────
export function getSessionUser(req: NextRequest): {
  userId:    string
  email:     string
  user_type: string
} | null {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}