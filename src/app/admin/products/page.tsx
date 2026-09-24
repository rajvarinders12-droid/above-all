'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(fetched);
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Products</h1>
                <Link href="/admin/products/new" className="btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </div>

            <div className="clean-panel" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Image</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Name</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Category</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Price</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found. Add your first product.</td></tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition-fast)' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={(product.mainImageUrl || product.imageUrl) ? { width: '50px', height: '50px', backgroundImage: `url('${product.mainImageUrl || product.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '6px' } : { width: '50px', height: '50px', background: 'var(--border-color)', borderRadius: '6px' }} />
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>
                                        {product.name}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                                        {product.category || 'Uncategorized'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        ₹{(Number(product.discountedPrice) > 0 ? Number(product.discountedPrice) : Number(product.actualPrice || product.price || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Link href={`/admin/products/${product.id}/edit`} style={{ color: 'var(--text-secondary)' }}>
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this product?")) {
                                                        try {
                                                            await deleteDoc(doc(db, 'products', product.id));
                                                            setProducts(products.filter(p => p.id !== product.id));
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert("Failed to delete product.");
                                                        }
                                                    }
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
