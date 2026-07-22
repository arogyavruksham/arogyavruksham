import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibG5hYmp1cmpzcW9xdGl6aW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTg5MzQsImV4cCI6MjA5NjU5NDkzNH0.wv6IFSMUG6qsDi1jJ3rI326lKVjij3bBmuPw8YSKIkk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('admin_secrets').insert({ passcode: 'admin123' }).select()
  console.log('Data:', data)
  console.log('Error:', error)
}
test()
