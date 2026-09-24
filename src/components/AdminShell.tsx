'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Search, Bell, Command, User, Menu } from 'lucide-react';

export default function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div style={{
            display: 'flex', height: '100vh', width: '100%',
            backgroundColor: '#000', color: '#fff',
            fontFamily: 'Inter, sans-serif', overflow: 'hidden'
        }}>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}

            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
                <header style={{
                    display: 'flex', height: '56px', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #18181b', padding: '0 24px', flexShrink: 0, backgroundColor: '#000'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Mobile Hamburger */}
                        <div
                            className="mobile-only"
                            onClick={() => setSidebarOpen(true)}
                            style={{ cursor: 'pointer', padding: '4px', display: 'flex' }}
                        >
                            <Menu size={20} />
                        </div>

                        <div className="desktop-only" style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
                            backgroundColor: 'rgba(24, 24, 27, 0.5)', borderRadius: '6px', border: '1px solid #27272a',
                            color: '#a1a1aa', width: '256px', transition: 'border-color 0.2s'
                        }}>
                            <Search size={16} />
                            <input type="text" placeholder="Search..." style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#fff' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#71717a', backgroundColor: '#27272a', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                                <Command size={10} />K
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#a1a1aa' }}>
                        <Bell size={18} style={{ cursor: 'pointer' }} />
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#27272a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid #3f3f46', marginLeft: '8px', cursor: 'pointer', color: '#fff'
                        }}>
                            <User size={14} />
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#000', padding: '24px 16px', WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ margin: '0 auto', width: '100%', maxWidth: '1400px' }}>
                        {children}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .desktop-only { display: flex !important; }
                    .mobile-only { display: none !important; }
                }
                `
            }} />
        </div>
    );
}
