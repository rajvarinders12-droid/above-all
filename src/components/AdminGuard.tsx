'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, loading, initialize } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!loading && mounted) {
            if (!user || !isAdmin) {
                router.push('/login');
            }
        }
    }, [user, isAdmin, loading, router, mounted]);

    if (!mounted || loading) {
        return (
            <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
                Loading...
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null;
    }

    return <>{children}</>;
}
