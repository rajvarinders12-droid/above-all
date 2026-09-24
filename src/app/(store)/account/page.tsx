'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import Link from 'next/link';
import { LogOut, Package, User } from 'lucide-react';

export default function AccountPage() {
    const { user, loading, initialize } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!loading && mounted) {
            if (!user) {
                router.push('/login');
            } else {
                // Fetch orders for user
                const fetchOrders = async () => {
                    try {
                        const q = query(collection(db, 'orders'), where('customerEmail', '==', user.email));
                        const querySnapshot = await getDocs(q);
                        const fetchedOrders: any[] = [];
                        querySnapshot.forEach((doc) => {
                            fetchedOrders.push({ id: doc.id, ...doc.data() });
                        });
                        // Soft sort client side since we don't have a composed index
                        fetchedOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                        setOrders(fetchedOrders);
                    } catch (error) {
                        console.error('Error fetching orders:', error);
                    } finally {
                        setLoadingOrders(false);
                    }
                };
                fetchOrders();
            }
        }
    }, [user, loading, router, mounted]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/');
    };

    if (!mounted || loading || !user) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
                <span style={{ letterSpacing: '0.2em', fontSize: '0.8rem', textTransform: 'uppercase' }}>Loading Profile...</span>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px', backgroundColor: '#000000', color: '#ffffff', fontFamily: 'var(--font-serif)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2rem', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>MY ACCOUNT</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Welcome back, {user.displayName || user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                            padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', transition: 'all 0.3s ease',
                            borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    >
                        <LogOut size={14} />
                        SIGN OUT
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>

                    {/* User Details Sidebar */}
                    <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1rem', letterSpacing: '0.1em', fontWeight: 400, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={16} /> PROFILE DETAILS
                            </h3>
                            <div style={{ backgroundColor: '#09090b', padding: '1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>FULL NAME</p>
                                    <p style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>{user.displayName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>EMAIL ADDRESS</p>
                                    <p style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order History Area */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h3 style={{ fontSize: '1rem', letterSpacing: '0.1em', fontWeight: 400, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={16} /> ORDER HISTORY
                        </h3>

                        {loadingOrders ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading orders...</div>
                        ) : orders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{ backgroundColor: '#09090b', padding: '1.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em', wordBreak: 'break-all' }}>ORDER #{String(order.orderId || order.id).slice(0, 12).toUpperCase()}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                                                    {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>₹{parseFloat(order.totalAmount || 0).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '50px', height: '65px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                                                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.9rem' }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: '#09090b', padding: '4rem 2rem', borderRadius: '4px',
                                border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center',
                                display: 'flex', flexDirection: 'column', alignItems: 'center'
                            }}>
                                <Package size={40} style={{ opacity: 0.2, marginBottom: '1.5rem' }} strokeWidth={1} />
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 400, letterSpacing: '0.05em', marginBottom: '1rem' }}>
                                    Your ABOVA collection is currently empty
                                </h4>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2.5rem', maxWidth: '400px', lineHeight: 1.5 }}>
                                    You haven't placed any orders yet. It's time to elevate your wardrobe and experience true luxury.
                                </p>
                                <Link href="/" style={{ textDecoration: 'none' }}>
                                    <button style={{
                                        background: '#fff', color: '#000', border: 'none',
                                        padding: '1rem 2.5rem', fontSize: '0.8rem', letterSpacing: '0.15em',
                                        textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s ease',
                                        fontWeight: 500
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        DISCOVER THE COLLECTION
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
