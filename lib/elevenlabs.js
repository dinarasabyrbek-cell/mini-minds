/* Client-side ElevenLabs helper.
   - Caches ArrayBuffers in a Map so the same text is never fetched twice per session.
   - Stops previous playback before starting a new one.
   - Falls back silently to SpeechSynthesisUtterance on any error.
*/

const cache = new Map()   // text → ArrayBuffer
let _ctx    = null        // shared AudioContext
let _source = null        // currently playing BufferSource

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

export async function speak(text) {
  if (typeof window === 'undefined') return

  try {
    let buf
    if (cache.has(text)) {
      buf = cache.get(text)
    } else {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`ElevenLabs HTTP ${res.status}`)
      buf = await res.arrayBuffer()
      cache.set(text, buf)
    }

    const ctx     = getCtx()
    // slice(0) so the cached buffer is never detached by decodeAudioData
    const decoded = await ctx.decodeAudioData(buf.slice(0))

    stopCurrent()

    const source = ctx.createBufferSource()
    source.buffer = decoded
    source.connect(ctx.destination)
    _source = source
    source.onended = () => { if (_source === source) _source = null }
    source.start(0)

  } catch (err) {
    console.error('ElevenLabs speak error:', err)
    // Graceful fallback — app never breaks
    window.speechSynthesis?.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate  = 0.85
    u.pitch = 1.1
    window.speechSynthesis?.speak(u)
  }
}

export function stopCurrent() {
  if (_source) { try { _source.stop() } catch {} _source = null }
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}
