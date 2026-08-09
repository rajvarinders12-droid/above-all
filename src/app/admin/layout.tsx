import type { Metadata } from 'next';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { Search, Bell, Command, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Portal | Above All',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div style={{
        display: 'flex', height: '100vh', width: '100%',
        backgroundColor: '#000', color: '#fff',
        fontFamily: 'Inter, sans-serif', overflow: 'hidden'
      }}>
        <AdminSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{
            display: 'flex', height: '56px', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid #18181b', padding: '0 24px', flexShrink: 0, backgroundColor: '#000'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
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
          <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#000', padding: '32px' }}>
            <div style={{ margin: '0 auto', width: '100%', maxWidth: '1400px' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
