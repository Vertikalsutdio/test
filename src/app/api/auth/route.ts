import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { redis, KEYS, UserSession } from '@/lib/redis'
import { createSessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName } = await req.json()

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'Champs requis' }, { status: 400 })
    }

    // Check if user already exists (same first+last name)
    const existingRaw = await redis.hget<string>(KEYS.users, `${firstName}:${lastName}`)
    
    let session: UserSession

    if (existingRaw) {
      session = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw
      // Refresh hasVoted from Redis
      const votedFor = await redis.get<string>(KEYS.userVote(session.id))
      session.hasVoted = !!votedFor
      session.votedFor = votedFor || undefined
    } else {
      session = {
        id: nanoid(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        hasVoted: false,
      }
      await redis.hset(KEYS.users, { [`${firstName}:${lastName}`]: JSON.stringify(session) })
    }

    const token = createSessionCookie(session)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[AUTH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
