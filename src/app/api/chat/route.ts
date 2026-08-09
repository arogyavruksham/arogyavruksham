import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    let replyText = '';
    const userMsg = message.toLowerCase();

    // --- RULE-BASED LOGIC ---
    if (userMsg.includes('shipping') || userMsg.includes('delivery')) {
      replyText = "We offer free delivery on all our orders! Shipping usually takes 3-5 business days depending on your location. Our plants are carefully packaged to ensure they reach you in perfect health.";
    } else if (userMsg.includes('refund') || userMsg.includes('cancel')) {
      replyText = "You can easily cancel your order from the 'My Profile' > 'My Orders' section, provided the order is still processing. We do not offer refunds once an order has been shipped.";
    } else if (userMsg.includes('hello') || userMsg.includes('hi') || userMsg.includes('hey')) {
      replyText = "Hello there! Welcome to Arogyavruksham. I'm your botanical assistant. How can I help you with our premium Indian plants today?";
    } else if (userMsg.includes('plant') || userMsg.includes('buy') || userMsg.includes('shop')) {
      replyText = "We have a wide variety of premium, resilient Indian plants perfect for modern homes. Check out our latest collections in the 'Shop' section! Some of our top plants are: \n" + (products || []).map((p: any) => `- ${p.title} (₹${p.price})`).join('\n');
    } else if (userMsg.includes('contact') || userMsg.includes('support') || userMsg.includes('help')) {
      replyText = "If you need human assistance, our support team is always ready to help! You can reach us at support@arogyavruksham.com or message us on WhatsApp using the button on the screen.";
    } else if (userMsg.includes('thank')) {
      replyText = "You're very welcome! Let me know if there's anything else you need.";
    } else {
      replyText = "I'm sorry, I don't quite understand that. Since I am a simple rule-based assistant, you might want to try asking about 'shipping', 'refunds', or 'plants'. If you need more help, please contact our support team at support@arogyavruksham.com!";
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
