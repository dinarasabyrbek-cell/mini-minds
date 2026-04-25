const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '2OEeJcYw2f3bWMzzjVMU'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text) return new Response('Missing text', { status: 400 })

    const kieKey = process.env.KIE_API_KEY
    if (!kieKey) return Response.json({ error: 'Missing KIE_API_KEY' }, { status: 500 })

    // KIE task-based ElevenLabs TTS
    // Docs: https://docs.kie.ai/market/elevenlabs/text-to-speech-multilingual-v2
    const model = process.env.KIE_TTS_MODEL || 'elevenlabs/text-to-speech-multilingual-v2'

    const createRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kieKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: {
          text,
          voice: VOICE_ID,
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0,
          speed: 1,
        },
      }),
    })

    const createJson = await createRes.json().catch(() => null)

    // KIE can return HTTP 200 with failure in body.
    if (!createRes.ok || createJson?.code !== 200) {
      const msg = createJson?.msg || 'TTS createTask failed'
      const details = createJson ? JSON.stringify(createJson) : await createRes.text().catch(() => '')
      console.error('KIE TTS createTask error:', createRes.status, details)

      // If KIE rejects the voice ID, surface a clear error so you can pick an allowed voice.
      if (msg.toLowerCase().includes('voice') && msg.toLowerCase().includes('allowed')) {
        return Response.json(
          {
            error: 'Voice not allowed by KIE ElevenLabs model',
            voiceId: VOICE_ID,
            hint: 'KIE only supports a limited set of voices for its ElevenLabs marketplace models. Choose an allowed voice or use direct ElevenLabs.',
            ...(process.env.NODE_ENV !== 'production' ? { details } : {}),
          },
          { status: 400 }
        )
      }

      return Response.json(
        {
          error: 'TTS failed',
          ...(process.env.NODE_ENV !== 'production' ? { status: createRes.status, details } : {}),
        },
        { status: 500 }
      )
    }

    const taskId = createJson?.data?.taskId
    if (!taskId) return Response.json({ error: 'Missing taskId' }, { status: 500 })

    const startedAt = Date.now()
    const timeoutMs = 120_000
    let attempt = 0

    while (Date.now() - startedAt < timeoutMs) {
      attempt++
      const waitMs = Math.min(1500 + attempt * 650, 6000)
      await new Promise(r => setTimeout(r, waitMs))

      const infoRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${kieKey}` },
      })
      const infoJson = await infoRes.json().catch(() => null)
      const state = infoJson?.data?.state

      if (!infoRes.ok) continue

      if (state === 'fail') {
        const failMsg = infoJson?.data?.failMsg || 'Task failed'
        return Response.json(
          {
            error: 'TTS failed',
            ...(process.env.NODE_ENV !== 'production' ? { details: failMsg } : {}),
          },
          { status: 500 }
        )
      }

      if (state === 'success') {
        const resultJsonStr = infoJson?.data?.resultJson
        let result
        try { result = resultJsonStr ? JSON.parse(resultJsonStr) : null } catch { result = null }
        const audioUrl = result?.resultUrls?.[0] || null
        if (!audioUrl) return Response.json({ error: 'No audio returned' }, { status: 500 })

        const audioRes = await fetch(audioUrl)
        if (!audioRes.ok) return Response.json({ error: 'Failed to download audio' }, { status: 502 })
        const audio = await audioRes.arrayBuffer()
        return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } })
      }
    }

    return Response.json({ error: 'TTS timed out' }, { status: 504 })
  } catch (err) {
    console.error('API /speak error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
