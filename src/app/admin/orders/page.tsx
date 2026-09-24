'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingBag, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            setOrders(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching live orders:", error);
            // Fallback for missing index: just listen to the whole collection and sort in memory
            const fallbackUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
                const manualFetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                manualFetched.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return b.createdAt.seconds - a.createdAt.seconds;
                    }
                    return 0;
                });
                setOrders(manualFetched);
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Orders</h1>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="clean-panel" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <ShoppingBag size={48} color="var(--text-tertiary)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>No orders yet</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>Your store is ready! When a customer places an order, it will appear right here.</p>
                </div>
            ) : (
                <div className="clean-panel">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '20%' }}>Order ID</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '20%' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '20%' }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '15%' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, textAlign: 'right', width: '20%' }}>Amount</th>
                                <th style={{ padding: '1rem 1.5rem', width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <Fragment key={order.id}>
                                    <tr
                                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)', cursor: 'pointer', backgroundColor: expandedOrder === order.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileText size={16} color="var(--text-tertiary)" />
                                                {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                                            {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            {order.customerName || order.email || 'Guest User'}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                background: order.status === 'Processing' ? 'rgba(250, 204, 21, 0.1)' : order.status === 'Shipped' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                                color: order.status === 'Processing' ? '#facc15' : order.status === 'Shipped' ? '#38bdf8' : '#4ade80',
                                                border: `1px solid ${order.status === 'Processing' ? 'rgba(250, 204, 21, 0.2)' : order.status === 'Shipped' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(74, 222, 128, 0.2)'}`
                                            }}>
                                                {order.status || 'New'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>
                                            ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </td>
                                    </tr>
                                    {expandedOrder === order.id && (
                                        <tr style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-color)' }}>
                                            <td colSpan={6} style={{ padding: '2rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                                    {/* Customer Details */}
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Customer Details</h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            <p><strong style={{ color: 'white' }}>Name:</strong> {order.customerName}</p>
                                                            <p><strong style={{ color: 'white' }}>Email:</strong> {order.customerEmail}</p>
                                                            <p><strong style={{ color: 'white' }}>Phone:</strong> {order.phone}</p>
                                                            {order.shippingAddress && (
                                                                <div style={{ marginTop: '0.5rem' }}>
                                                                    <strong style={{ color: 'white' }}>Shipping Address:</strong>
                                                                    <p style={{ marginTop: '0.25rem' }}>{order.shippingAddress.addressLine1}</p>
                                                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Order Items</h3>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                                                            {order.items?.map((item: any, idx: number) => (
                                                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#222' }}>
                                                                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                                    </div>
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} {item.size ? `| Size: ${item.size}` : ''}</div>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                                        ₹{parseFloat(item.price || 0).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
