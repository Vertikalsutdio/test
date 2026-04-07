import { Redis } from '@upstash/redis'

export const redis = Redis.fromEnv()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Video {
  id: string
  title: string
  author: string
  note: string
  videoUrl: string      // lien YouTube/Vimeo original
  embedUrl: string      // URL embed extraite
  thumbUrl: string      // miniature
  createdAt: string
}

export interface UserSession {
  id: string
  firstName: string
  lastName: string
  hasVoted: boolean
  votedFor?: string    // video id
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

export const KEYS = {
  videos: 'kb:videos',                          // Hash { videoId -> JSON }
  videosList: 'kb:videos:list',                 // List of video IDs (order)
  votes: 'kb:votes',                            // Hash { videoId -> count }
  userVote: (userId: string) => `kb:user:${userId}:vote`,   // String (videoId)
  users: 'kb:users',                            // Hash { userId -> JSON }
  totalVoters: 'kb:voters:count',               // Int
}
