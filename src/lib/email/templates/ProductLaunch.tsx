import React from 'react';
import { BaseLayout } from './BaseLayout';

export interface ProductLaunchData {
  title: string;
  imageUrl: string;
  price: number;
  description: string;
  url: string; // URL to the product page
}

export const ProductLaunch: React.FC<{ product: ProductLaunchData }> = ({ product }) => {
  return (
    <BaseLayout 
      title={`New Arrival: ${product.title}`}
      previewText={`Discover our newest addition: ${product.title}. Available now.`}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#1E4631', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          New Arrival
        </p>
        <h2 style={{ color: '#222', fontSize: '28px', marginTop: '0', marginBottom: '16px', fontFamily: 'serif', fontWeight: 'normal' }}>
          Meet the {product.title}
        </h2>
      </div>

      {product.imageUrl && (
        <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            style={{ width: '100%', display: 'block', border: 'none' }} 
          />
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '0 20px' }}>
        <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.7', marginBottom: '24px' }}>
          {product.description}
        </p>
        
        <p style={{ fontSize: '20px', color: '#1E4631', fontWeight: 'bold', marginBottom: '32px' }}>
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <a href={product.url} style={{
          display: 'inline-block',
          backgroundColor: '#1E4631',
          color: '#FFF',
          padding: '16px 40px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          Shop Now
        </a>
      </div>
    </BaseLayout>
  );
};
