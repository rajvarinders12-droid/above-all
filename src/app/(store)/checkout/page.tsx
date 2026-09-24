'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lock, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
    const { items, getCartTotal, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ id: string, code: string, discountValue: number, discountType: 'fixed' | 'percentage' } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [verifyingCoupon, setVerifyingCoupon] = useState(false);

    // Form State
    const [contact, setContact] = useState({ email: '', phone: '' });
    const [address, setAddress] = useState({
        firstName: '',
        lastName: '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: ''
    });

    const subtotal = getCartTotal();

    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.discountType === 'fixed') {
            discountAmount = appliedCoupon.discountValue;
        } else if (appliedCoupon.discountType === 'percentage') {
            discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
        }
    }
    const totalToPay = Math.max(0, subtotal - discountAmount);

    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleApplyCoupon = async () => {
        const codeToApply = couponCode.trim().toUpperCase();
        if (!codeToApply) return;
        setVerifyingCoupon(true);
        setCouponError('');
        try {
            const q = query(collection(db, 'coupons'), where('code', '==', codeToApply));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setCouponError('Invalid coupon code.');
                setAppliedCoupon(null);
            } else {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                if (!data.active) {
                    setCouponError('This coupon has expired.');
                    setAppliedCoupon(null);
                } else {
                    setAppliedCoupon({ id: doc.id, code: data.code, discountValue: parseFloat(data.discountValue), discountType: data.discountType });
                    setCouponError('');
                }
            }
        } catch (error) {
            console.error("Error verifying coupon", error);
            setCouponError('Error verifying coupon.');
        } finally {
            setVerifyingCoupon(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow checkout if free (e.g. 100% coupon) but items must exist
        if (items.length === 0) return;
        setIsVerifying(true);

        const customerName = `${address.firstName} ${address.lastName}`.trim();

        const saveOrderToFirebase = async (paymentId: string) => {
            try {
                // Firestore strictly forbids undefined values. Strip any undefined (like missing sizes).
                const cleanOrderData = JSON.parse(JSON.stringify({
                    orderId: paymentId,
                    items: items,
                    subtotal: subtotal,
                    discountAmount: discountAmount,
                    couponApplied: appliedCoupon ? appliedCoupon.code : null,
                    totalAmount: totalToPay,
                    status: 'Processing',
                    customerName: customerName,
                    customerEmail: contact.email,
                    phone: contact.phone,
                    shippingAddress: address,
                }));
                cleanOrderData.createdAt = serverTimestamp();

                await addDoc(collection(db, 'orders'), cleanOrderData);
            } catch (e: any) {
                console.error("Firebase Order Save Error:", e);
            }
        };

        try {
            // Free orders (100% discount) skip razorpay
            if (totalToPay === 0) {
                await saveOrderToFirebase('free_' + Date.now());
                alert("Order placed successfully!");
                clearCart();
                setIsVerifying(false);
                router.push('/');
                return;
            }

            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalToPay })
            });
            const order = await res.json();

            if (order.error) {
                alert("Failed to initialize payment. Check API key configuration.");
                setIsVerifying(false);
                return;
            }

            if (order.isMock) {
                await saveOrderToFirebase('mock_' + Date.now());
                alert("[TEST MODE]: Payment successful! Your order has been placed securely.");
                clearCart();
                setIsVerifying(false);
                router.push('/');
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
                amount: order.amount,
                currency: order.currency,
                name: "ABOVA | Above All",
                description: "Purchase from Above All Store",
                order_id: order.id,
                handler: async function (response: any) {
                    console.log("PAYMENT SUCCESS:", response);
                    await saveOrderToFirebase(response.razorpay_order_id || 'manual');
                    alert("Payment successful! Your order has been placed.");
                    clearCart();
                    router.push('/');
                },
                prefill: {
                    name: customerName,
                    email: contact.email,
                    contact: contact.phone
                },
                theme: {
                    color: "#000000"
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                alert("Payment failed: " + response.error.description);
                setIsVerifying(false);
            });

            paymentObject.open();

        } catch (error) {
            console.error(error);
            alert("Something went wrong initializing payment.");
            setIsVerifying(false);
        }
    };

    if (!mounted) return <main style={{ minHeight: '100vh', background: 'var(--bg-color)' }}><Navbar /></main>;

    if (items.length === 0) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
                <Navbar />
                <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '150px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Checkout</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your cart is empty.</p>
                    <Link href="/cart" className="btn-secondary">Return to Cart</Link>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)', paddingBottom: '6rem' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '120px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Back to Cart
                    </Link>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .checkout-grid {
                        display: grid;
                        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
                        gap: 4rem;
                        align-items: start;
                    }
                    @media (max-width: 768px) {
                        .checkout-grid {
                            grid-template-columns: 1fr;
                            gap: 2rem;
                        }
                    }
                `}} />
                <div className="checkout-grid">
                    {/* Left Column: Forms */}
                    <form id="checkout-form" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                        {/* Contact Information */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                1. Contact Information
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label-clean">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="input-clean"
                                        placeholder="you@example.com"
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-clean">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        className="input-clean"
                                        placeholder="+91 9876543210"
                                        value={contact.phone}
                                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Shipping Address */}
                        <section>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                2. Shipping Address
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="label-clean">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={address.firstName}
                                        onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-clean">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={address.lastName}
                                        onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                                    />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label-clean">Address Label / Street</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        placeholder="Apartment, suite, etc. & Street Address"
                                        value={address.addressLine1}
                                        onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                                    />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label-clean">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-clean">State / Province</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label-clean">Postal Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-clean"
                                        value={address.postalCode}
                                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                    </form>

                    {/* Right Column: Order Summary */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2rem', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h3>

                        {/* Coupon Section */}
                        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                            <label className="label-clean" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Tag size={14} /> Have a coupon?
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="input-clean"
                                    style={{ textTransform: 'uppercase', marginBottom: 0 }}
                                    disabled={!!appliedCoupon || verifyingCoupon}
                                />
                                <button
                                    type="button"
                                    onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponCode('') } : handleApplyCoupon}
                                    disabled={verifyingCoupon || (!couponCode && !appliedCoupon)}
                                    className="btn-secondary"
                                    style={{ padding: '0 1.25rem', whiteSpace: 'nowrap', minHeight: '100%' }}
                                >
                                    {verifyingCoupon ? 'Wait' : appliedCoupon ? 'Remove' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{couponError}</p>}
                            {appliedCoupon && <p style={{ color: '#4ade80', fontSize: '0.85rem', marginTop: '0.5rem' }}>Coupon <strong>{appliedCoupon.code}</strong> applied!</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '35vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {items.map((item) => (
                                <div key={item.cartItemId} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '80px', background: 'var(--surface-color)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                        ₹{((Number(item.price) || 0) * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', fontSize: '0.95rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                                <span>₹{(Number(subtotal) || 0).toLocaleString()}</span>
                            </div>
                            {appliedCoupon && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>- ₹{Math.round(discountAmount).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '1.25rem' }}>
                                <span>Total</span>
                                <span>₹{Math.round(totalToPay).toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isVerifying}
                            style={{
                                width: '100%', padding: '1.25rem', background: 'var(--text-primary)', color: 'var(--bg-color)',
                                border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.1em',
                                textTransform: 'uppercase', cursor: isVerifying ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            <Lock size={16} />
                            {isVerifying ? 'Processing...' : totalToPay === 0 ? 'Place Free Order' : `Pay ₹${Math.round(totalToPay).toLocaleString()}`}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
