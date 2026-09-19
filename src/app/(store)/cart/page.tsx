'use client';

import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = getCartTotal();

    if (!mounted) return <main style={{ minHeight: '100vh', background: '#000000' }}><Navbar /></main>;

    return (
        <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', paddingBottom: '8rem', fontFamily: 'var(--font-sans)', letterSpacing: '0.02em' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar />

            <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '160px', paddingLeft: '2rem', paddingRight: '2rem' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Shopping Bag
                    </h1>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                {items.length === 0 ? (
                    <div style={{ padding: '8rem 0', textAlign: 'center' }}>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '3rem' }}>Your bag is currently empty.</p>
                        <Link href="/products" className="btn-outline-premium" style={{ textDecoration: 'none', color: '#fff', border: '1px solid #fff', padding: '1rem 3rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.3s' }}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Left: Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Desktop Headers */}
                            <div className="cart-header" style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <div>Product</div>
                                <div style={{ textAlign: 'center' }}>Quantity</div>
                                <div style={{ textAlign: 'right' }}>Total</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                {items.map((item) => (
                                    <div key={item.cartItemId} className="cart-item-row" style={{ display: 'grid', gridTemplateColumns: '4fr 1fr 1fr', alignItems: 'center', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '3rem' }}>

                                        {/* Product Details */}
                                        <div className="cart-product-col" style={{ display: 'flex', gap: '2rem' }}>
                                            <Link href={`/product/${item.productId}`} style={{ width: '120px', flexShrink: 0, aspectRatio: '3/4', background: '#111', position: 'relative' }}>
                                                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Link>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                                                <Link href={`/product/${item.productId}`} style={{ textDecoration: 'none', color: '#fff', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                                    {item.name}
                                                </Link>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    {item.colorName && <span>Color: {item.colorName}</span>}
                                                    {item.size && <span>Size: {item.size}</span>}
                                                </div>
                                                <button onClick={() => removeItem(item.cartItemId)} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer', textAlign: 'left', marginTop: '1.5rem', transition: 'color 0.3s' }} className="hover-white">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="cart-qty-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                                    <Minus size={12} strokeWidth={1} />
                                                </button>
                                                <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                                    <Plus size={12} strokeWidth={1} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="cart-price-wrapper" style={{ textAlign: 'right', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em' }}>
                                            ₹{((Number(item.price) || 0) * item.quantity).toLocaleString()}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="cart-summary" style={{ position: 'sticky', top: '140px' }}>
                            <div style={{ background: '#070707', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h2 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Summary</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Subtotal</span>
                                        <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Shipping</span>
                                        <span>Calculated next</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)' }}>
                                        <span>Total</span>
                                        <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="btn-primary-solid"
                                    style={{
                                        width: '100%', marginTop: '3rem', padding: '1.25rem',
                                        background: '#ffffff', color: '#000000', border: '1px solid #ffffff',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                                        textDecoration: 'none', transition: 'all 0.3s'
                                    }}
                                >
                                    <Lock size={12} strokeWidth={2} /> Check Out
                                </Link>

                                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <span>✓ Secure encrypted checkout</span>
                                    <span>✓ Processed by Razorpay</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .cart-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 6rem;
                    align-items: start;
                }
                .hover-white:hover {
                    color: #fff !important;
                }
                .btn-outline-premium:hover {
                    background: #fff !important;
                    color: #000 !important;
                }
                .btn-primary-solid:hover {
                    background: transparent !important;
                    color: #fff !important;
                }
                
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1.5fr 1fr;
                        gap: 3rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .cart-grid {
                        grid-template-columns: 1fr;
                        gap: 4rem;
                    }
                    .cart-header {
                        display: none !important;
                    }
                    .cart-item-row {
                        grid-template-columns: 1fr !important;
                        position: relative;
                        gap: 1.5rem !important;
                        padding-bottom: 2rem;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                    }
                    .cart-product-col {
                        gap: 1.25rem !important;
                    }
                    .cart-product-col img {
                        width: 100px !important;
                    }
                    .cart-qty-wrapper {
                        justify-content: flex-start !important;
                        margin-top: 1rem;
                    }
                    .cart-price-wrapper {
                        position: absolute;
                        bottom: 2rem;
                        right: 0;
                        text-align: right;
                    }
                    .cart-summary {
                        position: relative !important;
                        top: 0 !important;
                    }
                    .cart-summary > div {
                        padding: 1.5rem !important;
                    }
                }
            `}} />
        </main>
    );
}
