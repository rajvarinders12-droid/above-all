'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import QuickViewModal from '@/components/QuickViewModal';

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

export default function ShopPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                // Fetch Categories
                const catQuery = query(collection(db, 'categories'));
                const catSnapshot = await getDocs(catQuery);
                const fetchedCats: Category[] = [];
                catSnapshot.forEach(doc => {
                    fetchedCats.push({ id: doc.id, name: doc.data().name });
                });
                setCategories(fetchedCats.sort((a, b) => a.name.localeCompare(b.name)));

                // Fetch Products
                const prodQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
                const prodSnapshot = await getDocs(prodQuery);
                const fetchedProds: Product[] = [];
                prodSnapshot.forEach(doc => {
                    const data = doc.data();
                    fetchedProds.push({
                        id: doc.id,
                        name: data.name || 'Unnamed Product',
                        price: data.actualPrice || data.price || 0,
                        imageUrl: data.mainImageUrl || data.imageUrl || '',
                        category: data.category || '',
                        variants: data.variants || [],
                        inStock: data.inStock || 0
                    });
                });
                setProducts(fetchedProds);
            } catch (error) {
                console.error("Error fetching shop data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    let filteredProducts = products;

    if (selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(p =>
            p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
    }

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                Loading products...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '120px 2rem 4rem 2rem', minHeight: '100vh', color: '#fff' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>SHOP ALL</h1>

            <div style={{ display: 'flex', gap: '3rem', flexDirection: 'column' }}>

                {/* Filters Top Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    paddingBottom: '2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#888' }}>Category:</span>
                        <button
                            onClick={() => setSelectedCategory('All')}
                            style={{
                                background: selectedCategory === 'All' ? '#fff' : 'transparent',
                                color: selectedCategory === 'All' ? '#000' : '#fff',
                                border: '1px solid #fff',
                                padding: '0.4rem 1rem',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                style={{
                                    background: selectedCategory === cat.name ? '#fff' : 'transparent',
                                    color: selectedCategory === cat.name ? '#000' : '#fff',
                                    border: '1px solid #fff',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
                        No products found for this category.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {filteredProducts.map((product) => (
                            <ProductCardItem key={product.id} product={product} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
