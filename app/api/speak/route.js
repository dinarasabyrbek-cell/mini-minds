const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '2OEeJcYw2f3bWMzzjVMU'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text) return new Response('Missing text', { status: 400 })

    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) return Response.json({ error: 'Missing KIE_API_KEY' }, { status: 500 })

    // KIE task-based ElevenLabs TTS. Voice can be a voice ID.
    const model = process.env.KIE_TTS_MODEL || 'elevenlabs/text-to-speech-multilingual-v2'

    async function createTask(voice) {
      const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: {
            text,
            voice,
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            speed: 1,
          },
        }),
      })
      const json = await res.json().catch(() => null)
      return { res, json }
    }

    let { res: createRes, json: createJson } = await createTask(VOICE_ID)

    // KIE often returns HTTP 200 with a non-200 `code` in the JSON.
    if (!createRes.ok || createJson?.code !== 200) {
      const msg = createJson?.msg || ''
      const details = createJson ? JSON.stringify(createJson) : await createRes.text().catch(() => '')
      console.error('KIE TTS createTask error:', createRes.status, details)

      // Fallback: if this specific voice isn't allowed on KIE's ElevenLabs market model,
      // retry with a known-available preset voice so TTS still works.
      if (msg.toLowerCase().includes('voice') && msg.toLowerCase().includes('allowed')) {
        ;({ res: createRes, json: createJson } = await createTask('Rachel'))
      }
    }

    const taskId = createJson?.data?.taskId
    if (!createRes.ok || createJson?.code !== 200 || !taskId) {
      const details = createJson ? JSON.stringify(createJson) : await createRes.text().catch(() => '')
      return Response.json(
        {
          error: 'TTS failed',
          ...(process.env.NODE_ENV !== 'production' ? { status: createRes.status, details } : {}),
        },
        { status: 500 }
      )
    }

    const startedAt = Date.now()
    const timeoutMs = 120_000
    let attempt = 0

    while (Date.now() - startedAt < timeoutMs) {
      attempt++
      const waitMs = Math.min(1500 + attempt * 650, 6000)
      await new Promise(r => setTimeout(r, waitMs))

      const infoRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
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
