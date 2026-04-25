export async function POST(request) {
  try {
    const { childName, emojis, ageGroup = '3-5', pageCount = 7, extra } = await request.json()

    if (!childName) return Response.json({ error: 'Missing childName' }, { status: 400 })
    if (!Array.isArray(emojis) || emojis.length === 0) {
      return Response.json({ error: 'Missing emojis' }, { status: 400 })
    }

    const model = process.env.OPENROUTER_TEXT_MODEL || 'google/gemini-2.5-flash'

    const prompt = `Create an original children's story for a child named "${childName}".
Use these emojis as story themes/objects: ${emojis.join(' ')}.
${extra ? `Extra notes: ${extra}` : ''}

Age group: ${ageGroup}.
Split it into exactly ${pageCount} pages.
${ageGroup === '3-5'
  ? 'Use very short simple sentences, maximum 2 sentences per page, simple vocabulary, warm and gentle tone.'
  : 'Use slightly longer sentences, maximum 4 sentences per page, slightly richer vocabulary, engaging storytelling tone.'}

Return ONLY JSON in this exact shape (no markdown):
{"title":"<short title>","pages":[{"page":1,"text":"..."}, ...]}
Rules:
- pages must be exactly ${pageCount} items
- page numbers must be 1..${pageCount}
- no extra keys`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'mini-minds',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Personal story gen error:', response.status, err)
      return Response.json({ error: 'Story generation failed' }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const clean = content.replace(/```json|```/g, '').trim()

    let parsed
    try { parsed = JSON.parse(clean) } catch {
      return Response.json({ error: 'Failed to parse story JSON' }, { status: 500 })
    }

    const title = typeof parsed?.title === 'string' ? parsed.title.trim() : ''
    const pages = Array.isArray(parsed?.pages) ? parsed.pages : null

    if (!title || !pages || pages.length !== pageCount) {
      return Response.json({ error: 'Invalid story format returned' }, { status: 500 })
    }

    return Response.json({ title, pages })
  } catch (err) {
    console.error('API /generate-personal-story error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

