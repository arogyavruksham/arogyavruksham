import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxifzmurtlhrzkymbhmc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4aWZ6bXVydGxocnpreW1iaG1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDcwMDEzNiwiZXhwIjoyMTAwMjc2MTM2fQ.N04ZtBcTV3IVzQ-8A7zMmB1xPOeMwEc6yQpyEWvorIU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error: err1 } = await supabase.from('users').select('*');
  console.log('USERS:', users);
  
  const { data: orders, error: err2 } = await supabase.from('orders').select('*');
  console.log('ORDERS:', orders);
}

check();
