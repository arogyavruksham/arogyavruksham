import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const message = lastMessage?.content || (lastMessage?.parts ? lastMessage.parts.map((p: any) => p.text).join('') : '')

    let clientUserEmail = null;
    if (lastMessage?.id?.startsWith('useremail_')) {
      clientUserEmail = decodeURIComponent(lastMessage.id.split('_')[1]);
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let finalUserId = user?.id || null;
    if (!finalUserId && clientUserEmail) {
      // Look up user ID from the public users table based on email
      const { data: userData } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('email', clientUserEmail)
        .single();
      if (userData?.id) {
        finalUserId = userData.id;
      }
    }

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get basic context about the store to feed to the AI
    const { data: products } = await supabase.from('products').select('title, price, stock_count, description').limit(20)

    // Fetch user's recent orders if logged in
    let userContextText = ""
    if (finalUserId) {
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          total_amount, 
          status, 
          order_items (
            quantity, 
            price_at_time, 
            products (title)
          )
        `)
        .eq('user_id', finalUserId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (orders && orders.length > 0) {
        userContextText = `[SYSTEM: The user IS currently logged in. Here are their recent orders:]\n` + orders.map((o: any) => 
          `Order ID: ${o.id.split('-')[0]}... | Date: ${new Date(o.created_at).toLocaleDateString()} | Status: ${o.status.toUpperCase()} | Total: ₹${o.total_amount}\n` +
          `Items: ${o.order_items.map((i: any) => `${i.quantity}x ${i.products?.title || 'Unknown Plant'}`).join(', ')}`
        ).join('\n\n')
      } else {
        userContextText = "[SYSTEM: The user IS logged in, but they have zero past orders in the database. Tell them they haven't placed any orders yet.]"
      }
    } else {
      userContextText = "[SYSTEM: The user is NOT logged in. Tell them they need to log in to view their orders.]"
    }

    // Initialize OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
    })

    const systemPrompt = `You are the botanical assistant for Arogyavruksham, a premium Indian plant store.
You help customers with their inquiries about plants, orders, and store policies.
Keep your answers helpful, friendly, and concise.
CRITICAL INSTRUCTION: You DO have direct access to the user's live order data, which is provided to you dynamically in the "User Context" section below. NEVER say you don't have access. Use the provided User Context to give exact updates on their order status, items, and totals.

Store Context:
- Free delivery on all orders. Shipping takes 3-5 business days.
- Cancellations are allowed from 'My Profile' > 'My Orders' if still processing. No refunds after shipping.
- Accept all major credit/debit cards and UPI via Razorpay. No Cash on Delivery (COD).
- No returns due to the nature of live plants. If damaged, customers must email support@arogyavruksham.com within 24 hours with photos for a replacement.
- Support Email: support@arogyavruksham.com

Current Top Plants in Stock:
${(products || []).map((p: any) => `- ${p.title} (₹${p.price}) - ${p.stock_count > 0 ? 'In Stock' : 'Out of Stock'}\n  Description: ${p.description}`).join('\n')}

User Context:
${userContextText}
`

    // Find or create session for logging
    const userId = finalUserId || null;
    let sessionId = null;
    const { data: recentSession } = await (supabase as any)
      .from('chat_sessions')
      .select('id')
      .eq(userId ? 'user_id' : 'id', userId || '00000000-0000-0000-0000-000000000000')
      .order('last_activity', { ascending: false })
      .limit(1)
      .single()

    if (recentSession && userId) {
      sessionId = (recentSession as any).id
      await (supabase as any).from('chat_sessions').update({ last_activity: new Date().toISOString() }).eq('id', sessionId)
    } else {
      const { data: newSession } = await (supabase as any).from('chat_sessions').insert({ user_id: userId }).select('id').single()
      sessionId = (newSession as any)?.id
    }

    if (sessionId) {
      await (supabase as any).from('chat_messages').insert({ session_id: sessionId, role: 'user', content: message })
    }

    // Stream the response
    const coreMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content || (m.parts ? m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('') : '')
    }))

    const result = await streamText({
      model: openrouter('openrouter/free'),
      system: systemPrompt,
      messages: coreMessages,
      async onFinish({ text }) {
        if (sessionId) {
          await (supabase as any).from('chat_messages').insert({ session_id: sessionId, role: 'model', content: text })
        }
      }
    });

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
