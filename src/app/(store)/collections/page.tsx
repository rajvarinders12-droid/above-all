import DynamicCategories from '@/components/DynamicCategories';
import React from 'react';

export const metadata = {
    title: 'All Collections | Above All',
    description: 'Explore our curated collections of premium essentials.',
};

export default function CollectionsPage() {
    return (
        <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', padding: '100px 2rem 4rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                        Explore
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 400, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
                        Abova All Collections
                    </h1>
                    <p style={{ maxWidth: '400px', margin: '1rem auto 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        Browse our complete range of premium categories, crafted with dedication and designed for longevity.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                        Curated Categories
                    </h2>
                </div>

                {/* Using DynamicCategories ensures it updates when the admin adds new collections */}
                <DynamicCategories />
            </div>
        </div>
    );
}
