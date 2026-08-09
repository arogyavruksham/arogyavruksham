import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/lib/supabase/server'

// Initialize the Google Gen AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get basic context about the store to feed to the AI
    const { data: products } = await supabase.from('products').select('title, price, stock_count, description').limit(10)
    
    const storeContext = `
You are the Arogyavruksham AI Assistant. Your job is to help customers with their queries about our premium Indian Plants.
Be friendly, concise, and helpful. You can also share general botanical and Ayurvedic knowledge.
Here are some of our popular products:
${(products || []).map((p: any) => `- ${p.title}: ₹${p.price} (${p.stock_count > 0 ? 'In Stock' : 'Out of Stock'}) - ${p.description?.substring(0, 50)}...`).join('\n')}

Important Policies:
- Free delivery on all orders
- Orders can be cancelled from the 'My Profile' page before they are shipped.
- Contact support at: support@arogyavruksham.com
`

    // Format history for Gemini
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    // Add context to the first user message if history is empty, otherwise we rely on system prompt if supported
    // But since `systemInstruction` is supported in `gemini-2.5-flash`:
    
    let replyText = '';
    
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          config: {
              systemInstruction: storeContext,
              temperature: 0.7
          }
      })
      replyText = response.text || "I'm sorry, I couldn't understand that.";
    } catch(aiError) {
      console.error("AI Error:", aiError)
      replyText = "I'm currently experiencing technical difficulties. Please try again later."
    }

    // Log the session and messages in the database
    // We will simplify: just fetch the latest active session for this user in the last 2 hours, or create one.
    // If anonymous, we can use a session cookie, but for simplicity we'll just create a new session if none provided in request.
    
    const userId = user?.id || null;
    let sessionId = null;
    
    // Find a recent session
    const { data: recentSession } = await (supabase as any)
      .from('chat_sessions')
      .select('id')
      .eq(userId ? 'user_id' : 'id', userId || '00000000-0000-0000-0000-000000000000') // Dummy if anonymous and no session handling implemented
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
      // Insert user message
      await (supabase as any).from('chat_messages').insert({ session_id: sessionId, role: 'user', content: message })
      // Insert bot message
      await (supabase as any).from('chat_messages').insert({ session_id: sessionId, role: 'model', content: replyText })
    }

    return NextResponse.json({ reply: replyText })

  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
