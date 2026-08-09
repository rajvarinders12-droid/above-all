'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingBag, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCartStore } from '@/store/cartStore';

interface Variant {
    id: string;
    colorName: string;
    imageUrl: string;
    sizes: string[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    actualPrice: number;
    discountedPrice: number;
    price?: number;
    discountPercent: number;
    inStock: number;
    mainImageUrl: string;
    sizeChartUrl?: string;
    variants: Variant[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Gallery state
    const [activeImage, setActiveImage] = useState<string>('');
    const [allImages, setAllImages] = useState<string[]>([]);

    // Selections
    const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const docRef = doc(db, 'products', resolvedParams.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Product;
                    data.id = docSnap.id;
                    setProduct(data);

                    const images = [data.mainImageUrl];
                    if (data.variants && data.variants.length > 0) {
                        data.variants.forEach((v: Variant) => {
                            if (v.imageUrl && !images.includes(v.imageUrl)) {
                                images.push(v.imageUrl);
                            }
                        });
                        setSelectedColor(data.variants[0]);
                    }
                    setAllImages(images);
                    setActiveImage(images[0]);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [resolvedParams.id]);

    const handleAddToCart = () => {
        if (product?.variants?.length && product.variants.some(v => v.sizes?.length > 0) && !selectedSize) {
            alert("Please select a size");
            return;
        }

        addItem({
            cartItemId: `${product!.id}-${selectedColor?.id || 'base'}-${selectedSize || 'nosize'}`,
            productId: product!.id,
            name: product!.name,
            price: Number(product!.discountedPrice) > 0 ? Number(product!.discountedPrice) : Number(product!.actualPrice || product!.price || 0),
            imageUrl: activeImage || product!.mainImageUrl,
            colorName: selectedColor?.colorName,
            size: selectedSize,
            quantity: 1
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingBottom: '4rem' }}>
                <Navbar />
                <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '100px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

                    {/* Breadcrumb Skeleton */}
                    <div style={{ width: '200px', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '2rem' }} className="skeleton-pulse" />

                    {/* Product Layout Grid Skeleton */}
                    <div className="skeleton-grid-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>

                        {/* Gallery Skeleton */}
                        <div className="skeleton-gallery-container" style={{ display: 'flex', gap: '1.5rem' }}>
                            <div className="skeleton-thumbnail-container" style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[1, 2, 3].map(i => <div key={i} style={{ width: '80px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} className="skeleton-pulse" />)}
                            </div>
                            <div style={{ flex: 1, minHeight: '70vh', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="skeleton-pulse" />
                        </div>

                        {/* Details Skeleton */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <div style={{ width: '80%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }} className="skeleton-pulse" />
                                <div style={{ width: '40%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="skeleton-pulse" />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} className="skeleton-pulse" />
                                <div style={{ width: '90%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} className="skeleton-pulse" />
                                <div style={{ width: '95%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} className="skeleton-pulse" />
                                <div style={{ width: '60%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }} className="skeleton-pulse" />
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                                <div style={{ width: '100px', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }} className="skeleton-pulse" />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {[1, 2].map(i => <div key={i} style={{ width: '60px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} className="skeleton-pulse" />)}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                                <div style={{ width: '100px', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }} className="skeleton-pulse" />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {[1, 2, 3].map(i => <div key={i} style={{ width: '80px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }} className="skeleton-pulse" />)}
                                </div>
                            </div>

                            <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginTop: '1rem' }} className="skeleton-pulse" />
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                    .skeleton-pulse {
                        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    }
                    @media (max-width: 900px) {
                        .skeleton-grid-container { grid-template-columns: 1fr !important; gap: 2rem !important; }
                        .skeleton-thumbnail-container { display: none !important; }
                    }
                `}} />
            </main>
        );
    }

    if (!product) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
                <Navbar />
                <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--text-secondary)' }}>Product not found.</div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
            <Navbar />

            <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '100px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

                {/* Breadcrumb */}
                <div className="product-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <ChevronRight size={14} />
                    <span>{product.category || 'Shop'}</span>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                </div>

                {/* Product Layout Grid */}
                <div className="product-layout" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                    gap: '4rem',
                    alignItems: 'start'
                }}>

                    {/* Gallery Section */}
                    <div className="product-gallery">
                        {/* Desktop Layout */}
                        <div className="gallery-main sticky-gallery">
                            <div className="gallery-thumbnails">
                                {allImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className="gallery-thumbnail-item"
                                        style={{
                                            background: `url(${img}) center/cover`,
                                            border: activeImage === img ? '2px solid var(--text-primary)' : '2px solid transparent',
                                            opacity: activeImage === img ? 1 : 0.6,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="gallery-featured">
                                <img
                                    src={activeImage}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        </div>

                        {/* Mobile Swipeable Gallery */}
                        <div className="gallery-mobile">
                            {allImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="gallery-mobile-item"
                                    style={{
                                        background: `url(${img}) center/cover`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="product-details" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>
                                {product.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {Number(product.discountPercent) > 0 && Number(product.discountedPrice) > 0 ? (
                                    <>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 500 }}>₹{Number(product.discountedPrice).toLocaleString()}</span>
                                        <span style={{ fontSize: '1.25rem', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>₹{Number(product.actualPrice || product.price || 0).toLocaleString()}</span>
                                        <span style={{ background: 'var(--text-primary)', color: 'var(--bg-color)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {product.discountPercent}% OFF
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '1.75rem', fontWeight: 500 }}>₹{Number(product.actualPrice || product.price || 0).toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                            {product.description}
                        </div>

                        {/* Color Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 500 }}>Color: <span style={{ color: 'var(--text-secondary)' }}>{selectedColor?.colorName}</span></span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                                                width: '60px', height: '80px',
                                                borderRadius: '6px',
                                                background: v.imageUrl ? `url(${v.imageUrl}) center/cover` : 'var(--surface-color)',
                                                cursor: 'pointer',
                                                boxShadow: selectedColor?.id === v.id ? '0 0 0 2px var(--bg-color), 0 0 0 4px var(--text-primary)' : 'none',
                                            }}
                                        >
                                            {selectedColor?.id === v.id && (
                                                <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: 'var(--text-primary)', color: 'var(--bg-color)', borderRadius: '50%', padding: '2px' }}>
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sizes */}
                        {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 500 }}>Select Size</span>
                                    {product.sizeChartUrl && (
                                        <a href={product.sizeChartUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline', transition: 'color 0.2s' }} className="hover:text-primary">
                                            Size Guide
                                        </a>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {selectedColor.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            style={{
                                                padding: '1rem 0', width: '80px', textAlign: 'center',
                                                background: selectedSize === size ? 'var(--text-primary)' : 'transparent',
                                                color: selectedSize === size ? 'var(--bg-color)' : 'var(--text-primary)',
                                                border: '1px solid',
                                                borderColor: selectedSize === size ? 'var(--text-primary)' : 'var(--border-color)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '1rem',
                                                fontWeight: 500,
                                                transition: 'var(--transition-fast)'
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div style={{ marginTop: '1rem' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.inStock <= 0}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    height: '60px',
                                    fontSize: '1.1rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    background: added ? '#2ecc71' : (product.inStock <= 0 ? 'var(--surface-color)' : 'var(--text-primary)'),
                                    color: added ? '#fff' : (product.inStock <= 0 ? 'var(--text-tertiary)' : 'var(--bg-color)'),
                                    border: product.inStock <= 0 ? '1px solid var(--border-color)' : 'none',
                                }}
                            >
                                {product.inStock <= 0 ? 'Out of Stock' : added ? <><Check size={20} /> Added to Cart</> : <><ShoppingBag size={20} /> Add to Cart</>}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                Free shipping on orders over ₹5,000. Easy 7-day returns.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
