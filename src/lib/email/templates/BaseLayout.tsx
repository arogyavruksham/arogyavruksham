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
        backgroundColor: '#FFFFFF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        color: '#333333'
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#FFFFFF', padding: '20px 0' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  
                  {/* Header (Amazon style: Logo on left) */}
                  <thead>
                    <tr>
                      <td style={{ padding: '20px 20px', borderBottom: '1px solid #EAEAEA', textAlign: 'left' }}>
                        {/* We use standard img tag with site absolute URL */}
                        <img 
                          src="https://arogyavruksham.com/logo.png" 
                          alt="Arogyavruksham Logo" 
                          width="120" 
                          style={{ display: 'block' }} 
                        />
                      </td>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody>
                    <tr>
                      <td style={{ padding: '30px 20px' }}>
                        {children}
                      </td>
                    </tr>
                  </tbody>

                  {/* Footer */}
                  <tfoot>
                    <tr>
                      <td style={{ backgroundColor: '#F3F3F3', padding: '30px 20px', textAlign: 'left', borderTop: '1px solid #DDDDDD' }}>
                        <p style={{ color: '#555555', margin: '0 0 12px 0', fontSize: '13px', lineHeight: '1.6' }}>
                          This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.
                        </p>
                        <p style={{ color: '#555555', margin: '0', fontSize: '13px' }}>
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
