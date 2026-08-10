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

    // Fetch data for the last 24 hours
    const yesterday = new Date()
    yesterday.setHours(yesterday.getHours() - 24)
    const yesterdayIso = yesterday.toISOString()

    const [
      { data: orders },
      { data: customers },
      { data: chats },
      { data: lowStock }
    ] = await Promise.all([
      (supabaseAdmin as any).from('orders').select('id, total_amount, status, created_at').gte('created_at', yesterdayIso),
      (supabaseAdmin as any).from('users').select('id, name, created_at').gte('created_at', yesterdayIso),
      (supabaseAdmin as any).from('chat_messages').select('role, content, created_at').gte('created_at', yesterdayIso),
      (supabaseAdmin as any).from('products').select('title, stock_count').lte('stock_count', 5)
    ])

    const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

    const systemPrompt = `You are the Autonomous Personal Manager AI for 'Arogyavruksham', a premium Indian plant store.
Your job is to actively monitor the store and report back to the store owner with real-time, critical insights based on the last 24 hours of data.
Be highly direct, actionable, and agentic. 

CRITICAL INSTRUCTION: If there are ANY low stock items (<= 5), you MUST start your response with a highly visible alert section about them.

Use the following format:
## 🚨 Urgent Alerts (Only if there is low stock, otherwise skip)
List the exact low stock items and emphasize the urgency to restock.

## 📊 Live Monitoring Update
Brief summary of sales velocity and customer acquisition.

## 💬 Customer Intel
What are customers asking about in the chat? What is the general sentiment?

## 🎯 Agent's Recommendations
Provide 1-2 highly specific, actionable business suggestions based on this exact data (e.g. "Run a flash sale on X since it's popular" or "Restock Y immediately").

### Raw Data Provided:
- **Orders in last 24h**: ${(orders || []).length}
- **Revenue in last 24h**: ₹${totalRevenue}
- **New Customers in last 24h**: ${(customers || []).length}
- **Low Stock Items (<= 5)**: ${(lowStock || []).map((p: any) => `${p.title} (${p.stock_count} left)`).join(', ') || 'None'}
- **Chat Messages (Sample)**:
${(chats || []).slice(0, 50).map((c: any) => `[${c.role.toUpperCase()}]: ${c.content}`).join('\n')}
`

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
    })

    const { text } = await generateText({
      model: openrouter('openai/gpt-oss-20b:free'),
      system: systemPrompt,
      prompt: 'Please generate the executive summary based on the provided data.',
    });

    return NextResponse.json({ summary: text })

  } catch (error: any) {
    console.error('Chat Summary error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
