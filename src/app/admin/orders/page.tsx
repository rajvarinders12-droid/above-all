'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ShoppingBag, FileText } from 'lucide-react';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '25%' }}>Date</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '25%' }}>Customer</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, width: '15%' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, textAlign: 'right', width: '15%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
