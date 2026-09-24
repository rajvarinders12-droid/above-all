'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithRedirect, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getRedirectResult(auth).catch(console.error);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (['admin@above-all.com', 'admin2@above-all.com', 'admin@theabova.com'].includes(user.email || '')) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (['admin@above-all.com', 'admin2@above-all.com', 'admin@theabova.com'].includes(email)) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithRedirect(auth, googleProvider);
        } catch (err: any) {
            setError(err.message || 'Failed to login with Google');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', backgroundColor: '#000000', color: '#ffffff' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', fontWeight: '400' }}>LOGIN</h1>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', borderLeft: '2px solid #ff4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.7 }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 0', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                            onFocus={(e) => e.target.style.borderBottom = '1px solid white'}
                            onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.2)'}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.7 }}>PASSWORD</label>
                            <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.05em' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 0', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                            onFocus={(e) => e.target.style.borderBottom = '1px solid white'}
                            onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.2)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background: 'white', color: 'black', padding: '1rem', border: 'none', marginTop: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.3s', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Processing...' : 'Sign In'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                        <span style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        style={{
                            background: 'transparent', color: 'white', padding: '0.9rem', border: '1px solid rgba(255,255,255,0.4)',
                            cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.85rem', letterSpacing: '0.05em',
                            transition: 'all 0.3s', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                            <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8766 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7253 38.5056 24.48 38.5056C18.2045 38.5056 12.8719 34.2798 10.9806 28.5995H3.03296V34.7825C7.10718 42.8861 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                            <path d="M10.979 28.5995C10.5195 27.2042 10.2526 25.7533 10.2526 24.2882C10.2526 22.8232 10.5195 21.3722 10.979 19.9769V13.7939H3.0313C1.35338 17.1352 0.428467 20.6791 0.428467 24.2882C0.428467 27.8973 1.35338 31.4412 3.0313 34.7825L10.979 28.5995Z" fill="#FBBC05" />
                            <path d="M24.48 10.0716C27.9946 10.0716 31.1396 11.2796 33.626 13.6266L40.5694 6.72629C36.3986 2.8465 30.9388 0.574646 24.48 0.574646C15.4056 0.574646 7.10718 5.69018 3.03296 13.7939L10.9806 19.9769C12.8719 14.2966 18.2045 10.0716 24.48 10.0716Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        Don't have an account? <Link href="/signup" style={{ color: 'white', textDecoration: 'underline' }}>Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
