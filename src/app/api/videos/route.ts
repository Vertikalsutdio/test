import { NextRequest, NextResponse } from 'next/server'
import { redis, KEYS, Video } from '@/lib/redis'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    // Get ordered list of video IDs
    const ids = await redis.lrange(KEYS.videosList, 0, -1)
    if (!ids.length) return NextResponse.json({ videos: [], totalVoters: 0, totalVotes: 0 })

    // Get all videos
    const videosRaw = await redis.hgetall<Record<string, string>>(KEYS.videos)
    const videos: Video[] = []

    for (const id of ids) {
      const raw = videosRaw?.[id]
      if (raw) {
        const v = typeof raw === 'string' ? JSON.parse(raw) : raw
        videos.push(v)
      }
    }

    const totalVotersRaw = await redis.get(KEYS.totalVoters)
    const totalVoters = parseInt(String(totalVotersRaw || '0'))
    const totalVotes = totalVoters // 1 vote par personne

    return NextResponse.json({ videos, totalVoters, totalVotes })
  } catch (err) {
    console.error('[VIDEOS]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
