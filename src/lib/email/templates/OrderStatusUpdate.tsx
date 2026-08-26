import React from 'react';
import { BaseLayout } from './BaseLayout';
import type { RecommendedProduct } from './OrderConfirmation';

export interface OrderStatusData {
  orderId: string;
  customerName: string;
  status: string; // 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  storeUrl?: string;
  totalAmount?: number;
  items?: { name: string; quantity: number; price: string; imageUrl?: string; productId?: string }[];
  deliveryAddress?: string;
  recommendedProducts?: RecommendedProduct[];
}

export const OrderStatusUpdate: React.FC<{ data: OrderStatusData }> = ({ data }) => {
  const shortOrderId = data.orderId.split('-')[0].toUpperCase();
  const storeUrl = data.storeUrl || 'https://arogyavruksham.vercel.app';
  const orderUrl = `${storeUrl}/profile?tab=orders`;

  let heading = '';
  let subHeading = '';
  let schemaStatus = 'http://schema.org/OrderProcessing';
  let activeStep = 0; // 0=Ordered, 1=Shipped, 2=Out for delivery, 3=Delivered
  let deliveryText = 'Arriving Soon';
  let accentColor = '#1E4631';
  let isCancelled = false;

  // Estimated delivery dates
  const now = new Date();
  const deliveryDate = new Date();

  switch (data.status) {
    case 'packed':
      heading = 'Your order is packed!';
      subHeading = 'We\'re getting it ready for shipment';
      activeStep = 0;
      deliveryDate.setDate(now.getDate() + 4);
      deliveryText = `Estimated: ${deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      break;
    case 'shipped':
      heading = 'Your package was shipped!';
      subHeading = 'It\'s on the way to you';
      schemaStatus = 'http://schema.org/OrderInTransit';
      activeStep = 1;
      deliveryDate.setDate(now.getDate() + 3);
      deliveryText = `Estimated: ${deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      break;
    case 'out_for_delivery':
      heading = 'Your package is out for delivery!';
      subHeading = 'It will arrive today';
      schemaStatus = 'http://schema.org/OrderInTransit';
      activeStep = 2;
      deliveryText = 'Arriving Today';
      break;
    case 'delivered':
      heading = 'Your package was delivered!';
      subHeading = 'We hope you enjoy your purchase';
      schemaStatus = 'http://schema.org/OrderDelivered';
      activeStep = 3;
      deliveryText = `Delivered ${now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}`;
      break;
    case 'cancelled':
      heading = 'Your order was cancelled';
      subHeading = 'We\'re sorry for the inconvenience';
      schemaStatus = 'http://schema.org/OrderCancelled';
      activeStep = -1;
      isCancelled = true;
      accentColor = '#CC0C39';
      break;
    default:
      heading = 'Order Status Update';
      subHeading = 'Here\'s the latest on your order';
      break;
  }

  const subjectLine = `${heading} — Order #${shortOrderId}`;

  // Schema markup
  let schemaMarkup: any = {
    "@context": "http://schema.org",
    "@type": "Order",
    "merchant": { "@type": "Organization", "name": "Arogyavruksham" },
    "orderNumber": shortOrderId,
    "orderStatus": schemaStatus,
    "priceCurrency": "INR",
    "price": data.totalAmount || 0,
    "acceptedOffer": (data.items || []).map(item => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": item.name,
        "image": item.imageUrl || `${storeUrl}/logo.png`,
        "url": `${storeUrl}/shop`
      },
      "price": parseInt(item.price.replace(/\D/g, '')) || 0,
      "priceCurrency": "INR",
      "eligibleQuantity": { "@type": "QuantitativeValue", "value": item.quantity }
    })),
    "url": orderUrl
  };

  if (['shipped', 'out_for_delivery', 'delivered'].includes(data.status)) {
    const mainItem = data.items && data.items.length > 0 ? data.items[0] : null;
    schemaMarkup = {
      "@context": "http://schema.org",
      "@type": "ParcelDelivery",
      "expectedArrivalUntil": deliveryDate.toISOString(),
      "carrier": { "@type": "Organization", "name": "Arogyavruksham Delivery" },
      "partOfOrder": schemaMarkup,
      "potentialAction": [
        { "@type": "ViewAction", "url": orderUrl, "name": "View order" },
        mainItem ? { "@type": "ViewAction", "url": `${storeUrl}/shop`, "name": "View item" } : null
      ].filter(Boolean)
    };
    if (mainItem) {
      schemaMarkup.itemShipped = {
        "@type": "Product",
        "name": mainItem.name,
        "image": mainItem.imageUrl || `${storeUrl}/logo.png`,
        "url": `${storeUrl}/shop`
      };
    }
  } else {
    schemaMarkup.potentialAction = { "@type": "ViewAction", "url": orderUrl, "name": "View order" };
  }

  const steps = ['Ordered', 'Shipped', 'Out for delivery', 'Delivered'];

  return (
    <BaseLayout 
      title={subjectLine}
      previewText={heading}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* ──── Heading ──── */}
      <h1 style={{ 
        color: isCancelled ? '#CC0C39' : '#0F1111', 
        fontSize: '22px', 
        marginTop: '0', 
        marginBottom: '4px', 
        fontWeight: '400',
        textAlign: 'center'
      }}>
        {heading}
      </h1>
      <p style={{ 
        fontSize: '14px', 
        color: '#565959', 
        textAlign: 'center', 
        margin: '0 0 24px 0' 
      }}>
        {subHeading}
      </p>

      {/* ──── Progress Tracker (not for cancelled) ──── */}
      {!isCancelled && (
        <div style={{ padding: '0 10px', marginBottom: '28px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                {steps.map((step, index) => (
                  <td key={index} width="25%" align="center" valign="top">
                    {/* Circle with checkmark */}
                    <div style={{
                      width: index <= activeStep ? '26px' : '20px',
                      height: index <= activeStep ? '26px' : '20px',
                      backgroundColor: index <= activeStep ? '#1E4631' : '#D5D9D9',
                      borderRadius: '50%',
                      margin: '0 auto 8px auto',
                      textAlign: 'center',
                      lineHeight: index <= activeStep ? '26px' : '20px',
                    }}>
                      {index <= activeStep && (
                        <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </div>
                    {/* Label */}
                    <span style={{ 
                      fontSize: '11px', 
                      color: index <= activeStep ? '#1E4631' : '#565959',
                      fontWeight: index === activeStep ? '700' : '400',
                      display: 'block'
                    }}>
                      {step}
                    </span>
                  </td>
                ))}
              </tr>
              {/* Connecting lines */}
              <tr>
                <td colSpan={4}>
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '-40px', marginBottom: '6px' }}>
                    <tbody>
                      <tr>
                        <td width="12.5%"></td>
                        <td width="25%" style={{ height: '3px', backgroundColor: activeStep >= 1 ? '#1E4631' : '#D5D9D9' }}></td>
                        <td width="25%" style={{ height: '3px', backgroundColor: activeStep >= 2 ? '#1E4631' : '#D5D9D9' }}></td>
                        <td width="25%" style={{ height: '3px', backgroundColor: activeStep >= 3 ? '#1E4631' : '#D5D9D9' }}></td>
                        <td width="12.5%"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ──── Cancelled Banner ──── */}
      {isCancelled && (
        <div style={{ 
          backgroundColor: '#FFF5F5', 
          border: '1px solid #FCC',
          borderRadius: '8px', 
          padding: '16px 20px', 
          marginBottom: '24px' 
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#CC0C39', fontWeight: '700' }}>
            Cancelled
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#565959', lineHeight: '1.5' }}>
            Your order has been cancelled. If payment was made, a refund will be processed within 3-5 business days. The amount will be credited back to your original payment method.
          </p>
        </div>
      )}

      {/* ──── Delivery Estimate (not for cancelled/delivered) ──── */}
      {!isCancelled && data.status !== 'delivered' && (
        <div style={{ 
          backgroundColor: '#F0F7F2', 
          border: '1px solid #C6E1CC',
          borderRadius: '8px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
            {data.status === 'out_for_delivery' ? 'Delivery Status' : 'Estimated Delivery'}
          </p>
          <p style={{ margin: '0', fontSize: '18px', color: '#1E4631', fontWeight: '700' }}>
            {deliveryText}
          </p>
        </div>
      )}

      {/* ──── Delivered success banner ──── */}
      {data.status === 'delivered' && (
        <div style={{ 
          backgroundColor: '#F0F7F2', 
          border: '1px solid #C6E1CC',
          borderRadius: '8px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 2px 0', fontSize: '24px' }}>📦 ✅</p>
          <p style={{ margin: '0', fontSize: '16px', color: '#1E4631', fontWeight: '700' }}>
            {deliveryText}
          </p>
        </div>
      )}

      {/* ──── Delivery Info & Order ID ──── */}
      <div style={{ borderTop: '1px solid #D5D9D9', paddingTop: '16px', marginBottom: '20px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td width="50%" valign="top">
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0F1111', fontWeight: '700' }}>
                  {data.customerName}
                </p>
                <p style={{ margin: '0', fontSize: '13px', color: '#565959', lineHeight: '1.5' }}>
                  {data.deliveryAddress || ''}
                </p>
              </td>
              <td width="50%" valign="top" align="right">
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Order #
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', fontWeight: '600' }}>
                  {shortOrderId}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ──── Action Buttons ──── */}
      <div style={{ marginBottom: '24px' }}>
        <a 
          href={orderUrl}
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#FFD814', 
            color: '#0F1111', 
            padding: '11px 24px', 
            textDecoration: 'none', 
            borderRadius: '20px', 
            fontSize: '13px', 
            fontWeight: '700',
            border: '1px solid #FCD200',
            marginRight: '10px'
          }}
        >
          {data.status === 'delivered' ? 'Buy again' : isCancelled ? 'View orders' : 'Track package'}
        </a>
        {!isCancelled && (
          <a 
            href={`${storeUrl}/shop`}
            style={{ 
              display: 'inline-block', 
              backgroundColor: '#FFFFFF', 
              color: '#0F1111', 
              padding: '11px 24px', 
              textDecoration: 'none', 
              borderRadius: '20px', 
              fontSize: '13px', 
              fontWeight: '700',
              border: '1px solid #D5D9D9'
            }}
          >
            Shop more
          </a>
        )}
      </div>

      {/* ──── Items List ──── */}
      {data.items && data.items.length > 0 && (
        <div style={{ borderTop: '1px solid #D5D9D9', paddingTop: '20px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', color: '#0F1111', margin: '0 0 16px 0', fontWeight: '700' }}>
            {data.items.length === 1 ? '1 item in this order' : `${data.items.length} items in this order`}
          </h3>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: i < data.items!.length - 1 ? '1px solid #EDEDED' : 'none' }}>
                  <td width="80" valign="top" style={{ paddingBottom: '16px', paddingTop: i > 0 ? '16px' : '0' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} width="70" height="70" style={{ objectFit: 'contain', border: '1px solid #EDEDED', borderRadius: '8px', backgroundColor: '#FAFAFA' }} />
                    ) : (
                      <div style={{ width: '70px', height: '70px', backgroundColor: '#F3F3F3', border: '1px solid #EDEDED', borderRadius: '8px' }}></div>
                    )}
                  </td>
                  <td valign="top" style={{ paddingLeft: '16px', paddingBottom: '16px', paddingTop: i > 0 ? '16px' : '0' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#007185', fontWeight: '600', lineHeight: '1.4' }}>
                      <a href={`${storeUrl}/shop/${item.productId || ''}`} style={{ color: '#007185', textDecoration: 'none' }}>
                        {item.name}
                      </a>
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#565959' }}>
                      Qty: {item.quantity}
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#B12704', fontWeight: '700' }}>
                      {item.price}
                    </p>
                    <a 
                      href={`${storeUrl}/shop/${item.productId || ''}`}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#FFFFFF',
                        color: '#0F1111',
                        padding: '5px 14px',
                        textDecoration: 'none',
                        borderRadius: '14px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: '1px solid #D5D9D9'
                      }}
                    >
                      Buy again
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ──── Total ──── */}
      {data.totalAmount !== undefined && (
        <div style={{ borderTop: '1px solid #D5D9D9', paddingTop: '16px', paddingBottom: '16px', marginBottom: '20px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                <td style={{ fontSize: '15px', color: '#0F1111', fontWeight: '700' }}>Order Total</td>
                <td align="right" style={{ fontSize: '15px', color: '#B12704', fontWeight: '700' }}>
                  ₹{data.totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ──── Recommended Products ──── */}
      {data.recommendedProducts && data.recommendedProducts.length > 0 && (
        <div style={{ borderTop: '2px solid #EDEDED', paddingTop: '24px', marginTop: '8px' }}>
          <h3 style={{ fontSize: '16px', color: '#0F1111', margin: '0 0 16px 0', fontWeight: '700' }}>
            {data.status === 'delivered' ? 'You might also like' : 'Customers also bought'}
          </h3>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                {data.recommendedProducts.slice(0, 4).map((product, i) => (
                  <td key={i} width="25%" valign="top" style={{ padding: '0 6px' }}>
                    <a href={`${storeUrl}/shop/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ 
                        border: '1px solid #EDEDED', 
                        borderRadius: '8px', 
                        padding: '10px', 
                        textAlign: 'center',
                        backgroundColor: '#FAFAFA'
                      }}>
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          width="80" 
                          height="80" 
                          style={{ objectFit: 'contain', display: 'block', margin: '0 auto 8px auto', borderRadius: '4px' }} 
                        />
                        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#0F1111', lineHeight: '1.3', fontWeight: '500' }}>
                          {product.title.length > 30 ? product.title.substring(0, 30) + '...' : product.title}
                        </p>
                        <p style={{ margin: '0', fontSize: '13px', color: '#B12704', fontWeight: '700' }}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </BaseLayout>
  );
};
