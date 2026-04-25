export async function POST(request) {
  try {
    const { prompt, bookId, pageIndex, zone = 'elephant', kind } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    const kieKey = process.env.KIE_API_KEY
    if (!kieKey) return Response.json({ error: 'Missing KIE_API_KEY' }, { status: 500 })

    // ── Supabase shared cache (check before generating) ──
    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseAnon && bookId && Number.isInteger(pageIndex)) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(supabaseUrl, supabaseAnon)
        const k  = kind || (pageIndex === 0 ? 'cover' : 'page')
        const { data: existing } = await sb
          .from('image_cache')
          .select('image_url')
          .eq('zone', zone).eq('book_id', String(bookId))
          .eq('page_index', pageIndex).eq('kind', k)
          .maybeSingle()
        if (existing?.image_url) return Response.json({ imageUrl: existing.image_url, cached: true })
      } catch (e) {
        console.error('Supabase cache read error:', e)
      }
    }

    // ── 1. Create KIE Gemini image task ──
    const createRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kieKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-image',
        input: { prompt },
      }),
    })

    const createJson = await createRes.json().catch(() => null)

    if (!createRes.ok || createJson?.code !== 200) {
      console.error('KIE image createTask error:', createRes.status, JSON.stringify(createJson))
      return Response.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const taskId = createJson?.data?.taskId
    if (!taskId) return Response.json({ error: 'Missing taskId' }, { status: 500 })

    // ── 2. Poll until done (max 2 minutes) ──
    const deadline = Date.now() + 120_000
    let attempt = 0

    while (Date.now() < deadline) {
      attempt++
      await new Promise(r => setTimeout(r, Math.min(2000 + attempt * 800, 8000)))

      const infoRes = await fetch(
        `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
        { headers: { Authorization: `Bearer ${kieKey}` } }
      )
      const info  = await infoRes.json().catch(() => null)
      const state = info?.data?.state

      if (state === 'fail') {
        console.error('KIE image task failed:', info?.data?.failMsg)
        return Response.json({ error: 'Image task failed' }, { status: 500 })
      }

      if (state === 'success') {
        let result = null
        try { result = JSON.parse(info?.data?.resultJson) } catch {}

        // KIE returns image URL in resultUrls array
        const imageUrl = result?.resultUrls?.[0] ?? result?.imageUrl ?? null
        if (!imageUrl) return Response.json({ error: 'No image URL returned' }, { status: 500 })

        // ── Supabase shared cache (write after generating) ──
        if (supabaseUrl && supabaseAnon && bookId && Number.isInteger(pageIndex)) {
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const sb = createClient(supabaseUrl, supabaseAnon)
            const k  = kind || (pageIndex === 0 ? 'cover' : 'page')
            await sb.from('image_cache').upsert(
              { zone, book_id: String(bookId), page_index: pageIndex, kind: k, image_url: imageUrl, prompt },
              { onConflict: 'zone,book_id,page_index,kind' }
            )
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
