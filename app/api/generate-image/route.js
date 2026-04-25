export async function POST(request) {
  try {
    const { prompt, bookId, pageIndex, zone = 'elephant', kind } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    // KIE task-based image generation (GPT Image 2).
    // Create task → poll recordInfo → return the first result URL.
    const apiKey = process.env.KIE_API_KEY
    if (!apiKey) return Response.json({ error: 'Missing KIE_API_KEY' }, { status: 500 })

    // Shared Supabase cache: if present, return immediately.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnon && bookId && Number.isInteger(pageIndex)) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(supabaseUrl, supabaseAnon)
        const k = kind || (pageIndex === 0 ? 'cover' : 'page')

        const { data: existing, error: readErr } = await sb
          .from('image_cache')
          .select('image_url')
          .eq('zone', zone)
          .eq('book_id', String(bookId))
          .eq('page_index', pageIndex)
          .eq('kind', k)
          .maybeSingle()

        if (!readErr && existing?.image_url) {
          return Response.json({ imageUrl: existing.image_url, cached: true })
        }
      } catch (e) {
        // If Supabase is misconfigured, fall back to generation.
        console.error('Supabase cache read error:', e)
      }
    }

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
      // Make it obvious in dev when credits are out so the UI can show a stable fallback.
      if (createJson?.code === 402) {
        return Response.json(
          {
            error: 'Credits insufficient',
            ...(process.env.NODE_ENV !== 'production' ? { details } : {}),
          },
          { status: 402 }
        )
      }
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

        // Best-effort: persist into shared Supabase cache.
        if (supabaseUrl && supabaseAnon && bookId && Number.isInteger(pageIndex)) {
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const sb = createClient(supabaseUrl, supabaseAnon)
            const k = kind || (pageIndex === 0 ? 'cover' : 'page')
            await sb.from('image_cache').upsert({
              zone,
              book_id: String(bookId),
              page_index: pageIndex,
              kind: k,
              image_url: imageUrl,
              prompt,
            }, { onConflict: 'zone,book_id,page_index,kind' })
          } catch (e) {
            console.error('Supabase cache write error:', e)
          }
        }

        return Response.json({ imageUrl })
      }
    }

    return Response.json({ error: 'Image generation timed out' }, { status: 504 })
  } catch (err) {
    console.error('API /generate-image error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
