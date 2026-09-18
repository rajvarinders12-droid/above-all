'use client';

import { useState } from 'react';
import { X, Check, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export interface Variant {
    id: string;
    colorName: string;
    imageUrl: string;
    sizes: string[];
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    category?: string;
    actualPrice: number;
    discountedPrice?: number;
    price?: number;
    discountPercent?: number;
    inStock?: number;
    mainImageUrl: string;
    imageUrl?: string;
    sizeChartUrl?: string;
    variants?: Variant[];
}

interface QuickViewModalProps {
    product: Product;
    onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
    const [selectedColor, setSelectedColor] = useState<Variant | null>(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [activeImage, setActiveImage] = useState<string>(product.mainImageUrl || product.imageUrl || '');
    const [added, setAdded] = useState(false);

    // Add to cart function
    const addItem = useCartStore((state) => (state as any).addItem);

    const price = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product.actualPrice || product.price || 0);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.variants && product.variants.some(v => v.sizes?.length > 0) && !selectedSize) {
            alert("Please select a size");
            return;
        }

        addItem({
            cartItemId: `${product.id}-${selectedColor?.id || 'base'}-${selectedSize || 'nosize'}`,
            productId: product.id,
            name: product.name,
            price: price,
            imageUrl: activeImage,
            colorName: selectedColor?.colorName,
            size: selectedSize,
            quantity: 1
        });

        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 1500);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }} onClick={(e) => e.stopPropagation()} className="quick-view-container">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(0,0,0,0.1)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                >
                    <X size={18} color="#000" />
                </button>

                {/* Main Content Layout */}
                <div style={{ display: 'flex', width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>

                    {/* Image Section */}
                    <div style={{
                        flex: '1 1 50%',
                        minWidth: '300px',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={activeImage}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', maxHeight: '70vh' }}
                        />
                    </div>

                    {/* Details Section */}
                    <div style={{
                        flex: '1 1 50%',
                        padding: '2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        minWidth: '300px'
                    }}>

                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>{product.name}</h2>
                            <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                ₹{price.toLocaleString('en-IN')}
                            </div>
                        </div>

                        {/* Color Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                                    Color: <span style={{ fontWeight: 400, color: '#666' }}>{selectedColor?.colorName}</span>
                                </span>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {product.variants.map((v) => (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedColor(v);
                                                if (v.imageUrl) setActiveImage(v.imageUrl);
                                                setSelectedSize(''); // reset size
                                            }}
                                            style={{
                                                position: 'relative',
                                                width: '50px', height: '64px',
                                                backgroundImage: v.imageUrl ? `url('${v.imageUrl}')` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: v.imageUrl ? 'transparent' : '#eee',
                                                cursor: 'pointer',
                                                borderRadius: '4px',
                                                boxShadow: selectedColor?.id === v.id ? '0 0 0 2px #fff, 0 0 0 4px #000' : 'none',
                                            }}
                                        >
                                            {selectedColor?.id === v.id && (
                                                <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#000', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                                                    <Check size={10} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Size</span>
                                    {product.sizeChartUrl && (
                                        <a href={product.sizeChartUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'underline' }}>
                                            Size Guide
                                        </a>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedColor.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                minWidth: '60px',
                                                textAlign: 'center',
                                                background: selectedSize === size ? '#000' : 'transparent',
                                                color: selectedSize === size ? '#fff' : '#000',
                                                border: '1px solid',
                                                borderColor: selectedSize === size ? '#000' : '#ddd',
                                                borderRadius: '24px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.inStock !== undefined && product.inStock <= 0}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    borderRadius: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: added ? '#2ecc71' : (product.inStock !== undefined && product.inStock <= 0 ? '#f5f5f5' : '#000'),
                                    color: added ? '#fff' : (product.inStock !== undefined && product.inStock <= 0 ? '#999' : '#fff'),
                                    border: product.inStock !== undefined && product.inStock <= 0 ? '1px solid #ddd' : 'none',
                                    cursor: product.inStock !== undefined && product.inStock <= 0 ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s'
                                }}
                            >
                                {(product.inStock !== undefined && product.inStock <= 0) ? 'Out of Stock' : added ? <><Check size={18} /> Added to Bag</> : <><ShoppingBag size={18} /> Add to Bag</>}
                            </button>

                            <a
                                href={`/product/${product.id}`}
                                style={{
                                    textAlign: 'center',
                                    textDecoration: 'underline',
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                View Full Details
                            </a>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (max-width: 768px) {
                        .quick-view-container {
                            flex-direction: column !important;
                            max-height: 85vh !important;
                        }
                        .quick-view-container > div:first-child {
                            min-height: 300px;
                        }
                    }
                `}} />
            </div>
        </div>
    );
}
