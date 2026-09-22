import DynamicCategories from '@/components/DynamicCategories';
import React from 'react';

export const metadata = {
    title: 'All Collections | Above All',
    description: 'Explore our curated collections of premium essentials.',
};

export default function CollectionsPage() {
    return (
        <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', padding: '120px 2rem 4rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '3rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: '#ffffff' }}>
                        Abova All Collections
                    </h1>
                </div>

                {/* Using DynamicCategories ensures it updates when the admin adds new collections */}
                <DynamicCategories />
            </div>
        </div>
    );
}
