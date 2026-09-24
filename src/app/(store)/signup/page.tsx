'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            return setError('Name is required');
        }

        if (/\d/.test(name)) {
            return setError('Name cannot contain numbers');
        }

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name.trim()
            });
            if (['admin@above-all.com', 'admin2@above-all.com'].includes(email)) {
                router.push('/admin');
            } else {
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create an account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', backgroundColor: '#000000', color: '#ffffff' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', fontWeight: '400' }}>CREATE ACCOUNT</h1>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', borderLeft: '2px solid #ff4444' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.7 }}>FULL NAME</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)', padding: '0.75rem 0', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                            onFocus={(e) => e.target.style.borderBottom = '1px solid white'}
                            onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.2)'}
                        />
                    </div>

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
                        <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.7 }}>PASSWORD</label>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', opacity: 0.7 }}>CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        Already have an account? <Link href="/login" style={{ color: 'white', textDecoration: 'underline' }}>Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
