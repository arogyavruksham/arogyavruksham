import React, { ReactNode } from 'react';

export const BaseLayout = ({ children, title, previewText }: { children?: ReactNode, title?: string, previewText?: string }) => {
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.vercel.app';

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {title && <title>{title}</title>}
      </head>
      <body style={{
        margin: '0',
        padding: '0',
        backgroundColor: '#E8E8E8',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        color: '#0F1111'
      }}>
        {/* Preview text (hidden) */}
        {previewText && (
          <div style={{ display: 'none', maxHeight: '0px', overflow: 'hidden', fontSize: '0', lineHeight: '0' }}>
            {previewText}
            {/* Padding to prevent email clients from pulling body text into preview */}
            {'‌ '.repeat(80)}
          </div>
        )}

        {/* Outer wrapper */}
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#E8E8E8', padding: '20px 0' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFFFF' }}>

                  {/* ──── Dark Navigation Bar ──── */}
                  <thead>
                    <tr>
                      <td style={{ backgroundColor: '#1E4631', padding: '0' }}>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <td style={{ padding: '14px 24px' }}>
                                <img 
                                  src={`${storeUrl}/logo.png`}
                                  alt="Arogyavruksham" 
                                  width="130" 
                                  style={{ display: 'block', filter: 'brightness(10)' }} 
                                />
                              </td>
                            </tr>
                            <tr>
                              <td style={{ padding: '0 24px 12px 24px' }}>
                                <table cellPadding="0" cellSpacing="0">
                                  <tbody>
                                    <tr>
                                      <td>
                                        <a href={`${storeUrl}/profile?tab=orders`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginRight: '20px' }}>Your Orders</a>
                                      </td>
                                      <td style={{ padding: '0 8px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                                      </td>
                                      <td>
                                        <a href={`${storeUrl}/profile`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginRight: '20px' }}>Your Account</a>
                                      </td>
                                      <td style={{ padding: '0 8px' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                                      </td>
                                      <td>
                                        <a href={`${storeUrl}/shop`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Shop Again</a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </thead>

                  {/* ──── Body Content ──── */}
                  <tbody>
                    <tr>
                      <td style={{ padding: '32px 24px 24px 24px' }}>
                        {children}
                      </td>
                    </tr>
                  </tbody>

                  {/* ──── Footer ──── */}
                  <tfoot>
                    <tr>
                      <td style={{ backgroundColor: '#F3F3F3', padding: '28px 24px', borderTop: '1px solid #DDDDDD' }}>
                        {/* Store links */}
                        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px' }}>
                          <tbody>
                            <tr>
                              <td align="center">
                                <a href={`${storeUrl}/shop`} style={{ color: '#1E4631', textDecoration: 'none', fontSize: '12px', fontWeight: '600', margin: '0 12px' }}>Shop</a>
                                <span style={{ color: '#CCC' }}>•</span>
                                <a href={`${storeUrl}/profile?tab=orders`} style={{ color: '#1E4631', textDecoration: 'none', fontSize: '12px', fontWeight: '600', margin: '0 12px' }}>Orders</a>
                                <span style={{ color: '#CCC' }}>•</span>
                                <a href={`${storeUrl}/contact`} style={{ color: '#1E4631', textDecoration: 'none', fontSize: '12px', fontWeight: '600', margin: '0 12px' }}>Help</a>
                                <span style={{ color: '#CCC' }}>•</span>
                                <a href={`${storeUrl}/policies/returns`} style={{ color: '#1E4631', textDecoration: 'none', fontSize: '12px', fontWeight: '600', margin: '0 12px' }}>Returns</a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ color: '#888888', margin: '0 0 8px 0', fontSize: '11px', lineHeight: '1.6', textAlign: 'center' }}>
                          This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
                        </p>
                        <p style={{ color: '#888888', margin: '0', fontSize: '11px', textAlign: 'center' }}>
                          &copy; {new Date().getFullYear()} Arogyavruksham. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </tfoot>

                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};
