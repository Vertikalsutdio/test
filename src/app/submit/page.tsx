'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

type Step = 'form' | 'submitting' | 'done' | 'error'

export default function SubmitPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ firstName: string; lastName: string; hasVoted: boolean } | null>(null)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [preview, setPreview] = useState<{ embedUrl: string; thumbUrl: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [step, setStep] = useState<Step>('form')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { router.push('/'); return }
        setSession({ firstName: d.firstName, lastName: d.lastName, hasVoted: d.hasVoted })
      })
  }, [])

  // Live preview quand l'URL change
  useEffect(() => {
    const url = videoUrl.trim()
    if (!url) { setPreview(null); return }

    setPreviewLoading(true)
    // Appel côté client pour parser l'URL (on réutilise la logique serveur via une route légère)
    fetch('/api/preview-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: url }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.embedUrl) setPreview({ embedUrl: d.embedUrl, thumbUrl: d.thumbUrl })
        else setPreview(null)
      })
      .catch(() => setPreview(null))
      .finally(() => setPreviewLoading(false))
  }, [videoUrl])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !videoUrl.trim()) return
    setStep('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, note, videoUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error); setStep('error'); return }
      setStep('done')
    } catch {
      setErrorMsg('Erreur réseau, réessaie.')
      setStep('error')
    }
  }

  if (!session) return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar firstName={session.firstName} lastName={session.lastName} hasVoted={session.hasVoted} />

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-medium text-white">Soumettre ma vidéo</h1>
          <p className="text-sm text-white/35 mt-1">
            Colle le lien YouTube ou Vimeo de ta pub préférée.
          </p>
        </div>

        {step === 'done' ? (
          <div className="bg-[#161616] border border-white/8 rounded-2xl p-10 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#E84040]/10 border border-[#E84040]/25 flex items-center justify-center mx-auto mb-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11.5L8.5 16L18 7" stroke="#E84040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Vidéo soumise !</h2>
            <p className="text-sm text-white/35 mb-6">Ta création est dans l'arène. Que le meilleur gagne.</p>
            <button
              onClick={() => router.push('/galerie')}
              className="bg-[#E84040] hover:bg-[#d03535] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              Voir la galerie →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">

            {/* Video URL */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Lien YouTube ou Vimeo *
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E84040]/50 transition-colors"
              />

              {/* Preview */}
              {previewLoading && (
                <div className="mt-3 h-[160px] bg-white/4 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              )}
              {preview && !previewLoading && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/8 aspect-video">
                  <iframe
                    src={preview.embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}
              {!preview && !previewLoading && videoUrl.trim() && (
                <p className="mt-2 text-xs text-[#E84040]">
                  Lien non reconnu — colle un lien YouTube ou Vimeo valide.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Le ménage, libéré"
                required
                maxLength={80}
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E84040]/50 transition-colors"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">
                Note du monteur <span className="text-white/20 normal-case">(optionnel)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Pourquoi cette vidéo ? Qu'est-ce qui t'en rend fier ?"
                rows={3}
                maxLength={300}
                className="w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E84040]/50 transition-colors resize-none"
              />
              <p className="text-xs text-white/20 mt-1 text-right">{note.length}/300</p>
            </div>

            {step === 'error' && (
              <div className="bg-[#E84040]/8 border border-[#E84040]/25 rounded-xl px-4 py-3 text-sm text-[#E84040]">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!videoUrl.trim() || !title.trim() || step === 'submitting' || !preview}
              className="w-full bg-[#E84040] hover:bg-[#d03535] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium py-3 rounded-xl transition-colors"
            >
              {step === 'submitting' ? 'Enregistrement…' : 'Soumettre dans l\'arène →'}
            </button>

            <p className="text-xs text-white/20 text-center">
              Une seule soumission par monteur. Irréversible.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
