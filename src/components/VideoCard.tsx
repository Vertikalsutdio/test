'use client'

import Link from 'next/link'
import { Video } from '@/lib/redis'

interface VideoCardProps {
  video: Video
  isVotedFor: boolean
  hasVoted: boolean
  onVote: (id: string) => void
  voting: boolean
}

export default function VideoCard({ video, isVotedFor, hasVoted, onVote, voting }: VideoCardProps) {
  const initials = video.author
    .split(' ')
    .map((s: string) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="group bg-[#161616] border border-white/6 rounded-2xl overflow-hidden hover:border-white/14 transition-colors">
      <Link href={`/galerie/${video.id}`}>
        <div className="relative aspect-video bg-[#0D0D0D] overflow-hidden cursor-pointer">
          <img
            src={video.thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center group-hover:bg-black/70 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 2.5L11 7L4 11.5V2.5Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/galerie/${video.id}`}>
          <h3 className="text-sm font-medium text-white truncate mb-1 hover:text-white/80 transition-colors">
            {video.title}
          </h3>
        </Link>

        {video.note && (
          <p className="text-xs text-white/35 line-clamp-2 mb-3 leading-relaxed">{video.note}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#E84040]/20 flex items-center justify-center text-[9px] text-[#E84040] font-medium">
              {initials}
            </div>
            <span className="text-xs text-white/35">{video.author}</span>
          </div>

          {isVotedFor ? (
            <div className="flex items-center gap-1 bg-[#E84040]/15 border border-[#E84040]/30 rounded-full px-3 py-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5L4 7.5L8 3" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11px] text-[#E84040] font-medium">Mon vote</span>
            </div>
          ) : hasVoted ? (
            <div className="w-2 h-2 rounded-full bg-white/10" />
          ) : (
            <button
              onClick={() => onVote(video.id)}
              disabled={voting}
              className="text-[11px] font-medium text-white/40 border border-white/10 rounded-full px-3 py-1 hover:border-[#E84040]/50 hover:text-[#E84040] hover:bg-[#E84040]/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {voting ? '…' : 'Voter'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
