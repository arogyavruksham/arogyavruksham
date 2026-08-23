import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface OrderStatusData {
  orderId: string;
  customerName: string;
  status: string; // 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  storeUrl?: string; // Base URL of the store
}

export const OrderStatusUpdate: React.FC<{ data: OrderStatusData }> = ({ data }) => {
  const shortOrderId = data.orderId.split('-')[0].toUpperCase();
  
  let subject = '';
  let heading = '';
  let message = '';
  let cta = null;
  let isCancelled = false;
  let isDelivered = false;

  switch (data.status) {
    case 'packed':
      subject = `Your order #${shortOrderId} is packed!`;
      heading = 'Order Packed';
      message = 'Great news! Your plant items have been safely packed and are awaiting dispatch.';
      break;
    case 'shipped':
      subject = `Your order #${shortOrderId} has shipped!`;
      heading = 'Order Shipped';
      message = 'Your order is on its way! It has been handed over to our verified delivery partners.';
      break;
    case 'out_for_delivery':
      subject = `Your order #${shortOrderId} is out for delivery!`;
      heading = 'Out for Delivery';
      message = 'Get ready! Your green sanctuary items are out for delivery and will arrive today.';
      break;
    case 'delivered':
      isDelivered = true;
      subject = `Your order #${shortOrderId} has been delivered!`;
      heading = 'Order Delivered';
      message = 'Your order has been safely delivered. We hope these beautiful additions bring fresh energy to your home!';
      cta = {
        text: 'Order Again & Explore',
        url: `${data.storeUrl || 'https://arogyavruksham.com'}/shop`
      };
      break;
    case 'cancelled':
      isCancelled = true;
      subject = `Update on your order #${shortOrderId}`;
      heading = 'Order Cancelled';
      message = 'Your order has been cancelled. We are sorry it did not work out this time.';
      cta = {
        text: 'Tell us why you cancelled',
        url: `mailto:support@arogyavruksham.com?subject=Feedback%20on%20cancelled%20order%20${shortOrderId}`
      };
      break;
    default:
      subject = `Update on order #${shortOrderId}`;
      heading = 'Status Update';
      message = 'There is an update on your recent order.';
      break;
  }

  return (
    <BaseLayout 
      title={subject}
      previewText={message}
    >
      <h2 style={{ color: isCancelled ? '#D32F2F' : '#1E4631', fontSize: '22px', marginTop: '0', marginBottom: '24px' }}>
        {heading}
      </h2>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>
        Hi {data.customerName},
      </p>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '32px' }}>
        {message}
      </p>

      {/* Status Card */}
      <div style={{ backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '24px', borderLeft: `4px solid ${isCancelled ? '#D32F2F' : '#1E4631'}`, marginBottom: '32px' }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          <strong>Order ID:</strong> #{shortOrderId}
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666', textTransform: 'capitalize' }}>
          <strong>Current Status:</strong> <span style={{ color: isCancelled ? '#D32F2F' : '#1E4631', fontWeight: 'bold' }}>{data.status.replace(/_/g, ' ')}</span>
        </p>
      </div>

      {cta && (
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
          <a href={cta.url} style={{
            display: 'inline-block',
            backgroundColor: isCancelled ? '#FAFAFA' : '#1E4631',
            color: isCancelled ? '#555' : '#FFF',
            border: isCancelled ? '1px solid #CCC' : 'none',
            padding: '14px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>
            {cta.text}
          </a>
        </div>
      )}

      {isDelivered && (
        <p style={{ fontSize: '14px', color: '#777', lineHeight: '1.6', marginTop: '32px', textAlign: 'center', fontStyle: 'italic' }}>
          Loving your new plants? We'd be thrilled if you shared a picture with us!
        </p>
      )}

      {isCancelled && (
        <p style={{ fontSize: '14px', color: '#777', lineHeight: '1.6', marginTop: '32px', textAlign: 'center' }}>
          Your feedback is incredibly valuable to us. We hope to welcome you back soon.
        </p>
      )}

    </BaseLayout>
  );
};
