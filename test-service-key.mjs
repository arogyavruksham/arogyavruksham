import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('orders').select('*')
  console.log('Data:', data)
  console.log('Error:', error)
}
test()
