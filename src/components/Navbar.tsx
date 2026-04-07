'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  firstName?: string
  lastName?: string
  hasVoted?: boolean
}

export default function Navbar({ firstName, lastName, hasVoted }: NavbarProps) {
  const pathname = usePathname()

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-50 bg-[#0D0D0D]/90 backdrop-blur border-b border-white/6">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/galerie" className="text-base font-medium text-white tracking-tight">
          kreads<span className="text-[#E84040]">.</span>battle
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/galerie"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/galerie'
                ? 'text-white bg-white/8'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Galerie
          </Link>
          <Link
            href="/submit"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/submit'
                ? 'text-white bg-white/8'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Soumettre
          </Link>
          <Link
            href="/leaderboard"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === '/leaderboard'
                ? 'text-white bg-white/8'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            Résultats
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {hasVoted && (
            <div className="flex items-center gap-1.5 bg-[#E84040]/10 border border-[#E84040]/30 rounded-full px-3 py-1">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5.5L4 7.5L8 3" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[11px] text-[#E84040] font-medium">J'ai voté</span>
            </div>
          )}
          <div className="w-7 h-7 rounded-full bg-[#E84040] flex items-center justify-center text-[11px] font-medium text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
