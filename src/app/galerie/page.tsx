import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getRevealDate } from '@/lib/reveal'
import GalerieClient from './GalerieClient'

export default function GaleriePage() {
  const session = getSession()
  if (!session) redirect('/')

  const revealDate = getRevealDate()

  return (
    <GalerieClient
      session={session}
      revealDate={revealDate?.toISOString() ?? null}
    />
  )
}
