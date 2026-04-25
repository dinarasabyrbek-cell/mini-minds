export async function POST(request) {
  try {
    const { prompt, bookId, pageIndex, zone = 'elephant', kind } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })

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

    // ── Generate with Gemini ──
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini image error:', response.status, err)
      return Response.json({ error: 'Image generation failed' }, { status: response.status })
    }

    const data      = await response.json()
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
    if (!imagePart) return Response.json({ error: 'No image returned' }, { status: 500 })

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`

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
  } catch (err) {
    console.error('API /generate-image error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
