export async function POST(request) {
  try {
    const { prompt, bookId, pageIndex, zone = 'elephant', kind } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    // Gemini image generation via OpenRouter chat/completions.
    const openrouterKey = process.env.OPENROUTER_API_KEY
    if (!openrouterKey) return Response.json({ error: 'Missing OPENROUTER_API_KEY' }, { status: 500 })
    // Use a known-available Gemini image model on OpenRouter.
    // Models page: https://openrouter.ai/google
    // Gemini 3.1 Flash Image Preview is sometimes flaky; use 2.5 Flash Image by default.
    const imageModel = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image'

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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'mini-minds',
      },
      body: JSON.stringify({
        model: imageModel,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
        image_config: {
          aspect_ratio: '1:1',
          image_size: '1K',
        },
        stream: false,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter image error:', response.status, err)
      return Response.json(
        {
          error: 'Image generation failed',
          ...(process.env.NODE_ENV !== 'production' ? { status: response.status, details: err } : {}),
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url
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
  } catch (err) {
    console.error('API /generate-image error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
