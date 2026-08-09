import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Basic admin check (could be improved with robust role checks)
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if ((profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { transcript } = await req.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Simple rule-based summary since AI API is not used
    const lines = transcript.split('\n');
    const userMessageCount = lines.filter((l: string) => l.startsWith('User:')).length;

    const summaryText = `
**Rule-Based AI Summary Fallback**
(AI generation is disabled to avoid API costs/errors)

- **Total Messages Exchanged Today**: ${lines.length}
- **Questions Asked by Users**: ${userMessageCount}

*Tip: Scroll down to view the raw conversation logs below.*
    `;

    return NextResponse.json({ summary: summaryText })

  } catch (error: any) {
    console.error('Chat Summary error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
