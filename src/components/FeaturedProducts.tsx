'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  mainImageUrl?: string;
  variants?: any[];
  actualPrice?: number;
  discountedPrice?: number;
  inStock?: number;
}

function ProductCardItem({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        gap: '0.75rem',
      }}
    >
      {/* Image Container */}
      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          width: '100%',
          aspectRatio: '4/5',
          backgroundColor: '#0a0a0a',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {product.imageUrl ? (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url('${product.imageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333'
            }}>
              NO IMAGE
            </div>
          )}

          {/* Carousel Arrows (Visual only for now, visible on hover) */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}>
            <ChevronLeft size={20} />
          </div>

          <div style={{
            position: 'absolute',
            top: '50%',
            right: '12px',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}>
            <ChevronRight size={20} />
          </div>

          {/* Pagination Dots */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '0 0.25rem'
      }}>
        <Link href={`/product/${product.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            fontWeight: 500,
            margin: 0,
            color: '#ffffff',
            lineHeight: '1.2'
          }}>
            {product.name}
          </h3>
          <p style={{
            color: '#ffffff',
            fontWeight: 500,
            fontSize: '0.85rem',
            margin: 0,
          }}>
            RS. {(product.price || 0).toLocaleString('en-IN')}
          </p>
        </Link>
        <div
          style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', padding: '4px' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsQuickViewOpen(true);
          }}
        >
          <Plus size={20} strokeWidth={1.5} color="#ffffff" style={{ marginTop: '2px' }} />
        </div>
      </div>

      {isQuickViewOpen && <QuickViewModal product={product as any} onClose={() => setIsQuickViewOpen(false)} />}
    </div>
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
            imageUrl: data.mainImageUrl || data.imageUrl || '',
            mainImageUrl: data.mainImageUrl || data.imageUrl || '',
            variants: data.variants || [],
            actualPrice: data.actualPrice || 0,
            discountedPrice: data.discountedPrice || 0,
            inStock: data.inStock || 0
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
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>No products in the collection yet.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
      {products.map((product) => (
        <ProductCardItem key={product.id} product={product} />
      ))}
    </div>
  );
}
