import React, { ReactNode } from 'react';

export const BaseLayout = ({ children, title, previewText }: { children?: ReactNode, title?: string, previewText?: string }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {title && <title>{title}</title>}
        {previewText && (
          <div style={{ display: 'none', maxHeight: '0px', overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
      </head>
      <body style={{
        margin: '0',
        padding: '0',
        backgroundColor: '#F9F9F9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        color: '#222222'
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#F9F9F9', padding: '40px 20px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', backgroundColor: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  
                  {/* Header */}
                  <thead>
                    <tr>
                      <td style={{ backgroundColor: '#1E4631', padding: '32px 40px', textAlign: 'center' }}>
                        <h1 style={{ color: '#FFFFFF', margin: '0', fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
                          Arogyavruksham
                        </h1>
                        <p style={{ color: '#A4E4BA', margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>
                          Your Authentic Botanical Sanctuary
                        </p>
                      </td>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    <tr>
                      <td style={{ padding: '40px' }}>
                        {children}
                      </td>
                    </tr>
                  </tbody>

                  {/* Footer */}
                  <tfoot>
                    <tr>
                      <td style={{ backgroundColor: '#FAFAFA', padding: '24px 40px', textAlign: 'center', borderTop: '1px solid #EEEEEE' }}>
                        <p style={{ color: '#888888', margin: '0 0 8px 0', fontSize: '12px', lineHeight: '1.5' }}>
                          If you have any questions, simply reply to this email or reach out to our support team.
                        </p>
                        <p style={{ color: '#888888', margin: '0', fontSize: '11px' }}>
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
