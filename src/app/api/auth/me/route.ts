import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { redis, KEYS } from '@/lib/redis'

export async function GET() {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Always check Redis for fresh vote state
  const votedFor = await redis.get<string>(KEYS.userVote(session.id))

  return NextResponse.json({
    authenticated: true,
    firstName: session.firstName,
    lastName: session.lastName,
    hasVoted: !!votedFor,
    votedFor: votedFor || null,
  })
}
