'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackagePlus, ShoppingBag, Tag, LogOut, Layers } from 'lucide-react';
import { useState } from 'react';
import { auth } from '@/lib/firebase';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [hovered, setHovered] = useState<string>('');

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: PackagePlus },
        { name: 'Categories', href: '/admin/categories', icon: Layers },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag }
    ];

    return (
        <aside style={{
            width: '260px', height: '100%', borderRight: '1px solid #18181b',
            backgroundColor: '#000', display: 'flex', flexDirection: 'column',
            fontFamily: 'Inter, sans-serif', flexShrink: 0
        }}>
            <div style={{
                height: '56px', display: 'flex', alignItems: 'center', padding: '0 24px',
                borderBottom: '1px solid #18181b', gap: '12px', color: '#fff',
                fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em'
            }}>
                <Image
                    src="/abova-logo.png"
                    alt="Above All Logo"
                    width={120}
                    height={36}
                    style={{ objectFit: 'contain' }}
                    priority
                />
            </div>

            <div style={{
                flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex',
                flexDirection: 'column', gap: '4px', fontSize: '14px', color: '#a1a1aa'
            }}>
                <div style={{
                    padding: '0 8px', marginBottom: '12px', fontSize: '11px', fontWeight: 600,
                    color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>Menu</div>

                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    const isHovered = hovered === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHovered(item.href)}
                            onMouseLeave={() => setHovered('')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 12px', borderRadius: '6px',
                                color: isActive ? '#fff' : (isHovered ? '#fff' : '#a1a1aa'),
                                background: isActive ? 'rgba(255,255,255,0.08)' : (isHovered ? 'rgba(255,255,255,0.04)' : 'transparent'),
                                fontWeight: isActive ? 500 : 400,
                                transition: 'all 0.2s ease', textDecoration: 'none'
                            }}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ opacity: isActive ? 1 : 0.8 }} />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #18181b', marginTop: 'auto' }}>
                <button
                    onClick={() => auth.signOut()}
                    onMouseEnter={() => setHovered('logout')}
                    onMouseLeave={() => setHovered('')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        color: hovered === 'logout' ? '#ef4444' : '#a1a1aa',
                        background: hovered === 'logout' ? 'rgba(239,68,68,0.1)' : 'transparent',
                        border: 'none', cursor: 'pointer', padding: '10px 12px',
                        width: '100%', textAlign: 'left', borderRadius: '6px',
                        fontSize: '14px', transition: 'all 0.2s ease'
                    }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
}
