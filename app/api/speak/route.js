const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '2OEeJcYw2f3bWMzzjVMU'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text) return new Response('Missing text', { status: 400 })

    const elevenKey = process.env.ELEVENLABS_API_KEY
    if (!elevenKey) return Response.json({ error: 'Missing ELEVENLABS_API_KEY' }, { status: 500 })

    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3'

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs API error:', res.status, err)
      return Response.json(
        {
          error: 'TTS failed',
          ...(process.env.NODE_ENV !== 'production' ? { status: res.status, details: err } : {}),
        },
        { status: res.status }
      )
    }

    const audio = await res.arrayBuffer()
    return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } })
  } catch (err) {
    console.error('API /speak error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
