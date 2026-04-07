import { NextRequest, NextResponse } from 'next/server'
import { parseVideoUrl } from '@/lib/video'

export async function POST(req: NextRequest) {
  const { videoUrl } = await req.json()
  if (!videoUrl) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

  const parsed = parseVideoUrl(videoUrl)
  if (!parsed) return NextResponse.json({ error: 'Non reconnu' }, { status: 400 })

  return NextResponse.json(parsed)
}
