'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (email === 'admin@above-all.com') {
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

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        Don't have an account? <Link href="/signup" style={{ color: 'white', textDecoration: 'underline' }}>Sign up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
