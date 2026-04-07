import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS } from '@/lib/redis'
import { getSession, createSessionCookie, SESSION_COOKIE_NAME } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  if (session.hasVoted) {
    return NextResponse.json({ error: 'Tu as déjà voté.' }, { status: 403 })
  }

  try {
    const { videoId } = await req.json()
    if (!videoId) {
      return NextResponse.json({ error: 'videoId requis' }, { status: 400 })
    }

    // Check video exists
    const videoRaw = await redis.hget<string>(KEYS.videos, videoId)
    if (!videoRaw) {
      return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 })
    }

    // Check not already voted (double-check Redis, session could be stale)
    const existingVote = await redis.get(KEYS.userVote(session.id))
    if (existingVote) {
      return NextResponse.json({ error: 'Tu as déjà voté.' }, { status: 403 })
    }

    // Register vote atomically
    await Promise.all([
      redis.set(KEYS.userVote(session.id), videoId),
      redis.hincrby(KEYS.votes, videoId, 1),
      redis.incr(KEYS.totalVoters),
    ])

    // Update session cookie
    const updatedSession = { ...session, hasVoted: true, votedFor: videoId }
    const newToken = createSessionCookie(updatedSession)

    const response = NextResponse.json({ ok: true, votedFor: videoId })
    response.cookies.set(SESSION_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[VOTE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
