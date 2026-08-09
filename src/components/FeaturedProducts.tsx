'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

function ProductCardItem({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/product/${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        gap: '1rem',
      }}
    >
      {/* Image Container with 3:4 Aspect Ratio */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        backgroundColor: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {product.imageUrl ? (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${product.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333'
          }}>
            NO IMAGE
          </div>
        )}
      </div>

      {/* Product Info Below Image (Minimalist) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.35rem',
        padding: '0.5rem 0'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.85rem',
          fontWeight: 600,
          margin: 0,
          color: '#ffffff',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          lineHeight: '1.4'
        }}>
          {product.name}
        </h3>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontWeight: 400,
          fontSize: '0.85rem',
          margin: 0,
          letterSpacing: '0.05em',
        }}>
          ₹{(product.price || 0).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  );
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: doc.id,
            name: data.name || 'Unnamed Product',
            price: data.actualPrice || data.price || 0, // fallback for old data
            imageUrl: data.mainImageUrl || data.imageUrl || ''
          });
        });

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--accent-gold)' }}>Loading exclusive collection...</div>;
  }

  if (products.length === 0) {
    // Fallback dummy products to ensure the storefront always looks premium
    const dummyProducts: Product[] = [
      { id: 'dummy-1', name: 'OVERSIZED HEAVYWEIGHT T-SHIRT', price: 2999, imageUrl: '/1.PNG' },
      { id: 'dummy-2', name: 'ESSENTIAL PULLOVER HOODIE', price: 4499, imageUrl: '/2.PNG' },
      { id: 'dummy-3', name: 'RELAXED FIT CARGO BOTTOMS', price: 3999, imageUrl: '/3.PNG' },
      { id: 'dummy-4', name: 'SIGNATURE BOX FIT TEE', price: 2499, imageUrl: '/4.PNG' },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {dummyProducts.map((product) => (
          <ProductCardItem key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      {products.map((product) => (
        <ProductCardItem key={product.id} product={product} />
      ))}
    </div>
  );
}
