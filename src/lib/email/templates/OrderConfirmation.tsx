import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  imageUrl?: string;
  productId?: string;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  price: number;
  image_url: string;
}

export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingCost?: number;
  discountAmount?: number;
  couponCode?: string;
  expectedDelivery?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  recommendedProducts?: RecommendedProduct[];
}

export const OrderConfirmation: React.FC<{ order: OrderData }> = ({ order }) => {
  const shortOrderId = order.id.split('-')[0].toUpperCase();
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.com';
  const orderUrl = `${storeUrl}/profile?tab=orders`;

  // Calculate estimated delivery (order date + 5 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const estimatedDelivery = order.expectedDelivery || deliveryDate.toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const orderDate = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  // Calculate subtotal from items
  const itemsSubtotal = order.items.reduce((sum, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
    return sum + (priceNum * item.quantity);
  }, 0);

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

  const steps = ['Ordered', 'Shipped', 'Out for delivery', 'Delivered'];
  const activeStep = 0; // Just placed

  return (
    <BaseLayout 
      title={`Order Confirmation #${shortOrderId}`}
      previewText={`Thank you for your order! Estimated delivery: ${estimatedDelivery}`}
    >
      {/* Schema.org Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      {/* ──── Heading ──── */}
      <h1 style={{ 
        color: '#0F1111', 
        fontSize: '22px', 
        marginTop: '0', 
        marginBottom: '4px', 
        fontWeight: '400',
        textAlign: 'center'
      }}>
        Order Confirmed!
      </h1>
      <p style={{ 
        fontSize: '14px', 
        color: '#565959', 
        textAlign: 'center', 
        margin: '0 0 24px 0' 
      }}>
        Thank you for shopping with Arogyavruksham
      </p>

      {/* ──── Progress Tracker ──── */}
      <div style={{ padding: '0 10px', marginBottom: '28px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              {steps.map((step, index) => (
                <td key={index} width="25%" align="center" valign="top">
                  {/* Circle */}
                  <div style={{
                    width: index <= activeStep ? '24px' : '20px',
                    height: index <= activeStep ? '24px' : '20px',
                    backgroundColor: index <= activeStep ? '#1E4631' : '#D5D9D9',
                    borderRadius: '50%',
                    margin: '0 auto 8px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: index <= activeStep ? '24px' : '20px',
                    textAlign: 'center',
                  }}>
                    {index <= activeStep && (
                      <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
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
              <td colSpan={4} style={{ padding: '0' }}>
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '-38px', marginBottom: '6px' }}>
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

      {/* ──── Estimated Delivery ──── */}
      <div style={{ 
        backgroundColor: '#F0F7F2', 
        border: '1px solid #C6E1CC',
        borderRadius: '8px', 
        padding: '16px 20px', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
          Estimated Delivery
        </p>
        <p style={{ margin: '0', fontSize: '18px', color: '#1E4631', fontWeight: '700' }}>
          {estimatedDelivery}
        </p>
      </div>

      {/* ──── Hello & Message ──── */}
      <p style={{ fontSize: '14px', color: '#0F1111', lineHeight: '1.5', margin: '0 0 8px 0' }}>
        Hello <strong>{order.customerName}</strong>,
      </p>
      <p style={{ fontSize: '14px', color: '#565959', lineHeight: '1.6', margin: '0 0 20px 0' }}>
        We've received your order and are preparing it now. We'll send you an email when your order has shipped.
      </p>

      {/* ──── Order Info Bar ──── */}
      <div style={{ borderTop: '1px solid #D5D9D9', borderBottom: '1px solid #D5D9D9', padding: '16px 0', marginBottom: '24px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td width="33%" valign="top" style={{ paddingRight: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Order Placed
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', fontWeight: '500' }}>
                  {orderDate}
                </p>
              </td>
              <td width="33%" valign="top" style={{ paddingRight: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Order #
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', fontWeight: '500' }}>
                  {shortOrderId}
                </p>
              </td>
              <td width="33%" valign="top">
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                  Payment
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', fontWeight: '500' }}>
                  {order.paymentMethod || 'Online'}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ──── Action Buttons ──── */}
      <div style={{ marginBottom: '28px' }}>
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
          View or manage order
        </a>
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
          Buy again
        </a>
      </div>

      {/* ──── Delivery Address ──── */}
      {order.deliveryAddress && (
        <div style={{ marginBottom: '24px', padding: '16px 20px', backgroundColor: '#FAFAFA', borderRadius: '8px', border: '1px solid #EDEDED' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
            Shipping To
          </p>
          <p style={{ margin: '0', fontSize: '14px', color: '#0F1111', lineHeight: '1.6' }}>
            <strong>{order.customerName}</strong><br />
            {order.deliveryAddress}
          </p>
        </div>
      )}

      {/* ──── Order Items ──── */}
      <h3 style={{ fontSize: '16px', color: '#0F1111', margin: '0 0 16px 0', fontWeight: '700', borderBottom: '2px solid #1E4631', paddingBottom: '8px' }}>
        Order Details
      </h3>

      <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '24px' }}>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: i < order.items.length - 1 ? '1px solid #EDEDED' : 'none' }}>
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
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#565959' }}>
                  Qty: {item.quantity}
                </p>
                <p style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#B12704', fontWeight: '700' }}>
                  {item.price}
                </p>
                {/* Re-order button per item */}
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

      {/* ──── Order Summary ──── */}
      <div style={{ backgroundColor: '#FAFAFA', padding: '20px', borderRadius: '8px', border: '1px solid #EDEDED', marginBottom: '28px' }}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tbody>
            <tr>
              <td style={{ fontSize: '13px', color: '#565959', paddingBottom: '8px' }}>Items Subtotal:</td>
              <td align="right" style={{ fontSize: '13px', color: '#0F1111', paddingBottom: '8px' }}>
                ₹{(order.discountAmount ? order.totalAmount + order.discountAmount : order.totalAmount).toLocaleString('en-IN')}
              </td>
            </tr>
            {order.shippingCost !== undefined && (
              <tr>
                <td style={{ fontSize: '13px', color: '#565959', paddingBottom: '8px' }}>Shipping:</td>
                <td align="right" style={{ fontSize: '13px', color: order.shippingCost === 0 ? '#1E4631' : '#0F1111', paddingBottom: '8px', fontWeight: order.shippingCost === 0 ? '600' : '400' }}>
                  {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost.toLocaleString('en-IN')}`}
                </td>
              </tr>
            )}
            {order.discountAmount && order.discountAmount > 0 && (
              <tr>
                <td style={{ fontSize: '13px', color: '#1E4631', paddingBottom: '8px' }}>
                  Discount{order.couponCode ? ` (${order.couponCode})` : ''}:
                </td>
                <td align="right" style={{ fontSize: '13px', color: '#1E4631', paddingBottom: '8px', fontWeight: '600' }}>
                  -₹{order.discountAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ fontSize: '16px', color: '#0F1111', fontWeight: '700', paddingTop: '12px', borderTop: '1px solid #D5D9D9' }}>
                Order Total:
              </td>
              <td align="right" style={{ fontSize: '16px', color: '#B12704', fontWeight: '700', paddingTop: '12px', borderTop: '1px solid #D5D9D9' }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ──── Invoice Note ──── */}
      <p style={{ fontSize: '13px', color: '#565959', lineHeight: '1.5', margin: '0 0 28px 0', backgroundColor: '#FFF8E7', padding: '12px 16px', borderRadius: '6px', border: '1px solid #F5E6C8' }}>
        📄 Your official tax invoice is attached to this email as a PDF.
      </p>

      {/* ──── Recommended Products ──── */}
      {order.recommendedProducts && order.recommendedProducts.length > 0 && (
        <div style={{ borderTop: '2px solid #EDEDED', paddingTop: '24px', marginTop: '8px' }}>
          <h3 style={{ fontSize: '16px', color: '#0F1111', margin: '0 0 16px 0', fontWeight: '700' }}>
            Customers also bought
          </h3>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                {order.recommendedProducts.slice(0, 4).map((product, i) => (
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
                        <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#0F1111', lineHeight: '1.3', fontWeight: '500', overflow: 'hidden' }}>
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
