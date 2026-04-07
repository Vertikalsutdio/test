import { cookies } from 'next/headers'
import { UserSession } from './redis'

const COOKIE_NAME = 'kb_session'
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'

function encode(data: UserSession): string {
  const json = JSON.stringify(data)
  const b64 = Buffer.from(json).toString('base64url')
  // Simple HMAC-like signature (production: use jose or iron-session)
  const sig = Buffer.from(`${SECRET}${b64}`).toString('base64url').slice(0, 16)
  return `${b64}.${sig}`
}

function decode(token: string): UserSession | null {
  try {
    const [b64, sig] = token.split('.')
    const expectedSig = Buffer.from(`${SECRET}${b64}`).toString('base64url').slice(0, 16)
    if (sig !== expectedSig) return null
    const json = Buffer.from(b64, 'base64url').toString('utf-8')
    return JSON.parse(json) as UserSession
  } catch {
    return null
  }
}

export function getSession(): UserSession | null {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return decode(token)
}

export function createSessionCookie(session: UserSession): string {
  return encode(session)
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
