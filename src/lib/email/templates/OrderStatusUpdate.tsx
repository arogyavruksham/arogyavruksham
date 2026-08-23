import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface OrderStatusData {
  orderId: string;
  customerName: string;
  status: string; // 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  storeUrl?: string; // Base URL of the store
  totalAmount?: number;
  items?: { name: string; quantity: number; price: string, imageUrl?: string }[];
  deliveryAddress?: string;
}

export const OrderStatusUpdate: React.FC<{ data: OrderStatusData }> = ({ data }) => {
  const shortOrderId = data.orderId.split('-')[0].toUpperCase();
  const storeUrl = data.storeUrl || 'https://arogyavruksham.com';
  const orderUrl = `${storeUrl}/profile?tab=orders`;

  let subject = '';
  let heading = '';
  let schemaStatus = 'http://schema.org/OrderProcessing';
  let activeStep = 0; // 0=Ordered, 1=Shipped, 2=Out, 3=Delivered
  let deliveryText = 'Arriving Soon';

  switch (data.status) {
    case 'packed':
      subject = `Packed: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Your order is packed!';
      activeStep = 0;
      break;
    case 'shipped':
      subject = `Shipped: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Your package was shipped!';
      schemaStatus = 'http://schema.org/OrderInTransit';
      activeStep = 1;
      break;
    case 'out_for_delivery':
      subject = `Out for delivery: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Your package is out for delivery!';
      schemaStatus = 'http://schema.org/OrderInTransit';
      activeStep = 2;
      deliveryText = 'Arriving Today';
      break;
    case 'delivered':
      subject = `Delivered: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Your package was delivered!';
      schemaStatus = 'http://schema.org/OrderDelivered';
      activeStep = 3;
      deliveryText = 'Delivered';
      break;
    case 'cancelled':
      subject = `Cancelled: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Your order was cancelled.';
      schemaStatus = 'http://schema.org/OrderCancelled';
      activeStep = -1;
      break;
    default:
      subject = `Update: Your Arogyavruksham order #${shortOrderId}`;
      heading = 'Status Update on your order!';
      break;
  }

  // Schema Markup for Gmail "View Order" / "Track Package"
  const schemaMarkup = {
    "@context": "http://schema.org",
    "@type": "Order",
    "merchant": {
      "@type": "Organization",
      "name": "Arogyavruksham"
    },
    "orderNumber": shortOrderId,
    "orderStatus": schemaStatus,
    "priceCurrency": "INR",
    "price": data.totalAmount || 0,
    "acceptedOffer": (data.items || []).map(item => ({
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
      "name": data.status === 'delivered' ? "Buy Again" : "Track package"
    }
  };

  const steps = ['Ordered', 'Shipped', 'Out for delivery', 'Delivered'];

  return (
    <BaseLayout 
      title={subject}
      previewText={heading}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* Dark Top Nav (Amazon Style) */}
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#232F3E', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td align="center" style={{ padding: '12px 0' }}>
              <a href={`${storeUrl}/profile?tab=orders`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', margin: '0 10px' }}>Your Orders</a>
              <span style={{ color: '#555' }}>|</span>
              <a href={`${storeUrl}/profile`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', margin: '0 10px' }}>Your Account</a>
              <span style={{ color: '#555' }}>|</span>
              <a href={`${storeUrl}/shop`} style={{ color: '#FFFFFF', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', margin: '0 10px' }}>Buy Again</a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ color: '#E47911', fontSize: '22px', marginTop: '0', marginBottom: '24px', textAlign: 'center', fontWeight: 'normal' }}>
        {heading}
      </h2>

      {/* Progress Bar (Amazon Style) */}
      {data.status !== 'cancelled' && (
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '8px' }}>
            <tbody>
              <tr>
                {steps.map((step, index) => (
                  <td key={index} width="25%" align="center" valign="middle">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: index <= activeStep ? '#007185' : '#DDDDDD',
                      borderRadius: '50%',
                      margin: '0 auto',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      {index <= activeStep && (
                        <span style={{ display: 'block', width: '6px', height: '6px', backgroundColor: '#FFF', borderRadius: '50%', margin: '3px auto 0' }}></span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '-14px', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <td width="12.5%"></td>
                <td width="25%" style={{ height: '2px', backgroundColor: activeStep >= 1 ? '#007185' : '#DDDDDD' }}></td>
                <td width="25%" style={{ height: '2px', backgroundColor: activeStep >= 2 ? '#007185' : '#DDDDDD' }}></td>
                <td width="25%" style={{ height: '2px', backgroundColor: activeStep >= 3 ? '#007185' : '#DDDDDD' }}></td>
                <td width="12.5%"></td>
              </tr>
            </tbody>
          </table>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                {steps.map((step, index) => (
                  <td key={index} width="25%" align="center" style={{ fontSize: '12px', color: index <= activeStep ? '#0F1111' : '#555', fontWeight: index === activeStep ? 'bold' : 'normal' }}>
                    {step}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Delivery Info */}
      <div style={{ borderTop: '1px solid #DDDDDD', paddingTop: '20px', paddingBottom: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#0F1111' }}>{deliveryText}</h3>
        <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', fontWeight: 'bold' }}>
          {data.customerName}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#555', lineHeight: '1.4' }}>
          Order #{shortOrderId}<br/>
          {data.deliveryAddress || ''}
        </p>

        {/* Action Button */}
        <div style={{ marginTop: '20px' }}>
          <a 
            href={orderUrl}
            style={{ 
              display: 'inline-block', 
              backgroundColor: '#FFD814', 
              color: '#0F1111', 
              padding: '10px 20px', 
              textDecoration: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: 'bold',
              border: '1px solid #FCD200',
              boxShadow: '0 2px 5px rgba(213,217,217,0.5)'
            }}
          >
            {data.status === 'delivered' ? 'Buy Again' : 'Track package'}
          </a>
        </div>
      </div>

      {/* Items List */}
      {data.items && data.items.length > 0 && (
        <div style={{ borderTop: '1px solid #DDDDDD', paddingTop: '20px', marginBottom: '20px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td width="80" valign="top" style={{ paddingBottom: '16px' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} width="70" height="70" style={{ objectFit: 'contain', border: '1px solid #EEE', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', backgroundColor: '#F0F0F0', border: '1px solid #EEE', borderRadius: '4px' }}></div>
                    )}
                  </td>
                  <td valign="top" style={{ paddingLeft: '16px', paddingBottom: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#007185', fontWeight: 'bold', lineHeight: '1.4' }}>
                      {item.name}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#555' }}>
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
        </div>
      )}

      {/* Total */}
      {data.totalAmount !== undefined && (
        <div style={{ borderTop: '1px solid #DDDDDD', paddingTop: '16px', paddingBottom: '16px', textAlign: 'right' }}>
          <span style={{ fontSize: '14px', color: '#555', marginRight: '16px' }}>Total</span>
          <span style={{ fontSize: '16px', color: '#0F1111', fontWeight: 'bold' }}>₹{data.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      )}

    </BaseLayout>
  );
};
