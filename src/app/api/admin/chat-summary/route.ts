import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      supabase.from('orders').select('id, total_amount, status, created_at').gte('created_at', yesterdayIso),
      supabase.from('users').select('id, name, created_at').gte('created_at', yesterdayIso),
      supabase.from('chat_messages').select('role, content, created_at').gte('created_at', yesterdayIso),
      supabase.from('products').select('title, stock_count').lte('stock_count', 5)
    ])

    const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)

    const systemPrompt = `You are an expert e-commerce business analyst for 'Arogyavruksham', a premium Indian plant store.
Analyze the following data from the past 24 hours and provide an Executive Summary for the business owner.
Be concise but insightful.

Use the following format:
## Daily Recap
Brief summary of sales and customer acquisition.

## Customer Insights
What are customers asking about in the chat? What is the general sentiment?

## Alerts & Suggestions
Highlight low stock items and provide 2-3 actionable business suggestions based on this data.

### Raw Data Provided:
- **Orders in last 24h**: ${(orders || []).length}
- **Revenue in last 24h**: ₹${totalRevenue}
- **New Customers in last 24h**: ${(customers || []).length}
- **Low Stock Items (<= 5)**: ${(lowStock || []).map((p: any) => `${p.title} (${p.stock_count} left)`).join(', ') || 'None'}
- **Chat Messages (Sample)**:
${(chats || []).slice(0, 50).map((c: any) => `[${c.role.toUpperCase()}]: ${c.content}`).join('\n')}
`

    const deepseek = createOpenAI({
      baseURL: 'https://api.deepseek.com/v1',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    })

    const { text } = await generateText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt,
      prompt: 'Please generate the executive summary based on the provided data.',
    });

    return NextResponse.json({ summary: text })

  } catch (error: any) {
    console.error('Chat Summary error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
