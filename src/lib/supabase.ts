import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibG5hYmp1cmpzcW9xdGl6aW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTg5MzQsImV4cCI6MjA5NjU5NDkzNH0.wv6IFSMUG6qsDi1jJ3rI326lKVjij3bBmuPw8YSKIkk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
