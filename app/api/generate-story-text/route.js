export async function POST(request) {
  try {
    const { bookId, title, ageGroup, pageCount } = await request.json()

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        messages: [{
          role: 'user',
          content: `Write a simplified children's version of "${title}" for age group ${ageGroup}.
Split it into exactly ${pageCount} pages.
${ageGroup === '3-5'
  ? 'Use very short simple sentences, maximum 2 sentences per page, simple vocabulary, warm and gentle tone.'
  : 'Use slightly longer sentences, maximum 4 sentences per page, slightly richer vocabulary, engaging storytelling tone.'}
Return ONLY a JSON array of ${pageCount} objects like this:
[{"page": 1, "text": "story text here"}, ...]
No extra text, no markdown, just the JSON array.`,
        }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Story gen error:', response.status, err)
      return Response.json({ error: 'Story generation failed' }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const clean   = content.replace(/```json|```/g, '').trim()

    let pages
    try { pages = JSON.parse(clean) } catch {
      return Response.json({ error: 'Failed to parse story JSON' }, { status: 500 })
    }

    return Response.json({ pages })
  } catch (err) {
    console.error('API /generate-story-text error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
