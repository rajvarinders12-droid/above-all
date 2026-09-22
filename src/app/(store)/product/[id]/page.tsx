'use client';

import { useEffect, useState, use } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
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

    const [activeImage, setActiveImage] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'details' | 'washcare' | 'shipping'>('details');

    const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const allImages = product ? Array.from(new Set([
        product.mainImageUrl,
        ...(product.variants?.map((v: Variant) => v.imageUrl) || [])
    ].filter(Boolean))) : [];

    // Fallback for cartStore
    const addItem = useCartStore(state => (state as any).addItem || (() => { }));

    useEffect(() => {
        async function fetchProduct() {
            try {
                const docRef = doc(db, 'products', resolvedParams.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Product;
                    data.id = docSnap.id;
                    setProduct(data);

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
            <main style={{ minHeight: '100vh', background: 'var(--bg-color)', overflow: 'hidden' }}>
                <Navbar />
                <div style={{ display: 'flex', width: '100vw', height: '100vh', paddingTop: '80px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)' }} className="skeleton-pulse" />
                    <div style={{ flex: 1, padding: '4rem 6rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ width: '60%', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="skeleton-pulse" />
                        <div style={{ width: '30%', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} className="skeleton-pulse" />
                        <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '2rem' }} className="skeleton-pulse" />
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
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <Navbar />

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-product-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto 1fr;
                    min-height: 100vh;
                    padding-top: 80px;
                }
                
                .image-section {
                    position: sticky;
                    top: 80px;
                    height: calc(100vh - 80px);
                    background: #111;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .image-section img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center;
                    animation: subtleZoom 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                @keyframes subtleZoom {
                    from { transform: scale(1.05); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .details-section {
                    padding: 4rem 10%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: var(--bg-color); /* pure dark background */
                }

                .breadcrumb-container {
                    grid-column: 1 / -1;
                    padding: 1.5rem 5% 1rem 5%;
                    background: var(--bg-color);
                    display: flex;
                    width: 100%;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                    opacity: 0.8;
                    width: 100%;
                    max-width: 1440px;
                    margin: 0 auto;
                }

                .breadcrumb a {
                    color: inherit;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                
                .breadcrumb a:hover {
                    color: var(--text-primary);
                }

                .product-title {
                    font-size: clamp(2.5rem, 4vw, 4rem);
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    line-height: 1.05;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                }

                .product-price {
                    font-size: 1.5rem;
                    font-weight: 300;
                    color: var(--text-secondary);
                    margin-bottom: 3rem;
                    letter-spacing: 0.02em;
                }

                .section-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                    margin-bottom: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .color-selector {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-bottom: 3rem;
                }
                
                .color-box {
                    width: 60px;
                    height: 80px;
                    background-size: cover;
                    background-position: center;
                    cursor: pointer;
                    position: relative;
                    transition: transform 0.3s ease, filter 0.3s ease;
                    filter: grayscale(80%);
                }

                .color-box::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: 100%;
                    height: 2px;
                    background: var(--text-primary);
                    transition: transform 0.3s ease;
                }

                .color-box:hover {
                    filter: grayscale(0%);
                }

                .color-box.active {
                    filter: grayscale(0%);
                    transform: scale(1.05);
                }

                .color-box.active::after {
                    transform: translateX(-50%) scaleX(1);
                }

                .size-selector {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .size-btn {
                    padding: 0.25rem 0.5rem;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .size-btn::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 50%;
                    width: 100%;
                    height: 1px;
                    background: var(--text-primary);
                    transform: translateX(-50%) scaleX(0);
                    transition: transform 0.3s ease;
                }

                .size-btn:hover {
                    color: var(--text-primary);
                }

                .size-btn.active {
                    color: var(--text-primary);
                    font-weight: 600;
                }

                .size-btn.active::after {
                    transform: translateX(-50%) scaleX(1);
                }

                .action-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 4rem;
                }

                .btn-premium {
                    padding: 1.25rem 2rem;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .btn-add {
                    background: transparent;
                    color: var(--text-primary);
                    border: 1px solid var(--text-primary);
                }

                .btn-add:hover:not(:disabled) {
                    background: rgba(255,255,255,0.05);
                }

                .btn-buy {
                    background: var(--text-primary);
                    color: var(--bg-color);
                    border: 1px solid var(--text-primary);
                }

                .btn-buy:hover:not(:disabled) {
                    opacity: 0.85;
                }

                .btn-premium:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .tabs-container {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 2rem;
                }

                .tabs-header {
                    display: flex;
                    gap: 2.5rem;
                    margin-bottom: 2rem;
                }

                .tab-item {
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    position: relative;
                    padding-bottom: 0.5rem;
                    transition: color 0.3s;
                }

                .tab-item:hover {
                    color: var(--text-secondary);
                }

                .tab-item.active {
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .tab-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 1px;
                    background: var(--text-primary);
                }

                .tab-content {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    font-weight: 300;
                    min-height: 120px;
                    animation: fadeIn 0.4s ease forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 1024px) {
                    .details-section { padding: 3rem 5%; }
                    .action-buttons { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .premium-product-layout {
                        display: flex;
                        flex-direction: column;
                        padding-top: 70px;
                    }
                    .breadcrumb-container {
                        padding: 1rem 1.5rem;
                    }
                    .image-section {
                        position: relative;
                        top: 0;
                        height: 60vh;
                        width: 100%;
                    }
                    .details-section {
                        padding: 2.5rem 1.5rem;
                    }
                    .product-title {
                        font-size: 2.25rem;
                    }
                    .tabs-header {
                        gap: 1.5rem;
                    }
                }
                `}} />

            <div className="premium-product-layout">
                {/* Breadcrumb full width top bar */}
                <div className="breadcrumb-container">
                    <div className="breadcrumb">
                        <Link href="/">Home</Link>
                        {product.category && (
                            <>
                                <ChevronRight size={12} />
                                <Link href={`/category/${product.category.toLowerCase().replace(/\\s+/g, '-')}`}>
                                    {product.category}
                                </Link>
                            </>
                        )}
                        <ChevronRight size={12} />
                        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                    </div>
                </div>

                {/* Immersive Image Section with Lightbox toggle */}
                <div className="image-section" style={{ cursor: 'zoom-in' }} onClick={() => {
                    const idx = allImages.indexOf(activeImage || product.mainImageUrl);
                    setLightboxIndex(idx >= 0 ? idx : 0);
                    setIsLightboxOpen(true);
                }}>
                    <img
                        key={activeImage} // Force re-render for animation on change
                        src={activeImage || product.mainImageUrl}
                        alt={product.name}
                        loading="eager"
                    />
                </div>

                {/* Details Section */}
                <div className="details-section">

                    <h1 className="product-title">{product.name}</h1>
                    <div className="product-price">RS. {price.toLocaleString('en-IN')}</div>

                    {/* Colors */}
                    {product.variants && product.variants.length > 0 && (
                        <div>
                            <div className="section-label">
                                <span>Color — <span style={{ color: 'var(--text-primary)' }}>{selectedColor?.colorName}</span></span>
                            </div>
                            <div className="color-selector">
                                {product.variants.map((v) => (
                                    <div
                                        key={v.id}
                                        onClick={() => {
                                            setSelectedColor(v);
                                            if (v.imageUrl) setActiveImage(v.imageUrl);
                                            setSelectedSize('');
                                        }}
                                        className={`color-box ${selectedColor?.id === v.id ? 'active' : ''}`}
                                        style={{
                                            backgroundImage: v.imageUrl ? `url('${v.imageUrl}')` : 'none',
                                            backgroundColor: v.imageUrl ? 'transparent' : 'var(--surface-color)',
                                        }}
                                        title={v.colorName}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sizes */}
                    {selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                        <div>
                            <div className="section-label">
                                <span>Select Size</span>
                                {product.sizeChartUrl && (
                                    <a href={product.sizeChartUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                        Size Guide
                                    </a>
                                )}
                            </div>
                            <div className="size-selector">
                                {selectedColor.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="action-buttons">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.inStock !== undefined && product.inStock <= 0}
                            className="btn-premium btn-add"
                            style={{
                                color: added ? '#2ecc71' : '',
                                borderColor: added ? '#2ecc71' : ''
                            }}
                        >
                            {(product.inStock !== undefined && product.inStock <= 0) ? 'OUT OF STOCK' : added ? (
                                <><Check size={18} style={{ marginRight: '8px' }} /> ADDED TO BAG</>
                            ) : (
                                'ADD TO BAG'
                            )}
                        </button>

                        <button
                            disabled={product.inStock !== undefined && product.inStock <= 0}
                            className="btn-premium btn-buy"
                        >
                            BUY NOW
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="tabs-container">
                        <div className="tabs-header">
                            <div onClick={() => setActiveTab('details')} className={`tab-item ${activeTab === 'details' ? 'active' : ''}`}>Details</div>
                            <div onClick={() => setActiveTab('washcare')} className={`tab-item ${activeTab === 'washcare' ? 'active' : ''}`}>Washcare</div>
                            <div onClick={() => setActiveTab('shipping')} className={`tab-item ${activeTab === 'shipping' ? 'active' : ''}`}>Shipping</div>
                        </div>

                        <div className="tab-content" key={activeTab}>
                            {activeTab === 'details' && (
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {product.description || 'No description available for this product.'}
                                </div>
                            )}
                            {activeTab === 'washcare' && (
                                <ul style={{ paddingLeft: '1.2rem', margin: '0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <li>Machine wash cold with like colors</li>
                                    <li>Do not bleach or dry clean</li>
                                    <li>Tumble dry low</li>
                                    <li>Warm iron if needed (do not iron on print)</li>
                                </ul>
                            )}
                            {activeTab === 'shipping' && (
                                <div>
                                    <p>Free standard shipping on orders over RS. 5000.</p>
                                    <p style={{ marginTop: '0.75rem' }}>Estimated delivery: 3-5 business days after processing.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
                }}>
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#fff', fontSize: '3rem', cursor: 'pointer', zIndex: 10000, fontWeight: 300, lineHeight: 1 }}
                    >×</button>

                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
                            }}
                            style={{ position: 'absolute', left: '2%', background: 'none', border: 'none', color: '#fff', padding: '1rem', cursor: 'pointer', zIndex: 10000 }}
                        >
                            <ChevronLeft size={48} strokeWidth={1} />
                        </button>
                    )}

                    <img
                        src={allImages[lightboxIndex]}
                        alt="Product View"
                        style={{ maxWidth: '100%', maxHeight: '100vh', objectFit: 'contain', animation: 'fadeIn 0.3s ease' }}
                    />

                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
                            }}
                            style={{ position: 'absolute', right: '2%', background: 'none', border: 'none', color: '#fff', padding: '1rem', cursor: 'pointer', zIndex: 10000 }}
                        >
                            <ChevronRight size={48} strokeWidth={1} />
                        </button>
                    )}

                    <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', gap: '0.75rem', zIndex: 10000, width: '100%', justifyContent: 'center' }}>
                        {allImages.map((_, i) => (
                            <div key={i} onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(i);
                            }} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === lightboxIndex ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'background 0.3s' }} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}

