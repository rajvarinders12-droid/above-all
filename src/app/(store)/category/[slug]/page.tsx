'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import QuickViewModal from '@/components/QuickViewModal';
import { useParams } from 'next/navigation';

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
    category?: string;
}

interface Category {
    id: string;
    name: string;
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
                        RS. {(product.price || 0).toLocaleString('en-IN')}
                    </p>
                </Link>
            </div>

            {isQuickViewOpen && <QuickViewModal product={product as any} onClose={() => setIsQuickViewOpen(false)} />}
        </div>
    );
}

export default function CategoryProductsPage() {
    const params = useParams();
    const rawSlug = params?.slug as string || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!rawSlug) return;
                setLoading(true);

                // 1. Fetch categories to match the slug and get the exact Case-Sensitive Category Name
                const catQuery = query(collection(db, 'categories'));
                const catSnapshot = await getDocs(catQuery);
                let exactCatName = '';

                catSnapshot.forEach(doc => {
                    const name = doc.data().name;
                    if (name.toLowerCase().replace(/\s+/g, '-') === rawSlug) {
                        exactCatName = name;
                    }
                });

                if (!exactCatName) {
                    exactCatName = rawSlug.replace(/-/g, ' '); // Fallback
                }
                setCategoryName(exactCatName);

                // 2. Fetch products and filter by exact category
                const prodQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
                const prodSnapshot = await getDocs(prodQuery);
                const fetchedProds: Product[] = [];

                prodSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.category === exactCatName) {
                        fetchedProds.push({
                            id: doc.id,
                            name: data.name || 'Unnamed Product',
                            price: data.actualPrice || data.price || 0,
                            actualPrice: data.actualPrice || 0,
                            discountedPrice: data.discountedPrice || 0,
                            imageUrl: data.mainImageUrl || data.imageUrl || '',
                            category: data.category || '',
                            variants: data.variants || [],
                            inStock: data.inStock || 0
                        });
                    }
                });

                setProducts(fetchedProds);
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [rawSlug]);

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#000' }}>
                <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading {rawSlug}...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '120px 2rem 4rem 2rem', minHeight: '100vh', color: '#fff', background: '#000' }}>

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Collection
                </div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0, textTransform: 'uppercase' }}>
                    {categoryName}
                </h1>
            </div>

            {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
                    No products found for the {categoryName} collection at this time.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {products.map((product) => (
                        <ProductCardItem key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
