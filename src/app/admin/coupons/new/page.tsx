'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddCouponPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
    const [discountValue, setDiscountValue] = useState('');
    const [active, setActive] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discountValue) return alert("Please fill all required fields.");

        // Validation for percentage
        if (discountType === 'percentage' && (parseFloat(discountValue) <= 0 || parseFloat(discountValue) > 100)) {
            return alert("Percentage discount must be between 1 and 100.");
        }
        if (discountType === 'fixed' && parseFloat(discountValue) <= 0) {
            return alert("Fixed discount must be greater than 0.");
        }

        setLoading(true);
        setSuccess(false);

        try {
            await addDoc(collection(db, 'coupons'), {
                code: code.toUpperCase(),
                discountType,
                discountValue: parseFloat(discountValue),
                active,
                createdAt: new Date()
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/coupons');
            }, 1500);
        } catch (error) {
            console.error("Error adding coupon: ", error);
            alert("Failed to create coupon.");
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/coupons" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Back to Coupons
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Create Coupon</h1>
                    </div>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Coupon'}
                    </button>
                </div>
            </div>

            {success && (
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Check size={18} />
                    <span style={{ fontWeight: 500 }}>Coupon safely created. Redirecting...</span>
                </div>
            )}

            <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="clean-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Coupon Details</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="label-clean">Coupon Code *</label>
                            <input type="text" placeholder="e.g. SUMMER20" required value={code} onChange={e => setCode(e.target.value)} className="input-clean" style={{ textTransform: 'uppercase' }} />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>Customers will enter this discount code at checkout.</p>
                        </div>

                        <div className="admin-grid">
                            <div>
                                <label className="label-clean">Discount Type *</label>
                                <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="input-clean" style={{ cursor: 'pointer' }}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>

                            <div>
                                <label className="label-clean">Discount Value *</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" step={discountType === 'percentage' ? "1" : "0.01"} placeholder="0" required value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="input-clean" style={{ paddingLeft: discountType === 'fixed' ? '2.5rem' : '1rem' }} />
                                    {discountType === 'fixed' && (
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 500 }}>₹</span>
                                    )}
                                    {discountType === 'percentage' && (
                                        <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 500 }}>%</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
                            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="toggle-checkbox" />
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Active Status</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Uncheck this if you want to disable the coupon for now.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
