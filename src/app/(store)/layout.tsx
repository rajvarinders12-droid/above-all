import Navbar from '@/components/Navbar';
import React from 'react';

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />

            <main>
                {children}
            </main>

            <footer style={{
                padding: '8rem 2rem 4rem',
                background: '#040404',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                    <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em', opacity: 0.7 }}>SUBSCRIBE TO NEWSLETTER</span>
                    <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '0.5rem' }}>
                        <input type="email" placeholder="Email Address" style={{ background: 'none', border: 'none', width: '100%', color: 'white', outline: 'none' }} />
                        <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer', letterSpacing: '0.1em' }}>JOIN</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '3rem', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginTop: '3rem' }}>
                    <a href="#">SHOP</a>
                    <a href="#">SOCIAL</a>
                    <a href="#">TERMS</a>
                    <a href="#">PRIVACY</a>
                </div>
            </footer>
        </>
    );
}
