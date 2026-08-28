import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch all homepage images
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('homepage_images')
      .select('*')
      .order('id')

    if (error) {
      // Table might not exist — return empty with setup hint
      return NextResponse.json({ data: [], needsSetup: true, error: error.message })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, data: [], needsSetup: true })
  }
}

// POST: Upsert a homepage image
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, image_url, alt_text } = body

    if (!id || !image_url) {
      return NextResponse.json({ error: 'id and image_url are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_images')
      .upsert(
        {
          id,
          image_url,
          alt_text: alt_text || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: Remove a homepage image override (reverts to default)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('homepage_images')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
