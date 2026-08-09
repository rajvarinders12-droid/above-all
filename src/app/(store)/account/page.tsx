'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { LogOut, Package, User } from 'lucide-react';

export default function AccountPage() {
    const { user, loading, initialize } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [orders, setOrders] = useState([]); // Assuming no orders for now to trigger the empty state

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!loading && mounted && !user) {
            router.push('/login');
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

                        {orders.length > 0 ? (
                            <div>
                                {/* Render orders here when backend is connected */}
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
