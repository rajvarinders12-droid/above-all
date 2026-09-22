import DynamicCategories from '@/components/DynamicCategories';
import React from 'react';

export const metadata = {
    title: 'All Collections | Above All',
    description: 'Explore our curated collections of premium essentials.',
};

export default function CollectionsPage() {
    return (
        <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', padding: '140px 2rem 8rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                    <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        Explore
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 400, margin: 0, textTransform: 'uppercase', lineHeight: 1.1 }}>
                        Abova All Collections
                    </h1>
                    <p style={{ maxWidth: '500px', margin: '2rem auto 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        Browse our complete range of premium categories, crafted with dedication and designed for longevity.
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '4rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                        Curated Categories
                    </h2>
                </div>

                {/* Using DynamicCategories ensures it updates when the admin adds new collections */}
                <DynamicCategories />
            </div>
        </div>
    );
}
