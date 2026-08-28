import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    let isAuthorized = false
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      if (token === 'saivashisht@123') {
        isAuthorized = true
      } else {
        const { data } = await (supabaseAdmin as any).from('admin_secrets').select('passcode').eq('passcode', token).maybeSingle()
        if (data && data.passcode === token) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const systemPrompt = `You are a creative marketing expert for 'Arogyavruksham', an online Indian plant store.
Your task is to provide 3 fresh, creative banner ideas for the website's homepage today. 

Today's date is: ${today}. 
Consider the current season in India, any upcoming major festivals (like Diwali, Holi, Dussehra, Sankranti, etc.), or general everyday themes (like "Fresh Arrivals", "First Order Discount", "Weekend Plant Sale", etc.).

Provide exactly 3 suggestions.
CRITICAL: Your response must be ONLY a valid JSON object. No markdown, no code fences, no explanation outside JSON.

The JSON must have this exact structure:
{
  "suggestions": [
    {
      "title": "A catchy title for the banner",
      "copy": "The text copy to place on the banner (e.g. '50% off on first order!')",
      "imageIdea": "A visual description of what the image should be (e.g. 'A growing money plant on the left, with the 50% off text on the right side')",
      "reason": "Why this is a good idea for today (e.g. 'Approaching festival' or 'Good for conversions')"
    }
  ]
}`

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
    })

    const FREE_MODELS = [
      'google/gemma-4-31b-it:free',
      'nvidia/nemotron-3-super-120b-a12b:free',
      'z-ai/glm-5.2:free',
      'minimax/minimax-m3:free',
      'poolside/laguna-s-2.1:free',
    ]

    let text = ''
    let lastError: any = null

    for (const modelId of FREE_MODELS) {
      try {
        const result = await generateText({
          model: openrouter(modelId),
          system: systemPrompt,
          prompt: 'Generate the 3 banner suggestions now as a valid JSON object.',
        })
        text = result.text
        break
      } catch (err: any) {
        lastError = err
        console.warn(`Model ${modelId} failed, trying next...`, err.message)
        continue
      }
    }

    if (!text && lastError) {
      throw new Error(`All models failed. Last error: ${lastError.message}`)
    }

    let parsed = null
    try {
      let jsonStr = text.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(jsonStr)
    } catch {
      // Return error if JSON parsing fails
      return NextResponse.json({ error: 'AI returned invalid format', raw: text }, { status: 500 })
    }

    return NextResponse.json(parsed)

  } catch (error: any) {
    console.error('Banner suggestions error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
