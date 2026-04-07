'use client'

import { useEffect, useState } from 'react'

interface CountdownProps {
  revealDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function Countdown({ revealDate }: CountdownProps) {
  const target = new Date(revealDate)
  const [time, setTime] = useState<TimeLeft>(getTimeLeft(target))

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => clearInterval(interval)
  }, [revealDate])

  const units = [
    { label: 'jours', value: time.days },
    { label: 'heures', value: time.hours },
    { label: 'min', value: time.minutes },
    { label: 'sec', value: time.seconds },
  ]

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center min-w-[220px]">
      <div className="text-[11px] text-white/30 uppercase tracking-widest mb-3">
        Révélation dans
      </div>
      <div className="flex items-center justify-center gap-1">
        {units.map((u, i) => (
          <span key={u.label} className="flex items-center gap-1">
            <span className="flex flex-col items-center">
              <span className="text-2xl font-medium text-white tabular-nums leading-none">
                {pad(u.value)}
              </span>
              <span className="text-[10px] text-white/25 mt-1">{u.label}</span>
            </span>
            {i < units.length - 1 && (
              <span className="text-xl text-[#E84040] mb-4 mx-0.5">:</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
