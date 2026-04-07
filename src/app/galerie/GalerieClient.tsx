'use client'

import { useEffect, useState } from 'react'
import { UserSession, Video } from '@/lib/redis'
import Navbar from '@/components/Navbar'
import Countdown from '@/components/Countdown'
import VideoCard from '@/components/VideoCard'

interface Props {
  session: UserSession
  revealDate: string | null
}

export default function GalerieClient({ session, revealDate }: Props) {
  const [videos, setVideos] = useState<Video[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [totalVoters, setTotalVoters] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(session.hasVoted)
  const [votedFor, setVotedFor] = useState<string | undefined>(session.votedFor)
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState('')

  useEffect(() => {
    fetchVideos()
  }, [])

  async function fetchVideos() {
    try {
      const res = await fetch('/api/videos')
      if (!res.ok) return
      const data = await res.json()
      setVideos(data.videos)
      setTotalVotes(data.totalVotes)
      setTotalVoters(data.totalVoters)
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(videoId: string) {
    if (hasVoted || voting) return
    setVoting(true)
    setVoteError('')
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVoteError(data.error || 'Erreur lors du vote')
        return
      }
      setHasVoted(true)
      setVotedFor(videoId)
      setTotalVoters(v => v + 1)
      setTotalVotes(v => v + 1)
    } catch {
      setVoteError('Erreur réseau, réessaie.')
    } finally {
      setVoting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar
        firstName={session.firstName}
        lastName={session.lastName}
        hasVoted={hasVoted}
      />

      {/* Hero */}
      <div className="bg-[#0D0D0D] border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-end justify-between gap-8 flex-wrap">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-white leading-tight">
              Quelle pub <span className="text-[#E84040]">mérite</span>
              <br />le titre ?
            </h1>
            {hasVoted && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#E84040]/10 border border-[#E84040]/25 rounded-full px-3 py-1">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5.5L4 7.5L8 3" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[11px] text-[#E84040] font-medium">J'ai voté</span>
                </div>
                <span className="text-xs text-white/25">Ton vote est enregistré</span>
              </div>
            )}
          </div>
          {revealDate && <Countdown revealDate={revealDate} />}
        </div>

        {/* Stats bar */}
        <div className="bg-[#111] border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-medium text-white">{totalVoters}</span>
              <span className="text-xs text-white/35">votes castés</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-medium text-white">{videos.length}</span>
              <span className="text-xs text-white/35">vidéos en compétition</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E84040]" style={{ animation: 'pulse 2s infinite' }} />
              <span className="text-xs text-white/30">Classement masqué jusqu'au J-day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {voteError && (
          <div className="mb-6 bg-[#E84040]/10 border border-[#E84040]/25 rounded-xl px-4 py-3 text-sm text-[#E84040]">
            {voteError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#161616] border border-white/6 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/4" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/6 rounded w-3/4" />
                  <div className="h-3 bg-white/4 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-white/40 text-sm">Aucune vidéo soumise pour l'instant.</p>
            <p className="text-white/20 text-xs mt-1">Sois le premier à soumettre ta création.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                isVotedFor={votedFor === video.id}
                hasVoted={hasVoted}
                onVote={handleVote}
                voting={voting}
              />
            ))}
          </div>
        )}

        {/* Mystery banner */}
        {videos.length > 0 && (
          <div className="mt-10 bg-[#111] border border-white/6 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#E84040]/10 border border-[#E84040]/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="2" stroke="#E84040" strokeWidth="1.2"/>
                <path d="M5.5 7V5.5C5.5 4 6.5 3 8 3C9.5 3 10.5 4 10.5 5.5V7" stroke="#E84040" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Le classement est scellé.</p>
              <p className="text-xs text-white/25 mt-0.5">
                Les scores sont masqués jusqu'à la révélation — chaque vote compte sans que personne ne sache qui mène.
                {revealDate && ` Reviens le ${new Date(revealDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.`}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
