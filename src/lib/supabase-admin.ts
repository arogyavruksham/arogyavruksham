import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_build_key_for_vercel_do_not_use'

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)
