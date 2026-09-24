'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Package, User, MapPin, CreditCard, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'orders', id), (docSnap) => {
            if (docSnap.exists()) {
                setOrder({ id: docSnap.id, ...docSnap.data() });
            } else {
                setOrder(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order || order.status === newStatus) return;
        setUpdatingStatus(true);
        try {
            await updateDoc(doc(db, 'orders', order.id), {
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update order status.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading order details...</div>;
    }

    if (!order) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Order Not Found</h2>
                <button onClick={() => router.push('/admin/orders')} className="btn-secondary">Back to Orders</button>
            </div>
        );
    }

    const orderDate = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : (order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Date Unavailable');
    const totalItems = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <Link href="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        <ArrowLeft size={16} /> Back to Orders
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</h1>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={order.status || 'Processing'}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={updatingStatus}
                                style={{
                                    appearance: 'none',
                                    padding: '8px 32px 8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500,
                                    outline: 'none',
                                    cursor: updatingStatus ? 'wait' : 'pointer',
                                    background: order.status === 'Processing' ? 'rgba(250, 204, 21, 0.1)' : order.status === 'Shipped' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                    color: order.status === 'Processing' ? '#facc15' : order.status === 'Shipped' ? '#38bdf8' : '#4ade80',
                                    border: `1px solid ${order.status === 'Processing' ? 'rgba(250, 204, 21, 0.3)' : order.status === 'Shipped' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`
                                }}
                            >
                                <option value="Processing" style={{ background: '#111', color: '#fff' }}>Processing</option>
                                <option value="Shipped" style={{ background: '#111', color: '#fff' }}>Shipped</option>
                                <option value="Delivered" style={{ background: '#111', color: '#fff' }}>Delivered</option>
                                <option value="Cancelled" style={{ background: '#111', color: '#ef4444' }}>Cancelled</option>
                            </select>
                            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'inherit', opacity: 0.7 }} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Placed on {orderDate}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>

                {/* Left Column: Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="clean-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Package size={20} color="var(--text-tertiary)" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Items ordered ({totalItems})</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {order.items?.map((item: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: idx !== order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: idx !== order.items.length - 1 ? '1.5rem' : '0' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '6px', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No Image</div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.25rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {item.size ? `Size: ${item.size}` : 'Standard'}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>₹{parseFloat(item.price || 0).toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="clean-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <CreditCard size={20} color="var(--text-tertiary)" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Payment Summary</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Subtotal ({totalItems} items)</span>
                                <span>₹{parseFloat(order.subtotal || order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                            {order.couponApplied && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                                    <span>Discount ({order.couponApplied})</span>
                                    <span>- ₹{parseFloat(order.discountAmount || 0).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                <span>Tax</span>
                                <span>₹0</span>
                            </div>
                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem' }}>
                                <span>Total Paid</span>
                                <span>₹{parseFloat(order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="clean-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <User size={18} color="var(--text-tertiary)" />
                            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Customer Details</h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <p style={{ fontWeight: 500 }}>{order.customerName || 'No Name Provided'}</p>
                            <p style={{ color: 'var(--text-secondary)' }}>{order.customerEmail}</p>
                            <p style={{ color: 'var(--text-secondary)' }}>{order.phone}</p>
                        </div>
                    </div>

                    <div className="clean-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <MapPin size={18} color="var(--text-tertiary)" />
                            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Shipping Address</h2>
                        </div>
                        {order.shippingAddress ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                <p>{order.customerName}</p>
                                <p>{order.shippingAddress.addressLine1}</p>
                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No address provided.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
