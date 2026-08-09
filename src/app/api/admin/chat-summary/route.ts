import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Basic admin check (could be improved with robust role checks)
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { transcript } = await req.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const prompt = `
You are an executive assistant for the Arogyavruksham store administrator.
Read the following chat logs between our customers and our AI support bot from today.

Please provide a concise, bulleted executive summary covering:
1. **Key Inquiries:** What are customers asking about most? (e.g., specific products, policies, delivery).
2. **Issues/Complaints:** Were there any negative experiences or failed answers?
3. **Actionable Insights:** What should the store admin do based on these conversations?

Keep it professional and easy to read.

Here are the logs:
${transcript}
`

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    })

    return NextResponse.json({ summary: response.text })

  } catch (error: any) {
    console.error('Chat Summary error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
