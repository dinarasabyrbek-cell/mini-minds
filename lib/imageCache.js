const IMG_KEY  = 'miniMindsImageCache'
const TEXT_KEY = 'miniMindsStoryText'

export function getCachedImage(bookId, pageIndex) {
  try {
    const cache = JSON.parse(localStorage.getItem(IMG_KEY) || '{}')
    return cache[`${bookId}-${pageIndex}`] ?? null
  } catch { return null }
}

export function setCachedImage(bookId, pageIndex, imageUrl) {
  try {
    const cache = JSON.parse(localStorage.getItem(IMG_KEY) || '{}')
    cache[`${bookId}-${pageIndex}`] = imageUrl
    localStorage.setItem(IMG_KEY, JSON.stringify(cache))
  } catch (e) { console.error('Image cache error:', e) }
}

export function getCachedStoryText(bookId) {
  try {
    const raw = localStorage.getItem(`${TEXT_KEY}-${bookId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setCachedStoryText(bookId, pages) {
  try {
    localStorage.setItem(`${TEXT_KEY}-${bookId}`, JSON.stringify(pages))
  } catch (e) { console.error('Story cache error:', e) }
}
