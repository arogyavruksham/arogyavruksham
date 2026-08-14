import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference_id, code, phone } = body;

    if (!reference_id || !code) {
      return NextResponse.json({ error: 'Reference ID and verification code are required.' }, { status: 400 });
    }

    // Call GetOTP Verify endpoint using GET
    const response = await fetch(`https://api.otp.dev/v1/verifications?code=${code}&phone=${phone}`, {
      method: 'GET',
      headers: {
        'X-OTP-Key': process.env.GETOTP_API_KEY || '',
        'accept': 'application/json',
      }
    });

    const result = await response.json();
    
    // If the data array is not empty, the OTP is valid
    if (result?.data?.data && Array.isArray(result.data.data) && result.data.data.length > 0) {
      // ✅ OTP is valid! Register or fetch user
      let userRole = 'user';
      let fullName = 'Member';
      let userEmail = '';
      
      if (phone) {
        try {
          const { data, error: dbErr } = await supabaseAdmin
            .from('users')
            .select('role, full_name, email')
            .eq('phone', phone)
            .maybeSingle();

          const userData = data as any;

          if (userData) {
            userRole = userData.role || 'user';
            fullName = userData.full_name || fullName;
            userEmail = userData.email || '';
          } else {
            // Automatically register new user with phone
            await supabaseAdmin.from('users').insert([
              {
                phone: phone,
                full_name: fullName,
                role: 'user',
              }
            ] as any);
          }
        } catch (dbErr) {
          console.warn('Database lookup during Phone OTP verify notice:', dbErr);
        }
      }

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
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error in verify-phone-otp endpoint:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
}
