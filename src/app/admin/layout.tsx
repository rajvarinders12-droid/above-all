import type { Metadata } from 'next';
import AdminGuard from '@/components/AdminGuard';
import AdminShell from '@/components/AdminShell';

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
      <AdminShell>
        {children}
      </AdminShell>
    </AdminGuard>
  );
}
