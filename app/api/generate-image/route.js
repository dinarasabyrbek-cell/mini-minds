export async function POST(request) {
  try {
    const { prompt } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    // KIE task-based image generation (GPT Image 2).
    // Create task → poll recordInfo → return the first result URL.
    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) return Response.json({ error: 'Missing KIE_API_KEY' }, { status: 500 })

    const createRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2-text-to-image',
        input: {
          prompt,
          aspect_ratio: '1:1',
          resolution: '1K',
        },
      }),
    })

    const createJson = await createRes.json().catch(() => null)
    const taskId = createJson?.data?.taskId
    if (!createRes.ok || !taskId) {
      const details = createJson ? JSON.stringify(createJson) : await createRes.text().catch(() => '')
      console.error('KIE createTask error:', createRes.status, details)
      return Response.json(
        {
          error: 'Image generation failed',
          ...(process.env.NODE_ENV !== 'production' ? { status: createRes.status, details } : {}),
        },
        { status: createRes.status || 500 }
      )
    }

    const startedAt = Date.now()
    // KIE tasks can take a while depending on queue/credits.
    const timeoutMs = 240_000
    let attempt = 0

    while (Date.now() - startedAt < timeoutMs) {
      attempt++
      const waitMs = Math.min(2000 + attempt * 900, 12000)
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
            error: 'Image generation failed',
            ...(process.env.NODE_ENV !== 'production' ? { details: failMsg } : {}),
          },
          { status: 500 }
        )
      }

      if (state === 'success') {
        const resultJsonStr = infoJson?.data?.resultJson
        let result
        try { result = resultJsonStr ? JSON.parse(resultJsonStr) : null } catch { result = null }
        const imageUrl = result?.resultUrls?.[0] || null
        if (!imageUrl) return Response.json({ error: 'No image returned' }, { status: 500 })
        return Response.json({ imageUrl })
      }
    }

    return Response.json({ error: 'Image generation timed out' }, { status: 504 })
  } catch (err) {
    console.error('API /generate-image error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
