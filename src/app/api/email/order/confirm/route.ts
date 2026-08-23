import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { OrderConfirmation, OrderData } from '@/lib/email/templates/OrderConfirmation';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export async function POST(request: Request) {
  try {
    const data: OrderData = await request.json();
    const html = renderToStaticMarkup(<OrderConfirmation order={data} />);
    const subject = Order Confirmation #;
    await sendMail(data.customerEmail, subject, html);
    // TODO: insert record into email_logs (omitted for brevity)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json({ error: 'Failed to send order confirmation email' }, { status: 500 });
  }
}
