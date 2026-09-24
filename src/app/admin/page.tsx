'use client';

import { IndianRupee, PackageIcon, ShoppingBag, Users, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // 1. Fetch products count once
    getDocs(collection(db, 'products'))
      .then(snap => setProductCount(snap.size))
      .catch(() => setProductCount(0));

    // 2. Listen to orders live
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (ordersSnapshot) => {
      const orders: any[] = [];
      let revenue = 0;
      ordersSnapshot.forEach(doc => {
        const data = doc.data();
        orders.push({ id: doc.id, ...data });
        if (data.totalAmount) revenue += data.totalAmount;
      });
      setRecentOrders(orders.slice(0, 10)); // Top 10 for display
      setTotalRevenue(revenue);
    }, (error) => {
      console.error("Error in live orders dashboard:", error);
      // Fallback if index missing
      const fallbackUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const manualOrders: any[] = [];
        let rev = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          manualOrders.push({ id: doc.id, ...data });
          if (data.totalAmount) rev += data.totalAmount;
        });
        manualOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setRecentOrders(manualOrders.slice(0, 10));
        setTotalRevenue(rev);
      });
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      desc: 'Only completed & paid transactions'
    },
    {
      title: 'Orders',
      value: recentOrders.length.toString(),
      icon: ShoppingBag,
      desc: 'Total customer checkouts placed'
    },
    {
      title: 'Active Products',
      value: productCount === null ? '...' : productCount.toString(),
      icon: PackageIcon,
      desc: 'Total items listed in inventory'
    },
    {
      title: 'Customers',
      value: '0',
      icon: Users,
      desc: 'Total registered users'
    }
  ];

  const cardStyle = {
    backgroundColor: '#09090b',
    border: '1px solid rgba(39, 39, 42, 0.8)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ paddingBottom: '64px', color: '#f4f4f5', fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>Overview</h1>
            <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0 }}>Monitor your store metrics and track sales performance</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
              backgroundColor: '#fff', color: '#000', border: '1px solid #fff', borderRadius: '8px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer'
            }}>
              <Download size={14} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#a1a1aa' }}>{stat.title}</span>
                <Icon size={18} style={{ color: '#71717a' }} strokeWidth={2} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 400 }}>
                {stat.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div style={{ ...cardStyle, padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>Recent Orders</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid #27272a',
                color: '#a1a1aa',
                fontSize: '13px',
                fontWeight: 500
              }}>
                <th style={{ padding: '0 0 16px 0', fontWeight: 500, width: '35%' }}>Order ID</th>
                <th style={{ padding: '0 0 16px 0', fontWeight: 500, width: '25%' }}>Customer</th>
                <th style={{ padding: '0 0 16px 0', fontWeight: 500, width: '15%' }}>Status</th>
                <th style={{ padding: '0 0 16px 0', fontWeight: 500, width: '15%' }}>Date</th>
                <th style={{ padding: '0 0 16px 0', fontWeight: 500, width: '10%', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 0', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <ShoppingBag size={32} opacity={0.2} />
                      No recent orders available.
                    </div>
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 0', fontSize: '13px', color: '#fff' }}>#{order.id.slice(0, 8)}</td>
                    <td style={{ padding: '16px 0', fontSize: '13px', color: '#fff' }}>{order.customerName}</td>
                    <td style={{ padding: '16px 0' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{order.status}</span>
                    </td>
                    <td style={{ padding: '16px 0', fontSize: '13px', color: '#a1a1aa' }}>
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </td>
                    <td style={{ padding: '16px 0', fontSize: '13px', color: '#fff', textAlign: 'right', fontWeight: 500 }}>
                      ₹{order.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
