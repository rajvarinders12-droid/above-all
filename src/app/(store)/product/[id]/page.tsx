'use client';

import { useEffect, useState, use, useRef } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
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
    galleryImages?: string[];
    variants: Variant[];
    sizes?: string[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeImage, setActiveImage] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<Variant | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [added, setAdded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [showSizeChart, setShowSizeChart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const allImages = product ? Array.from(new Set([
        product.mainImageUrl,
        ...(product.galleryImages || []),
        ...(product.variants?.map((v: Variant) => v.imageUrl) || [])
    ].filter(img => img && typeof img === 'string' && img.trim() !== '' && img !== 'undefined' && img !== 'null')
        .map(img => (img.includes('.heic') || img.includes('.HEIC')) && !img.includes('f_auto') ? img.replace('/upload/', '/upload/f_auto,q_auto/') : img)
    )) : [];

    const [recommendations, setRecommendations] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = (e: any) => {
        const el = e.currentTarget;
        const scrollMax = el.scrollWidth - el.clientWidth;
        if (scrollMax > 0) {
            setScrollProgress((el.scrollLeft / scrollMax) * 100);
        }
    };

    // Fallback for cartStore
    const addItem = useCartStore(state => (state as any).addItem || (() => { }));

    useEffect(() => {
        async function fetchRecs() {
            try {
                const q = query(collection(db, 'products'));
                const querySnapshot = await getDocs(q);
                let prods: any[] = [];
                querySnapshot.forEach((docSnap) => {
                    if (docSnap.id !== resolvedParams.id) {
                        const d = docSnap.data();
                        prods.push({ id: docSnap.id, name: d.name, price: d.actualPrice || d.price || 0, imageUrl: d.mainImageUrl || d.imageUrl || '' });
                    }
                });
                for (let i = prods.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [prods[i], prods[j]] = [prods[j], prods[i]];
                }
                setRecommendations(prods.slice(0, 4));
            } catch (e) {
                console.error(e);
            }
        }
        fetchRecs();
    }, [resolvedParams.id]);

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
                            setCurrentImageIndex(0);
                        } else {
                            setActiveImage(defaultImage || '');
                            setCurrentImageIndex(0);
                        }
                    } else {
                        setActiveImage(defaultImage || '');
                        setCurrentImageIndex(0);
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
        const hasVariantSizes = product?.variants?.length ? product.variants.some(v => v.sizes?.length > 0) : false;
        const hasRootSizes = (!product?.variants || product.variants.length === 0) && product?.sizes && product.sizes.length > 0;

        if ((hasVariantSizes || hasRootSizes) && !selectedSize) {
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
            quantity: quantity
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

    let originalPrice = Number(product.actualPrice || product.price || 0);
    let sellingPrice = Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : originalPrice;

    // Auto-correct if user entered the prices backwards in the admin portal
    if (sellingPrice > originalPrice && originalPrice > 0) {
        const temp = sellingPrice;
        sellingPrice = originalPrice;
        originalPrice = temp;
    }

    const hasDiscount = originalPrice > sellingPrice;
    const discountAmount = hasDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    const price = sellingPrice;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
            <Navbar />

            <style dangerouslySetInnerHTML={{
                __html: `
                .premium-product-layout {
                    display: grid;
                    grid-template-columns: 50% 50%;
                    grid-template-rows: auto 1fr;
                    min-height: 100vh;
                    padding-top: 80px;
                }
                
                .image-section {
                    position: sticky;
                    top: 80px;
                    height: calc(100vh - 80px);
                    background: var(--bg-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .image-section img {
                    object-fit: contain;
                    object-position: center;
                }

                @keyframes subtleZoom {
                    from { transform: scale(1.05); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .details-section {
                    padding: 1rem 8% 4rem 8%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: var(--bg-color); /* pure dark background */
                }

                .breadcrumb-container {
                    grid-column: 1 / -1;
                    padding: 1.5rem 5% 0.5rem 5%;
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

                .rec-card {
                    width: calc(25% - 0.75rem);
                }
                .progress-bar-container {
                    display: none;
                }

                @media (max-width: 1024px) {
                    .details-section { padding: 3rem 5%; }
                    .action-buttons { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .rec-card {
                        width: 45%;
                    }
                    .progress-bar-container {
                        display: block;
                    }
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
                        height: auto;
                        width: 100%;
                    }
                    .details-section {
                        padding: 1rem 1.5rem 2.5rem 1.5rem;
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

                {/* Immersive Image Section with Lightbox toggle & Carousel */}
                <div className="image-section" style={{ position: 'relative' }}>
                    <div style={{ width: '100%', flex: 1, position: 'relative', cursor: 'zoom-in', background: 'transparent', overflow: 'hidden' }} onClick={() => {
                        const idx = allImages.indexOf(activeImage || product.mainImageUrl);
                        setLightboxIndex(idx >= 0 ? idx : 0);
                        setIsLightboxOpen(true);
                    }}>
                        <img
                            key={activeImage} // Force re-render for animation on change
                            src={activeImage || product.mainImageUrl}
                            alt={product.name}
                            loading="eager"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'subtleZoom 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
                        />
                        {/* Carousel Navigation (only if multiple images) overlay on main image */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIdx = allImages.indexOf(activeImage);
                                        let prevIdx = currentIdx <= 0 ? allImages.length - 1 : currentIdx - 1;
                                        setActiveImage(allImages[prevIdx]);
                                    }}
                                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const currentIdx = allImages.indexOf(activeImage);
                                        let nextIdx = currentIdx === allImages.length - 1 ? 0 : currentIdx + 1;
                                        setActiveImage(allImages[nextIdx]);
                                    }}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail List */}
                    {allImages.length > 1 && (
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            padding: '1rem',
                            overflowX: 'auto',
                            width: '100%',
                            background: 'var(--bg-color)',
                            minHeight: '120px'
                        }}>
                            {allImages.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}
                                    style={{
                                        width: '80px',
                                        height: '100px',
                                        flexShrink: 0,
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        border: img === activeImage ? '2px solid var(--text-primary)' : '2px solid transparent',
                                        opacity: img === activeImage ? 1 : 0.6,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${i}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            if (e.currentTarget.parentElement) {
                                                e.currentTarget.parentElement.style.display = 'none';
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}


                </div>

                {/* Details Section */}
                <div className="details-section">

                    {/* Title and Price */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        <h1 className="product-title" style={{ fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)', margin: 0, fontWeight: 700 }}>{product.name}</h1>
                        <div className="product-price" style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>RS. {sellingPrice.toLocaleString('en-IN')}</span>
                            {hasDiscount && (
                                <>
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>
                                        RS. {originalPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        -{discountAmount}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="section-label">
                        <span>DESCRIPTION</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', lineHeight: 1.75, marginBottom: '2.5rem', whiteSpace: 'pre-wrap' }}>
                        {product.description || 'No description available for this product.'}
                    </div>

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

                    {/* Sizes (from Variant) */}
                    {product.variants && product.variants.length > 0 && selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0 && (
                        <div>
                            <div className="section-label">
                                <span>Select Size</span>
                                {product.sizeChartUrl && (
                                    <button
                                        onClick={() => setShowSizeChart(true)}
                                        style={{ color: 'inherit', textDecoration: 'underline', background: 'none', border: 'none', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}
                                    >
                                        Size Guide
                                    </button>
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

                    {/* Sizes (from Root, simple product) */}
                    {(!product.variants || product.variants.length === 0) && product.sizes && product.sizes.length > 0 && (
                        <div>
                            <div className="section-label">
                                <span>Select Size</span>
                                {product.sizeChartUrl && (
                                    <button
                                        onClick={() => setShowSizeChart(true)}
                                        style={{ color: 'inherit', textDecoration: 'underline', background: 'none', border: 'none', fontSize: 'inherit', cursor: 'pointer', padding: 0 }}
                                    >
                                        Size Guide
                                    </button>
                                )}
                            </div>
                            <div className="size-selector">
                                {product.sizes.map(size => (
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

                    {/* Quantity */}
                    <div className="section-label">
                        <span>Quantity</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>-</button>
                        <span style={{ padding: '0.5rem 1rem', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                        <button onClick={() => setQuantity(quantity + 1)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                    </div>

                    {/* Actions */}
                    <div className="action-buttons" style={{ gridTemplateColumns: '1fr' }}>
                        <button
                            onClick={handleAddToCart}
                            disabled={product.inStock !== undefined && product.inStock <= 0}
                            className="btn-premium btn-buy"
                            style={{
                                background: added ? '#2ecc71' : '#fff',
                                color: added ? '#fff' : '#000',
                                borderColor: added ? '#2ecc71' : '#fff',
                                padding: '1.25rem 2rem',
                                borderRadius: '4px',
                                fontWeight: 700
                            }}
                        >
                            {(product.inStock !== undefined && product.inStock <= 0) ? 'OUT OF STOCK' : added ? (
                                <><Check size={18} style={{ marginRight: '8px' }} /> ADDED TO CART — RS. {price.toLocaleString('en-IN')}</>
                            ) : (
                                `ADD TO CART — RS. ${price.toLocaleString('en-IN')}`
                            )}
                        </button>
                    </div>


                </div>
            </div>

            {/* Recommendations / Top Picks */}
            {recommendations.length > 0 && (
                <div style={{ padding: '6rem 5% 4rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-color)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>ABOVA TOP PICKS</h2>

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        style={{
                            display: 'flex', gap: '1rem', overflowX: 'auto', scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none',
                        }}
                    >
                        {recommendations.map((prod) => (
                            <div key={prod.id} className="rec-card" style={{ flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                                <Link href={`/product/${prod.id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ width: '100%', aspectRatio: '4/5', background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', position: 'relative' }}>
                                        <img src={prod.imageUrl} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 500, letterSpacing: '0.05em' }}>{prod.name}</h3>
                                    <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>RS. {prod.price.toLocaleString('en-IN')}</p>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Swipe Progress Bar */}
                    <div className="progress-bar-container" style={{ width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '2rem auto 0 auto', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: '50%', height: '100%', background: '#fff', transform: `translateX(${scrollProgress}%)`, transition: 'transform 0.1s ease-out' }} />
                    </div>
                </div>
            )}

            {/* Size Chart ModalOverlay */}
            {showSizeChart && product.sizeChartUrl && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{ background: '#000', borderRadius: '12px', padding: '0', maxWidth: '1000px', width: '100%', maxHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', border: '1px solid #333' }}>
                        <button
                            onClick={() => setShowSizeChart(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', zIndex: 10 }}
                        >×</button>
                        <img
                            src={product.sizeChartUrl}
                            alt="Size Guide"
                            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block', borderRadius: '12px' }}
                        />
                    </div>
                </div>
            )}

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

