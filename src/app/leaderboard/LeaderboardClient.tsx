'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Countdown from '@/components/Countdown'
import { UserSession, Video } from '@/lib/redis'

interface Result {
  video: Video
  votes: number
}

interface Props {
  revealed: boolean
  revealDate: string | null
  results: Result[]
  session: UserSession
}

const medals = ['🥇', '🥈', '🥉']
const medalColors = [
  { bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/30', text: 'text-[#FFD700]' },
  { bg: 'bg-[#C0C0C0]/10', border: 'border-[#C0C0C0]/25', text: 'text-[#C0C0C0]' },
  { bg: 'bg-[#CD7F32]/10', border: 'border-[#CD7F32]/25', text: 'text-[#CD7F32]' },
]

export default function LeaderboardClient({ revealed, revealDate, results, session }: Props) {
  const [animatedVotes, setAnimatedVotes] = useState<number[]>([])
  const totalVotes = results.reduce((s, r) => s + r.votes, 0)

  useEffect(() => {
    if (!revealed) return
    // Animate vote counts
    const targets = results.map(r => r.votes)
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - pct, 3)
      setAnimatedVotes(targets.map(t => Math.round(t * eased)))
      if (pct < 1) requestAnimationFrame(tick)
    }
    setTimeout(() => requestAnimationFrame(tick), 300)
  }, [revealed])

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar firstName={session.firstName} lastName={session.lastName} hasVoted={session.hasVoted} />

      <main className="max-w-3xl mx-auto px-6 py-12">

        {!revealed ? (
          /* ── SEALED STATE ── */
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#E84040]/10 border border-[#E84040]/20 flex items-center justify-center mx-auto mb-6">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="5" y="12" width="16" height="11" rx="3" stroke="#E84040" strokeWidth="1.5"/>
                <path d="M9 12V9C9 6.8 10.8 5 13 5C15.2 5 17 6.8 17 9V12" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-medium text-white mb-2">Le classement est scellé</h1>
            <p className="text-sm text-white/35 mb-10 max-w-sm mx-auto">
              Les résultats seront révélés au moment J. En attendant, les scores restent secrets pour que chaque vote garde son poids.
            </p>

            {revealDate && (
              <div className="flex justify-center mb-10">
                <Countdown revealDate={revealDate} />
              </div>
            )}

            <div className="bg-[#111] border border-white/6 rounded-2xl p-6 text-left">
              <p className="text-xs text-white/25 uppercase tracking-wider mb-4">Ce que tu sais déjà</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E84040]" />
                  <span className="text-sm text-white/40">Les votes sont anonymes et permanents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E84040]" />
                  <span className="text-sm text-white/40">Un seul vote par personne</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E84040]" />
                  <span className="text-sm text-white/40">Le meilleur monteur sera révélé le J-day</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── REVEALED STATE ── */
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <div className="text-4xl mb-3">🏆</div>
              <h1 className="text-2xl font-medium text-white mb-1">Les résultats sont là</h1>
              <p className="text-sm text-white/30">{totalVotes} vote{totalVotes !== 1 ? 's' : ''} au total</p>
            </div>

            {/* Podium top 3 */}
            {results.length >= 1 && (
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[results[1], results[0], results[2]].map((result, visualIdx) => {
                  if (!result) return <div key={visualIdx} />
                  const rankIdx = results.indexOf(result)
                  const colors = medalColors[rankIdx] || medalColors[2]
                  const isWinner = rankIdx === 0
                  return (
                    <div
                      key={result.video.id}
                      className={`${colors.bg} border ${colors.border} rounded-2xl p-4 text-center ${isWinner ? 'col-start-2 -mt-4' : ''}`}
                    >
                      <div className="text-2xl mb-2">{medals[rankIdx]}</div>
                      <p className="text-sm font-medium text-white truncate">{result.video.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{result.video.author}</p>
                      <p className={`text-lg font-medium mt-2 ${colors.text}`}>
                        {animatedVotes[rankIdx] ?? 0}
                        <span className="text-xs font-normal text-white/30 ml-1">votes</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Full ranking */}
            <div className="space-y-2">
              {results.map((result, i) => {
                const pct = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
                const colors = i < 3 ? medalColors[i] : null
                return (
                  <div
                    key={result.video.id}
                    className="bg-[#161616] border border-white/6 rounded-xl p-4 flex items-center gap-4"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <span className={`text-sm font-medium w-6 text-center ${colors ? colors.text : 'text-white/25'}`}>
                      {i < 3 ? medals[i] : `${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{result.video.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{result.video.author}</p>
                      {/* Progress bar */}
                      <div className="mt-2 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E84040] transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-medium text-white tabular-nums">
                        {animatedVotes[i] ?? 0}
                      </p>
                      <p className="text-xs text-white/25">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
