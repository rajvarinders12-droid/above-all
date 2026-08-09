'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send password reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', backgroundColor: '#000000', color: '#ffffff' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '400' }}>PASSWORD RESET</h1>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: '1.5' }}>
                    Enter the email address associated with your account, and we will send you a link to reset your password.
                </p>

                {error && (
                    <div style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: '#ff4444', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', borderLeft: '2px solid #ff4444' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ backgroundColor: 'rgba(0,255,0,0.1)', color: '#4ade80', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem', borderLeft: '2px solid #4ade80' }}>
                        If an account exists with {email}, a recovery email has been sent to it. Please check your inbox (and spam folder).
                    </div>
                )}

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

                    <button
                        type="submit"
                        disabled={loading || success}
                        style={{ background: 'white', color: 'black', padding: '1rem', border: 'none', marginTop: '1rem', cursor: (loading || success) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.3s', opacity: (loading || success) ? 0.7 : 1 }}
                    >
                        {loading ? 'Sending...' : 'Send Recovery Link'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        Remember your password? <Link href="/login" style={{ color: 'white', textDecoration: 'underline' }}>Sign in here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
