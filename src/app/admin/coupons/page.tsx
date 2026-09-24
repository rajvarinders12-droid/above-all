'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Plus, Tag } from 'lucide-react';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCoupons() {
            try {
                const querySnapshot = await getDocs(collection(db, 'coupons'));
                const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCoupons(fetched);
            } catch (error) {
                console.error("Error fetching coupons", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCoupons();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Coupons</h1>
                {coupons.length > 0 && (
                    <Link href="/admin/coupons/new" className="btn-primary">
                        <Plus size={18} /> Create Coupon
                    </Link>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div className="clean-panel" style={{ textAlign: 'center', padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Tag size={48} color="var(--text-tertiary)" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Can't find any coupon</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>You haven't created any discount codes or promotions yet.</p>
                    <Link href="/admin/coupons/new" className="btn-primary" style={{ marginTop: '1rem' }}>
                        <Plus size={18} /> Create Coupon
                    </Link>
                </div>
            ) : (
                <div className="clean-panel" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Code</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Discount</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{coupon.code}</td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {coupon.discountType === 'fixed' ? `₹${parseFloat(coupon.discountValue || 0).toLocaleString('en-IN')}` : `${coupon.discountValue}%`} OFF
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: coupon.active ? '#4ade80' : 'var(--text-secondary)' }}>{coupon.active ? 'Active' : 'Expired'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
