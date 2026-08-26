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

const supabaseAdmin = createClient(processEnv.NEXT_PUBLIC_SUPABASE_URL, processEnv.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const phone = '919966789855';
  
  const dbPhoneVariations = [phone];
  if (!phone.startsWith('+')) {
    dbPhoneVariations.push(`+${phone}`);
  } else {
    dbPhoneVariations.push(phone.substring(1));
  }

  const { data: existingUser, error: queryErr } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .in('phone', dbPhoneVariations)
    .limit(1)
    .maybeSingle();

  console.log('existingUser:', existingUser);

  if (existingUser) {
    const password = 'testPasswordAa1!';
    console.log('Attempting to update user auth...');
    const { data: updateData, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { 
      password, 
      phone: dbPhoneVariations.find(p => p.startsWith('+')) || phone 
    });
    console.log('updateResultError:', updateErr);
  }
}
test();
