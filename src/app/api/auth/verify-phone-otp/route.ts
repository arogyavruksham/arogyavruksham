import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference_id, code, phone } = body;

    if (!reference_id || !code) {
      return NextResponse.json({ error: 'Reference ID and verification code are required.' }, { status: 400 });
    }

    // Call GetOTP Verify endpoint using GET. Omit phone from query to avoid strict matching failures.
    const response = await fetch(`https://api.otp.dev/v1/verifications?code=${code}`, {
      method: 'GET',
      headers: {
        'X-OTP-Key': process.env.GETOTP_API_KEY || '',
        'accept': 'application/json',
      }
    });

    const result = await response.json();
    
    // GetOTP returns errors at the root level when failing, e.g., { errors: [...] }
    if (result.errors && Array.isArray(result.errors)) {
       console.error("GetOTP Verify API Error:", result);
       const errorMsg = result.errors[0]?.message || 'Verification API Error';
       return NextResponse.json({ success: false, message: `GetOTP Error: ${errorMsg}` }, { status: 400 });
    }
    
    // The GetOTP API returns the array in result.data directly
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      // Find a verification that matches the phone number (to handle formatting differences)
      // The user's phone state might be e.g. 9966789855, but GetOTP might have stored 919966789855
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanPhoneTrimmed = cleanPhone.startsWith('91') ? cleanPhone.substring(2) : cleanPhone;
      
      const matchedVerification = result.data.find((v: any) => {
         const vPhone = (v.phone || '').replace(/\D/g, '');
         return vPhone.includes(cleanPhoneTrimmed);
      });

      if (matchedVerification) {
        // ✅ OTP is valid! Register or fetch user
      let userRole = 'user';
      let fullName = 'Member';
      let userEmail = '';
      
      if (phone) {
        try {
          const dbPhoneVariations = [phone];
          if (!phone.startsWith('+')) {
            dbPhoneVariations.push(`+${phone}`);
          } else {
            dbPhoneVariations.push(phone.substring(1));
          }

          const { data, error: dbErr } = await supabaseAdmin
            .from('users')
            .select('role, full_name, email')
            .in('phone', dbPhoneVariations)
            .limit(1)
            .maybeSingle();

          const userData = data as any;

          if (userData) {
            userRole = userData.role || 'user';
            fullName = userData.full_name || fullName;
            userEmail = userData.email || '';
            
            return NextResponse.json({ 
              success: true, 
              message: 'OTP Verified Successfully',
              user: {
                phone: phone,
                name: fullName,
                email: userEmail,
                role: userRole,
              }
            });
          } else {
            // User not found in database, prompt frontend to ask for name
            return NextResponse.json({
              success: true,
              needsName: true,
              message: 'OTP Verified, but user is new',
              user: {
                phone: phone
              }
            });
          }
        } catch (dbErr) {
          console.warn('Database lookup during Phone OTP verify notice:', dbErr);
          return NextResponse.json({ error: 'Database lookup failed.' }, { status: 500 });
        }
      }

      // Fallback if no phone provided
      return NextResponse.json({ 
        success: true, 
        message: 'OTP Verified Successfully'
      });
      }
    }
    
    return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });

  } catch (error: any) {
    console.error('Error in verify-phone-otp endpoint:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
}
