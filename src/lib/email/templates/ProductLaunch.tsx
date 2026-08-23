import React from  react;

export interface ProductData {
  title: string;
  imageUrl: string;
  price: string;
  description: string;
  url: string;
}

export const ProductLaunch: React.FC<{ product: ProductData }> = ({ product }) => (
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
    <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#2A7F4F' }}>
      New Product Available!
    </h1>
    <img src={product.imageUrl} alt={product.title} style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
    <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{product.title}</h2>
    <p style={{ fontSize: '18px', marginBottom: '10px', fontWeight: 'bold' }}>Price: {product.price}</p>
    <p style={{ lineHeight: '1.5', marginBottom: '20px' }}>{product.description}</p>
    <a href={product.url}
       style={{
         display: 'inline-block',
         backgroundColor: '#2A7F4F',
         color: '#fff',
         padding: '12px 24px',
         borderRadius: '6px',
         textDecoration: 'none',
         fontWeight: '500',
       }}>
      View Product
    </a>
  </div>
);
