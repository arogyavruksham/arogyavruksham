import React from " react\;

export interface OrderData {
 id: string;
 customerName: string;
 customerEmail: string;
 items: { name: string; quantity: number; price: string }[];
 total: string;
 shippingAddress: string;
 expectedDelivery: string;
}

export const OrderConfirmation: React.FC<{ order: OrderData }> = ({ order }) => (
 <div style={{
 fontFamily: Inter sans-serif,
 backgroundColor: '#f9f9f9',
 color: '#222',
 padding: '40px',
 maxWidth: '600px',
 margin: '0 auto',
 borderRadius: '12px',
 boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
 }}>
 <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#2A7F4F' }}>Order Confirmation</h1>
 <p>Hi {order.customerName},</p>
 <p>Thank you for your purchase! Here are the details of your order <strong>#{order.id}</strong>:</p>
 <ul style={{ paddingLeft: '20px' }}>
 {order.items.map((item, i) => (
 <li key={i} style={{ marginBottom: '8px' }}>{item.quantity} × {item.name} – {item.price}</li>
 ))}
 </ul>
 <p><strong>Total:</strong> {order.total}</p>
 <p><strong>Shipping to:</strong> {order.shippingAddress}</p>
 <p><strong>Expected delivery:</strong> {order.expectedDelivery}</p>
 <p>If you have any questions, feel free to reply to this email.</p>
 <p>Best regards,<br/>Arogyavruksham Team</p>
 </div>
);
