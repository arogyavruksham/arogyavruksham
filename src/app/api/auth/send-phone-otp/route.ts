import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, channel } = body;
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // channel can be 'sms' or 'whatsapp'
    const selectedChannel = channel || 'sms'; 

    const response = await fetch('https://api.otp.dev/v1/verifications', {
      method: 'POST',
      headers: {
        'X-OTP-Key': process.env.GETOTP_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          channel: selectedChannel,
          sender: 'Arogya', // Your sender name
          phone: phone, // Example: '919876543210' (Include country code, no +)
          code_length: 6, // Length of the OTP
          template: process.env.GETOTP_TEMPLATE_ID, // ADDED TEMPLATE ID
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
       console.error("GetOTP Send Error:", data);
       const errorMessage = data?.errors?.[0]?.message || 'Failed to send OTP from provider';
       return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Error in send-phone-otp endpoint:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
