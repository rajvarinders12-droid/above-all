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

    // Tabs state
    const [activeTab, setActiveTab] = useState<'details' | 'washcare' | 'shipping'>('details');

    // Selections
    const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);
    const addItem = useCartStore(state => (state as any).addItem);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const docRef = doc(db, 'products', resolvedParams.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Product;
                    data.id = docSnap.id;
                    setProduct(data);

                    // Bug Fix: Only use main image or active variant image
                    const defaultImage = data.mainImageUrl;

                    if (data.variants && data.variants.length > 0) {
                        setSelectedColor(data.variants[0]);
                        if (data.variants[0].imageUrl) {
                            setActiveImage(data.variants[0].imageUrl);
                        } else {
                            setActiveImage(defaultImage || '');
                        }
                    } else {
                        setActiveImage(defaultImage || '');
                    }

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

        const price = Number(product?.discountedPrice) > 0 ? Number(product?.discountedPrice) : Number(product?.actualPrice || product?.price || 0);

        addItem({
            cartItemId: `${product!.id}-${selectedColor?.id || 'base'}-${selectedSize || 'nosize'}`,
            productId: product!.id,
            name: product!.name,
            price: price,
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
                    <div style={{ width: '200px', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '2rem' }} className="skeleton-pulse" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>
                        <div style={{ flex: 1, minHeight: '70vh', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} className="skeleton-pulse" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ width: '80%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="skeleton-pulse" />
                            <div style={{ width: '40%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="skeleton-pulse" />
                            <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginTop: '1rem' }} className="skeleton-pulse" />
                        </div>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `.skeleton-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }` }} />
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

    const price = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product.actualPrice || product.price || 0);

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
            <Navbar />

            <style dangerouslySetInnerHTML={{
                __html: `
                .product-layout {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 3rem;
                    align-items: start;
                }
                .pill-button {
                    padding: 0.75rem 1.2rem;
                    border-radius: 40px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    background: transparent;
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 60px;
                    text-align: center;
                }
                .pill-button:hover {
                    border-color: rgba(255, 255, 255, 0.4);
                }
                .pill-button.active {
                    background: var(--text-primary);
                    color: var(--bg-color);
                    border-color: var(--text-primary);
                    font-weight: 500;
                }
                .action-btn {
                    padding: 1.25rem;
                    border-radius: 40px;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    flex: 1;
                }
                .action-btn:active {
                    transform: scale(0.98);
                }
                .btn-outline {
                    background: transparent;
                    color: var(--text-primary);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .btn-outline:hover:not(:disabled) {
                    border-color: var(--text-primary);
                }
                .btn-solid {
                    background: var(--text-primary);
                    color: var(--bg-color);
                    border: 1px solid var(--text-primary);
                }
                .btn-solid:hover:not(:disabled) {
                    opacity: 0.9;
                }
                .tab-header {
                    border-bottom: 2px solid transparent;
                    padding-bottom: 0.5rem;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: var(--text-tertiary);
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .tab-header:hover {
                    color: var(--text-secondary);
                }
                .tab-header.active {
                    border-bottom-color: var(--text-primary);
                    color: var(--text-primary);
                }
                @media (max-width: 900px) {
                    .product-layout { grid-template-columns: 1fr; gap: 2rem; }
                    .action-container { flex-direction: column; }
                }
            `}} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '120px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>

                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '2rem' }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <ChevronRight size={14} />
                    <span>{product.category || 'Shop'}</span>
                    <ChevronRight size={14} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
                </div>

                <div className="product-layout">
                    {/* Immersive Gallery Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            backgroundColor: 'var(--surface-color)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: '3/4',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <img
                                src={activeImage || product.mainImageUrl}
                                alt={product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* Details Container - Dark Theme Design */}
                    <div style={{
                        position: 'sticky',
                        top: '100px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                            {product.name}
                        </h1>
                        <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                            RS. {price.toLocaleString('en-IN')}
                        </div>

                        {/* Color Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '1rem' }}>
                                    Color: <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{selectedColor?.colorName}</span>
                                </div>
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
                                                width: '56px', height: '72px',
                                                backgroundImage: v.imageUrl ? `url('${v.imageUrl}')` : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundColor: v.imageUrl ? 'transparent' : 'var(--surface-color)',
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                boxShadow: selectedColor?.id === v.id ? '0 0 0 2px var(--bg-color), 0 0 0 4px var(--text-primary)' : '0 0 0 1px rgba(255,255,255,0.1)',
                                                position: 'relative',
                                                transition: 'box-shadow 0.2s ease'
                                            }}
                                        >
                                            {selectedColor?.id === v.id && (
                                                <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: 'var(--text-primary)', color: 'var(--bg-color)', borderRadius: '50%', padding: '2px' }}>
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
                            <div style={{ marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Select Size</div>
                                    {product.sizeChartUrl && (
                                        <a href={product.sizeChartUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textDecoration: 'underline' }}>
                                            Size Guide
                                        </a>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {selectedColor.sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`pill-button ${selectedSize === size ? 'active' : ''}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="action-container" style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.inStock !== undefined && product.inStock <= 0}
                                className="action-btn btn-outline"
                                style={{
                                    borderColor: added ? '#2ecc71' : '',
                                    color: added ? '#2ecc71' : '',
                                    opacity: product.inStock !== undefined && product.inStock <= 0 ? 0.3 : 1,
                                    cursor: product.inStock !== undefined && product.inStock <= 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {(product.inStock !== undefined && product.inStock <= 0) ? 'OUT OF STOCK' : added ? <><Check size={18} style={{ marginRight: '8px' }} /> ADDED TO BAG</> : 'ADD TO BAG'}
                            </button>

                            <button
                                disabled={product.inStock !== undefined && product.inStock <= 0}
                                className="action-btn btn-solid"
                                style={{
                                    opacity: product.inStock !== undefined && product.inStock <= 0 ? 0.3 : 1,
                                    cursor: product.inStock !== undefined && product.inStock <= 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                BUY NOW
                            </button>
                        </div>

                        {/* Tabbed Info Section */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                                <div onClick={() => setActiveTab('details')} className={`tab-header ${activeTab === 'details' ? 'active' : ''}`}>Details</div>
                                <div onClick={() => setActiveTab('washcare')} className={`tab-header ${activeTab === 'washcare' ? 'active' : ''}`}>Washcare</div>
                                <div onClick={() => setActiveTab('shipping')} className={`tab-header ${activeTab === 'shipping' ? 'active' : ''}`}>Shipping</div>
                            </div>

                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, minHeight: '120px' }}>
                                {activeTab === 'details' && (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {product.description || 'No description available for this product.'}
                                    </div>
                                )}
                                {activeTab === 'washcare' && (
                                    <div>
                                        <ul style={{ paddingLeft: '1.2rem', margin: '0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <li>Machine wash cold with like colors</li>
                                            <li>Do not bleach or dry clean</li>
                                            <li>Tumble dry low</li>
                                            <li>Warm iron if needed (do not iron on print)</li>
                                        </ul>
                                    </div>
                                )}
                                {activeTab === 'shipping' && (
                                    <div>
                                        <p>Free standard shipping on orders over RS. 5000.</p>
                                        <p style={{ marginTop: '0.5rem' }}>Estimated delivery: 3-5 business days after processing.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
