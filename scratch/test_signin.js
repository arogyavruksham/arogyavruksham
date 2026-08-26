const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
const processEnv = {};
for (const line of env) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    processEnv[key.trim()] = rest.join('=').trim();
  }
}

const supabase = createClient(processEnv.NEXT_PUBLIC_SUPABASE_URL, processEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const phone = '+919966789855';
  const password = 'testPasswordAa1!';
  
  console.log('Attempting to sign in with phone and password...');
  const { data, error } = await supabase.auth.signInWithPassword({
    phone,
    password
  });
  
  console.log('SignInResult:', data.user ? 'Success' : 'Failed', error);
  
  console.log('Attempting to sign in with email and password...');
  const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({
    email: 'saivashisht2010123@gmail.com',
    password
  });
  
  console.log('SignInResult (email):', d2.user ? 'Success' : 'Failed', e2);
}
test();
