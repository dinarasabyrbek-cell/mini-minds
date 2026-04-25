const VOICE_ID = '2OEeJcYw2f3bWMzzjVMU'

export async function POST(request) {
  try {
    const { text } = await request.json()
    if (!text) return new Response('Missing text', { status: 400 })

    const kieKey = process.env.KIE_API_KEY
    if (!kieKey) return new Response('Missing KIE_API_KEY', { status: 500 })

    /* ── 1. Create the TTS task ── */
    const createRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kieKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'elevenlabs/text-to-speech-multilingual-v2',
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

    if (!createRes.ok || createJson?.code !== 200) {
      const details = JSON.stringify(createJson)
      console.error('KIE createTask error:', createRes.status, details)
      return new Response('TTS failed', { status: 500 })
    }

    const taskId = createJson?.data?.taskId
    if (!taskId) return new Response('Missing taskId', { status: 500 })

    /* ── 2. Poll until done ── */
    const deadline = Date.now() + 120_000
    let attempt = 0

    while (Date.now() < deadline) {
      attempt++
      await new Promise(r => setTimeout(r, Math.min(1500 + attempt * 600, 6000)))

      const infoRes = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${kieKey}` } }
      )
      const info = await infoRes.json().catch(() => null)
      const state = info?.data?.state

      if (state === 'fail') {
        console.error('KIE task failed:', info?.data?.failMsg)
        return new Response('TTS task failed', { status: 500 })
      }

      if (state === 'success') {
        let result = null
        try { result = JSON.parse(info?.data?.resultJson) } catch {}
        const audioUrl = result?.resultUrls?.[0]
        if (!audioUrl) return new Response('No audio URL returned', { status: 500 })

        const audioRes = await fetch(audioUrl)
        if (!audioRes.ok) return new Response('Failed to download audio', { status: 502 })

        const audio = await audioRes.arrayBuffer()
        return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg' } })
      }
    }

    return new Response('TTS timed out', { status: 504 })
  } catch (err) {
    console.error('API /speak error:', err)
    return new Response('Internal error', { status: 500 })
  }
}
