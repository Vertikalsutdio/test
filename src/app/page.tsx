'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      })
      if (!res.ok) throw new Error('Erreur login')
      router.push('/galerie')
    } catch {
      setError('Une erreur est survenue, réessaie.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="text-3xl font-medium tracking-tight text-white">
          kreads<span className="text-[#E84040]">.</span>battle
        </div>
        <div className="mt-2 text-sm text-white/30 tracking-widest uppercase">
          Saison 01
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm animate-fade-in"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        <div className="border border-white/8 rounded-2xl p-8 bg-[#161616]">
          <h1 className="text-xl font-medium text-white mb-1">Qui es-tu ?</h1>
          <p className="text-sm text-white/40 mb-8">
            Pas de mot de passe. Juste ton nom pour voter.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Léo"
                autoFocus
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E84040]/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Bouyer"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E84040]/60 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-[#E84040]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !firstName.trim() || !lastName.trim()}
              className="w-full mt-2 bg-[#E84040] hover:bg-[#d03535] disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors"
            >
              {loading ? 'Connexion…' : 'Entrer dans l\'arène →'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer hint */}
      <p
        className="mt-8 text-xs text-white/20 text-center animate-fade-in"
        style={{ animationDelay: '0.2s', opacity: 0 }}
      >
        Les votes sont anonymes et définitifs.
        <br />
        Le classement se dévoile le J-day.
      </p>
    </div>
  )
}
