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
    const { items, updateQuantity, removeItem, getCartTotal, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = getCartTotal();
    const router = useRouter();



    if (!mounted) return <main style={{ minHeight: '100vh', background: 'var(--bg-color)' }}><Navbar /></main>;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '6rem' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '120px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '3rem', fontFamily: 'var(--font-serif)' }}>
                    Your Cart
                </h1>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Your shopping cart is empty.</p>
                        <Link href="/" className="btn-primary" style={{ display: 'inline-flex', padding: '1rem 2rem', textDecoration: 'none', background: 'var(--text-primary)', color: 'var(--bg-color)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>

                        {/* Cart Items List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {items.map((item) => (
                                <div key={item.cartItemId} style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem' }}>
                                    <div style={{ width: '120px', height: '160px', background: 'var(--surface-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.25rem' }}>{item.name}</h3>
                                                    {(item.colorName || item.size) && (
                                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                            {item.colorName && <span>Color: {item.colorName}</span>}
                                                            {item.colorName && item.size && <span> | </span>}
                                                            {item.size && <span>Size: {item.size}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                                    ₹{((Number(item.price) || 0) * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                                    <Minus size={14} />
                                                </button>
                                                <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button onClick={() => removeItem(item.cartItemId)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                    <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '1.25rem' }}>
                                    <span>Total</span>
                                    <span>₹{(Number(total) || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                style={{
                                    width: '100%', padding: '1.25rem', background: 'var(--text-primary)', color: 'var(--bg-color)',
                                    border: 'none', borderRadius: '4px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.1em',
                                    textTransform: 'uppercase', textDecoration: 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <Lock size={16} />
                                Checkout Securely
                            </Link>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                <p>Secured by Razorpay.</p>
                                <p>Use your test API keys in your environment variables to test.</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
