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
      { data: allOrders },
      { data: recentOrders },
      { data: customers },
      { data: chats },
      { data: chatSessions },
      { data: lowStock },
      { data: products },
      { data: pendingOrders }
    ] = await Promise.all([
      (supabaseAdmin as any).from('orders').select('id, total_amount, status, payment_method, created_at, shipping_address, users(full_name, email)').order('created_at', { ascending: false }),
      (supabaseAdmin as any).from('orders').select('id, total_amount, status, payment_method, created_at, shipping_address, users(full_name, email)').gte('created_at', yesterdayIso).order('created_at', { ascending: false }),
      (supabaseAdmin as any).from('users').select('id, full_name, created_at').gte('created_at', yesterdayIso),
      (supabaseAdmin as any).from('chat_messages').select('role, content, created_at, session_id').gte('created_at', yesterdayIso).order('created_at', { ascending: false }),
      (supabaseAdmin as any).from('chat_sessions').select('id, created_at').gte('created_at', yesterdayIso),
      (supabaseAdmin as any).from('products').select('title, stock_count').lte('stock_count', 5),
      (supabaseAdmin as any).from('products').select('id, title, stock_count, price, actual_price, image_url').order('stock_count', { ascending: true }),
      (supabaseAdmin as any).from('orders').select('id, total_amount, status, payment_method, created_at, shipping_address, users(full_name, email)').in('status', ['pending', 'paid']).order('created_at', { ascending: false })
    ])

    const recentRevenue = (recentOrders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
    const totalRevenue = (allOrders || []).reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
    const codOrders = (recentOrders || []).filter((o: any) => o.payment_method === 'Cash on Delivery')
    const prepaidOrders = (recentOrders || []).filter((o: any) => o.payment_method !== 'Cash on Delivery')

    // Build pending/unchecked orders detail
    const uncheckedDetail = (pendingOrders || []).slice(0, 10).map((o: any) => {
      const timeAgo = Math.round((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60))
      return `- Order #${o.id.split('-')[0].toUpperCase()} | ${o.users?.full_name || 'Customer'} | ₹${o.total_amount} | ${o.payment_method || 'Online'} | ${timeAgo}h ago | Status: ${o.status}`
    }).join('\n')

    // Build chat message samples
    const chatSamples = (chats || []).slice(0, 30).map((c: any) => `[${c.role.toUpperCase()}]: ${c.content}`).join('\n')

    // Products catalog summary
    const lowStockStr = (lowStock || []).map((p: any) => p.title + ' (' + p.stock_count + ' left)').join(', ') || 'None'
    const totalProducts = (products || []).length
    const outOfStock = (products || []).filter((p: any) => (p.stock_count || 0) === 0).length
    const lowStockCount = (lowStock || []).length

    const systemPrompt = `You are the AI Command Center for 'Arogyavruksham', a premium Indian plant store that sells plants, seeds, and gardening supplies online.

Your job is to analyze ALL the provided data and return a COMPREHENSIVE business intelligence report as a VALID JSON object.

CRITICAL: Your response must be ONLY a valid JSON object. No markdown, no code fences, no explanation outside JSON.

The JSON must have this exact structure:
{
  "urgentAlerts": [
    { "type": "low_stock" | "unchecked_order" | "payment" | "warning", "title": "...", "description": "...", "severity": "critical" | "warning" | "info" }
  ],
  "ordersSummary": {
    "total24h": number,
    "revenue24h": number,
    "pendingCount": number,
    "codCount": number,
    "prepaidCount": number,
    "deliveredCount": number,
    "insight": "One sentence about order trends"
  },
  "uncheckedOrders": [
    { "orderId": "...", "customerName": "...", "amount": number, "paymentMethod": "...", "hoursAgo": number, "status": "..." }
  ],
  "customerIntel": {
    "newCustomers24h": number,
    "chatSessions24h": number,
    "totalMessages24h": number,
    "sentiment": "positive" | "neutral" | "negative" | "mixed",
    "topQuestions": ["question1", "question2", "question3"],
    "insight": "One paragraph about customer behavior"
  },
  "chatHighlights": [
    { "role": "user" | "model", "content": "...", "timeAgo": "..." }
  ],
  "websiteImprovements": [
    { "category": "SEO" | "UX" | "Products" | "Marketing" | "Performance", "title": "...", "description": "...", "priority": "high" | "medium" | "low" }
  ],
  "recommendations": [
    { "priority": 1, "title": "...", "description": "...", "action": "..." }
  ]
}

### Raw Data:
- **All-time Total Orders**: ${(allOrders || []).length}
- **All-time Total Revenue**: ₹${totalRevenue}
- **Orders in last 24h**: ${(recentOrders || []).length}
- **Revenue in last 24h**: ₹${recentRevenue}
- **COD Orders (24h)**: ${codOrders.length}
- **Prepaid Orders (24h)**: ${prepaidOrders.length}
- **Delivered (all-time)**: ${(allOrders || []).filter((o: any) => o.status === 'delivered').length}
- **Pending/Unchecked Orders**: ${(pendingOrders || []).length}
- **New Customers in last 24h**: ${(customers || []).length}
- **Chat Sessions (24h)**: ${(chatSessions || []).length}
- **Chat Messages (24h)**: ${(chats || []).length}
- **Total Products in Catalog**: ${totalProducts}
- **Out of Stock Products**: ${outOfStock}
- **Low Stock Items (<= 5)**: ${lowStockStr}

### Unchecked/Pending Orders Detail:
${uncheckedDetail || 'No pending orders'}

### Recent Chat Messages (Sample):
${chatSamples || 'No chat messages in last 24h'}

IMPORTANT RULES:
1. If there are low stock items, always include them as urgent alerts with severity "critical"
2. If there are unchecked/pending orders, include them as urgent alerts AND in the uncheckedOrders array
3. For websiteImprovements, provide at least 4-6 realistic, specific suggestions based on what you know about an Indian plant e-commerce store
4. For recommendations, provide exactly 3 actionable suggestions ranked by priority
5. For chatHighlights, include up to 5 most interesting/notable customer messages
6. Keep all text concise and actionable
7. Return ONLY the JSON object, nothing else`

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
    })

    const { text } = await generateText({
      model: openrouter('z-ai/glm-5.2:free'),
      system: systemPrompt,
      prompt: 'Analyze the data and generate the comprehensive business intelligence JSON report now.',
    });

    // Try to parse as JSON, fallback to raw text
    let parsed = null
    try {
      // Try to extract JSON from the response (handle possible markdown wrapping)
      let jsonStr = text.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(jsonStr)
    } catch {
      // If JSON parsing fails, return raw text as fallback
      parsed = null
    }

    // Also pass raw stats for the stat cards (independent of AI)
    const rawStats = {
      orders24h: (recentOrders || []).length,
      revenue24h: recentRevenue,
      newCustomers24h: (customers || []).length,
      chatSessions24h: (chatSessions || []).length,
      chatMessages24h: (chats || []).length,
      pendingOrders: (pendingOrders || []).length,
      lowStockItems: lowStockCount,
      totalProducts,
      outOfStock,
      totalOrders: (allOrders || []).length,
      totalRevenue,
      codOrders24h: codOrders.length,
      prepaidOrders24h: prepaidOrders.length,
      pendingOrdersList: (pendingOrders || []).slice(0, 10).map((o: any) => ({
        id: o.id,
        shortId: o.id.split('-')[0].toUpperCase(),
        customerName: o.users?.full_name || 'Customer',
        amount: o.total_amount,
        paymentMethod: o.payment_method || 'Online',
        status: o.status,
        createdAt: o.created_at,
        hoursAgo: Math.round((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60))
      })),
      recentChats: (chats || []).slice(0, 15).map((c: any) => ({
        role: c.role,
        content: c.content.substring(0, 200),
        createdAt: c.created_at
      })),
      lowStockProducts: (lowStock || []).map((p: any) => ({
        title: p.title,
        stockCount: p.stock_count
      }))
    }

    return NextResponse.json({ 
      summary: text, 
      structured: parsed,
      stats: rawStats
    })

  } catch (error: any) {
    console.error('Command Center error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
