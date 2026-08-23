import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: string }[];
  totalAmount: number;
  expectedDelivery?: string;
}

export const OrderConfirmation: React.FC<{ order: OrderData }> = ({ order }) => {
  const shortOrderId = order.id.split('-')[0].toUpperCase();
  
  return (
    <BaseLayout 
      title={`Order Confirmation #${shortOrderId}`}
      previewText={`Thank you for your order! We are preparing your botanical items now.`}
    >
      <h2 style={{ color: '#1E4631', fontSize: '22px', marginTop: '0', marginBottom: '24px' }}>
        Order Confirmation
      </h2>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>
        Hi {order.customerName},
      </p>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '32px' }}>
        Thank you for your purchase! We have received your order and are currently preparing your botanical items for dispatch.
      </p>

      {/* Order Details Card */}
      <div style={{ backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '24px', borderLeft: '4px solid #1E4631', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0', marginBottom: '16px' }}>
          Order Summary
        </h3>
        
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '16px' }}>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 0', borderBottom: '1px solid #EEE', fontSize: '14px', color: '#333' }}>
                  <strong>{item.quantity}x</strong> {item.name}
                </td>
                <td align="right" style={{ padding: '8px 0', borderBottom: '1px solid #EEE', fontSize: '14px', color: '#555' }}>
                  {item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E4631', paddingTop: '8px' }}>Total Amount</td>
              <td align="right" style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E4631', paddingTop: '8px' }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
        
        <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: '#666' }}>
          <strong>Order ID:</strong> #{shortOrderId}
        </p>
        {order.expectedDelivery && (
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            <strong>Expected Delivery:</strong> {order.expectedDelivery}
          </p>
        )}
      </div>

      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '0' }}>
        Your official tax invoice is attached to this email as a PDF. We will notify you again once your greenery has been shipped!
      </p>
    </BaseLayout>
  );
};
