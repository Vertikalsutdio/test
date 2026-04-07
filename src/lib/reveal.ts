export function isRevealed(): boolean {
  if (process.env.FORCE_REVEAL === 'true') return true
  const revealDate = process.env.REVEAL_DATE
  if (!revealDate) return false
  return new Date() >= new Date(revealDate)
}

export function getRevealDate(): Date | null {
  const revealDate = process.env.REVEAL_DATE
  if (!revealDate) return null
  return new Date(revealDate)
}
