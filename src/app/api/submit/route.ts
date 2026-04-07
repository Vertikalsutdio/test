import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { redis, KEYS, Video } from '@/lib/redis'
import { parseVideoUrl } from '@/lib/video'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const { title, note, videoUrl } = await req.json()

    if (!title?.trim() || !videoUrl?.trim()) {
      return NextResponse.json({ error: 'Titre et lien vidéo requis' }, { status: 400 })
    }

    const parsed = parseVideoUrl(videoUrl)
    if (!parsed) {
      return NextResponse.json(
        { error: 'Lien non reconnu. Colle un lien YouTube ou Vimeo valide.' },
        { status: 400 }
      )
    }

    // Check si ce monteur a déjà soumis
    const existingIds = await redis.lrange(KEYS.videosList, 0, -1)
    for (const id of existingIds) {
      const raw = await redis.hget<string>(KEYS.videos, id)
      if (raw) {
        const v = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (v.author === `${session.firstName} ${session.lastName}`) {
          return NextResponse.json(
            { error: 'Tu as déjà soumis une vidéo pour cette édition.' },
            { status: 403 }
          )
        }
      }
    }

    const video: Video = {
      id: nanoid(),
      title: title.trim(),
      author: `${session.firstName} ${session.lastName}`,
      note: (note || '').trim(),
      videoUrl: videoUrl.trim(),
      embedUrl: parsed.embedUrl,
      thumbUrl: parsed.thumbUrl,
      createdAt: new Date().toISOString(),
    }

    await Promise.all([
      redis.hset(KEYS.videos, { [video.id]: JSON.stringify(video) }),
      redis.rpush(KEYS.videosList, video.id),
      redis.hset(KEYS.votes, { [video.id]: 0 }),
    ])

    return NextResponse.json({ ok: true, video })
  } catch (err) {
    console.error('[SUBMIT]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
