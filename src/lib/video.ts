/**
 * Extrait l'embed URL et la miniature depuis un lien YouTube ou Vimeo.
 * Retourne null si le lien n'est pas reconnu.
 */
export function parseVideoUrl(url: string): {
  embedUrl: string
  thumbUrl: string
  platform: 'youtube' | 'vimeo'
} | null {
  url = url.trim()

  // ── YouTube ──────────────────────────────────────────────────────────────
  // Formats acceptés:
  //   https://www.youtube.com/watch?v=VIDEO_ID
  //   https://youtu.be/VIDEO_ID
  //   https://youtube.com/shorts/VIDEO_ID
  //   https://www.youtube.com/embed/VIDEO_ID
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of ytPatterns) {
    const match = url.match(pattern)
    if (match) {
      const id = match[1]
      return {
        embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`,
        thumbUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        platform: 'youtube',
      }
    }
  }

  // ── Vimeo ─────────────────────────────────────────────────────────────────
  // Formats acceptés:
  //   https://vimeo.com/VIDEO_ID
  //   https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    const id = vimeoMatch[1]
    return {
      embedUrl: `https://player.vimeo.com/video/${id}?autoplay=0`,
      thumbUrl: `https://vumbnail.com/${id}.jpg`,  // service de thumb Vimeo public
      platform: 'vimeo',
    }
  }

  return null
}
