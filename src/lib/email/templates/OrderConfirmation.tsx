import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: string, imageUrl?: string }[];
  totalAmount: number;
  expectedDelivery?: string;
}

export const OrderConfirmation: React.FC<{ order: OrderData }> = ({ order }) => {
  const shortOrderId = order.id.split('-')[0].toUpperCase();
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.com';
  const orderUrl = `${storeUrl}/profile?tab=orders`;
  
  // Gmail Email Schema for the "View order" button
  const schemaMarkup = {
    "@context": "http://schema.org",
    "@type": "Order",
    "merchant": {
      "@type": "Organization",
      "name": "Arogyavruksham"
    },
    "orderNumber": shortOrderId,
    "orderStatus": "http://schema.org/OrderProcessing",
    "priceCurrency": "INR",
    "price": order.totalAmount,
    "acceptedOffer": order.items.map(item => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": item.name,
        "image": item.imageUrl || `${storeUrl}/logo.png`
      },
      "price": parseInt(item.price.replace(/\D/g, '')) || 0,
      "priceCurrency": "INR",
      "eligibleQuantity": {
        "@type": "QuantitativeValue",
        "value": item.quantity
      }
    })),
    "url": orderUrl,
    "potentialAction": {
      "@type": "ViewAction",
      "url": orderUrl,
      "name": "View order"
    }
  };

  return (
    <BaseLayout 
      title={`Order Confirmation #${shortOrderId}`}
      previewText={`Thank you for your order! We are preparing your items now.`}
    >
      {/* Schema.org Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <h2 style={{ color: '#E47911', fontSize: '24px', marginTop: '0', marginBottom: '20px', fontWeight: 'normal' }}>
        Order Confirmation
      </h2>
      
      <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.5', marginBottom: '16px' }}>
        Hello <strong>{order.customerName}</strong>,
      </p>
      
      <p style={{ fontSize: '15px', color: '#333', lineHeight: '1.5', marginBottom: '30px' }}>
        Thank you for shopping with us. We'll send a confirmation when your items ship. Your estimated delivery date is indicated below.
      </p>

      {/* Action Button */}
      <div style={{ marginBottom: '40px' }}>
        <a 
          href={orderUrl}
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#FFD814', 
            color: '#0F1111', 
            padding: '12px 24px', 
            textDecoration: 'none', 
            borderRadius: '8px', 
            fontSize: '14px', 
            fontWeight: 'bold',
            border: '1px solid #FCD200',
            boxShadow: '0 2px 5px rgba(213,217,217,0.5)'
          }}
        >
          View or manage order
        </a>
      </div>

      <div style={{ borderTop: '1px solid #DDDDDD', borderBottom: '1px solid #DDDDDD', padding: '20px 0', marginBottom: '30px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td width="50%" valign="top" style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                <strong style={{ color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>Order Placed</strong><br />
                {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </td>
              <td width="50%" valign="top" style={{ fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                <strong style={{ color: '#555', textTransform: 'uppercase', fontSize: '12px' }}>Order ID</strong><br />
                #{shortOrderId}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '18px', color: '#333', marginTop: '0', marginBottom: '20px', fontWeight: 'bold' }}>
        Order Details
      </h3>

      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '30px' }}>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i}>
              <td width="80" valign="top" style={{ paddingBottom: '20px' }}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} width="70" height="70" style={{ objectFit: 'contain', border: '1px solid #EEE', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '70px', height: '70px', backgroundColor: '#F0F0F0', border: '1px solid #EEE', borderRadius: '4px' }}></div>
                )}
              </td>
              <td valign="top" style={{ paddingLeft: '16px', paddingBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#007185', fontWeight: 'bold', lineHeight: '1.4' }}>
                  {item.name}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>
                  Quantity: {item.quantity}
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#B12704', fontWeight: 'bold' }}>
                  {item.price}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ backgroundColor: '#F3F3F3', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ fontSize: '14px', color: '#555', paddingBottom: '8px' }}>Item(s) Subtotal:</td>
              <td align="right" style={{ fontSize: '14px', color: '#333', paddingBottom: '8px' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style={{ fontSize: '16px', color: '#111', fontWeight: 'bold', paddingTop: '12px', borderTop: '1px solid #DDD' }}>Grand Total:</td>
              <td align="right" style={{ fontSize: '16px', color: '#B12704', fontWeight: 'bold', paddingTop: '12px', borderTop: '1px solid #DDD' }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0' }}>
        Your official tax invoice is attached to this email as a PDF.
      </p>

    </BaseLayout>
  );
};
