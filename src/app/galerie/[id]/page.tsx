'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Video } from '@/lib/redis'

export default function VideoPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedFor, setVotedFor] = useState<string | undefined>()
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/videos').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
    ]).then(([videoData, meData]) => {
      const v = videoData.videos?.find((v: Video) => v.id === id)
      if (!v) { router.push('/galerie'); return }
      setVideo(v)
      if (meData.hasVoted) setHasVoted(true)
      if (meData.votedFor) setVotedFor(meData.votedFor)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleVote() {
    if (!video || hasVoted || voting) return
    setVoting(true)
    setError('')
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setHasVoted(true)
      setVotedFor(video.id)
    } catch {
      setError('Erreur réseau')
    } finally {
      setVoting(false)
    }
  }

  const isVotedFor = votedFor === id

  if (loading) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  )

  if (!video) return null

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-4xl mx-auto px-6 pt-8 pb-16">
        <Link
          href="/galerie"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour à la galerie
        </Link>

        {/* Embed player */}
        <div className="rounded-2xl overflow-hidden border border-white/8 aspect-video mb-8">
          <iframe
            src={video.embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-medium text-white mb-3">{video.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E84040]/20 flex items-center justify-center text-[10px] text-[#E84040] font-medium">
                {video.author.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <span className="text-sm text-white/40">{video.author}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/25">
                {new Date(video.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </span>
            </div>

            {video.note && (
              <div className="bg-[#161616] border border-white/6 rounded-xl p-4">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Note du monteur</p>
                <p className="text-sm text-white/60 leading-relaxed">{video.note}</p>
              </div>
            )}
          </div>

          {/* Vote block */}
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-6 text-center w-full sm:w-auto sm:min-w-[200px]">
            {isVotedFor ? (
              <div>
                <div className="w-10 h-10 rounded-full bg-[#E84040]/15 border border-[#E84040]/30 flex items-center justify-center mx-auto mb-3">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9.5L7 12.5L14 6" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#E84040]">Tu as voté pour cette vidéo</p>
                <p className="text-xs text-white/25 mt-1">Vote anonyme et définitif</p>
              </div>
            ) : hasVoted ? (
              <div>
                <p className="text-sm text-white/40">Tu as déjà voté</p>
                <p className="text-xs text-white/20 mt-1">Un seul vote autorisé</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-white/30 mb-4 leading-relaxed">Un seul vote,<br />anonyme et définitif.</p>
                {error && <p className="text-xs text-[#E84040] mb-3">{error}</p>}
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="w-full bg-[#E84040] hover:bg-[#d03535] disabled:opacity-40 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  {voting ? 'Enregistrement…' : 'Voter pour cette vidéo'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
