const VOICE_ID = '2OEeJcYw2f3bWMzzjVMU'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text) return new Response('Missing text', { status: 400 })

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('ElevenLabs API error:', res.status, err)
      return new Response('TTS failed', { status: res.status })
    }

    const audio = await res.arrayBuffer()
    return new Response(audio, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch (err) {
    console.error('API /speak error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
