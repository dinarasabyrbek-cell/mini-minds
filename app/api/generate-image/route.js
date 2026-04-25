export async function POST(request) {
  try {
    const { prompt } = await request.json()
    if (!prompt) return Response.json({ error: 'Missing prompt' }, { status: 400 })

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/dall-e-2',
        prompt,
        n: 1,
        size: '512x512',
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Image gen error:', response.status, err)
      return Response.json({ error: 'Image generation failed' }, { status: response.status })
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url
    if (!imageUrl) return Response.json({ error: 'No image returned' }, { status: 500 })

    return Response.json({ imageUrl })
  } catch (err) {
    console.error('API /generate-image error:', err)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
