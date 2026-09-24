'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export default function ProductCardItem({ product }: { product: Product }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const displayImage = product.mainImageUrl || product.imageUrl || '';

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
            <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                    width: '100%',
                    aspectRatio: '4/5',
                    backgroundColor: '#0a0a0a',
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                }}>
                    {displayImage ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url('${displayImage}')`,
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
                </div>
            </Link>

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
                        RS. {(product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : (product.actualPrice || product.price || 0)).toLocaleString('en-IN')}
                    </p>
                </Link>
            </div>

            {isQuickViewOpen && <QuickViewModal product={product as any} onClose={() => setIsQuickViewOpen(false)} />}
        </div>
    );
}
