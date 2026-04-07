import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { isRevealed, getRevealDate } from '@/lib/reveal'
import { redis, KEYS, Video } from '@/lib/redis'
import LeaderboardClient from './LeaderboardClient'

export default async function LeaderboardPage() {
  const session = getSession()
  if (!session) redirect('/')

  const revealed = isRevealed()
  const revealDate = getRevealDate()

  if (!revealed) {
    return <LeaderboardClient revealed={false} revealDate={revealDate?.toISOString() ?? null} results={[]} session={session} />
  }

  // Fetch results
  const ids = await redis.lrange(KEYS.videosList, 0, -1)
  const videosRaw = await redis.hgetall<Record<string, string>>(KEYS.videos)
  const votesRaw = await redis.hgetall<Record<string, string>>(KEYS.votes)

  const results: Array<{ video: Video; votes: number }> = []

  for (const id of ids) {
    const raw = videosRaw?.[id]
    if (!raw) continue
    const video = typeof raw === 'string' ? JSON.parse(raw) : raw
    const votes = parseInt(String(votesRaw?.[id] || '0'))
    results.push({ video, votes })
  }

  results.sort((a, b) => b.votes - a.votes)

  return (
    <LeaderboardClient
      revealed={true}
      revealDate={revealDate?.toISOString() ?? null}
      results={results}
      session={session}
    />
  )
}
