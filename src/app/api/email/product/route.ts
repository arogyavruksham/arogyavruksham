import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { ProductLaunch, ProductData } from '@/lib/email/templates/ProductLaunch';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Expected payload shape:
 *   {
 *     title, imageUrl, price, description, url,
 *     // optional: array of subscriber email strings
 *     subscribers?: string[]
 *   }
 */
export async function POST(request: Request) {
  try {
    const data: ProductData & { subscribers?: string[] } = await request.json();
    const html = renderToStaticMarkup(<ProductLaunch product={data} />);
    const subject = New Product: ;

    // If a subscriber list is provided, email them; otherwise send to admin fallback.
    const fallbackEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || '';
    const recipients = (data.subscribers && data.subscribers.length > 0) ? data.subscribers : [fallbackEmail];

    await Promise.all(
      recipients.map((email) => sendMail(email, subject, html))
    );

    return NextResponse.json({ success: true, sentTo: recipients.length });
  } catch (error) {
    console.error('Product launch email error:', error);
    return NextResponse.json({ error: 'Failed to send product launch emails' }, { status: 500 });
  }
}
