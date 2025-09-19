// Media URL utility stub
export function getMediaUrl(media: any, cacheTag?: string): string {
  if (!media) return ''
  if (typeof media === 'string') {
    return cacheTag ? `${media}?v=${cacheTag}` : media
  }
  const url = media.url || media.src || ''
  return cacheTag ? `${url}?v=${cacheTag}` : url
}