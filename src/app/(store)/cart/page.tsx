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
        <main style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', paddingBottom: '8rem' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '150px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, letterSpacing: '0.05em', fontFamily: 'var(--font-serif)', margin: 0, textTransform: 'uppercase' }}>
                        Cart
                    </h1>
                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'flex-start', marginTop: '0.5rem' }}>[{items.length}]</span>
                </div>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-serif)' }}>Your selection is empty.</p>
                        <Link href="/products" style={{ display: 'inline-flex', padding: '1rem 3rem', textDecoration: 'none', background: '#ffffff', color: '#000000', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.3s' }} className="hover-opacity">
                            Discover Pieces
                        </Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                            {items.map((item) => (
                                <div key={item.cartItemId} className="cart-item-row">
                                    <div style={{ width: '130px', aspectRatio: '3/4', background: '#111', overflow: 'hidden', position: 'relative' }}>
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ paddingRight: '1rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: 400, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>{item.name}</h3>
                                                {(item.colorName || item.size) && (
                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                        {item.colorName && <span>{item.colorName}</span>}
                                                        {item.colorName && item.size && <span> / </span>}
                                                        {item.size && <span>{item.size}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 400 }}>
                                                ₹{((Number(item.price) || 0) * item.quantity).toLocaleString()}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.2)', width: 'fit-content' }}>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                                                    <Minus size={14} strokeWidth={1} />
                                                </button>
                                                <span style={{ width: '40px', textAlign: 'center', fontSize: '0.85rem' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                                                    <Plus size={14} strokeWidth={1} />
                                                </button>
                                            </div>

                                            <button onClick={() => removeItem(item.cartItemId)} className="hover-white" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.3s' }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="cart-summary" style={{ background: 'linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', position: 'sticky', top: '120px', backdropFilter: 'blur(10px)' }}>
                            <h3 style={{ fontSize: '0.9rem', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Subtotal</span>
                                    <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Shipping</span>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Calculated next</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                                    <span>Total</span>
                                    <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="hover-opacity"
                                style={{
                                    width: '100%', padding: '1.25rem', background: '#ffffff', color: '#000000',
                                    border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
                                    textTransform: 'uppercase', textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <Lock size={14} strokeWidth={2} />
                                Secure Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .cart-grid {
                    display: grid;
                    grid-template-columns: 1.8fr 1fr;
                    gap: 6rem;
                    align-items: start;
                }
                .cart-item-row {
                    display: flex;
                    gap: 2rem;
                }
                .hover-opacity:hover {
                    opacity: 0.8 !important;
                }
                .hover-white:hover {
                    color: #fff !important;
                }
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1.2fr 1fr;
                        gap: 3rem;
                    }
                }
                @media (max-width: 768px) {
                    .cart-grid {
                        grid-template-columns: 1fr;
                        gap: 4rem;
                    }
                    .cart-item-row {
                        gap: 1.5rem;
                    }
                    .cart-summary {
                        padding: 1.5rem !important;
                        position: relative !important;
                        top: 0 !important;
                    }
                }
            `}} />
        </main>
    );
}
