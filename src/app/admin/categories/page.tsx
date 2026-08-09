'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2 } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    createdAt: any;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const snap = await getDocs(collection(db, 'categories'));
            const cats: Category[] = [];
            snap.forEach(doc => {
                cats.push({ id: doc.id, ...doc.data() } as Category);
            });
            // Sort alphabetically
            cats.sort((a, b) => a.name.localeCompare(b.name));
            setCategories(cats);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCatName.trim()) return;

        // Check if category already exists locally to prevent duplicates
        if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
            alert('This category already exists.');
            return;
        }

        setAdding(true);
        try {
            await addDoc(collection(db, 'categories'), {
                name: newCatName.trim(),
                createdAt: new Date()
            });
            setNewCatName('');
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Failed to add category');
        } finally {
            setAdding(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await deleteDoc(doc(db, 'categories', id));
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('Failed to delete category');
        }
    }

    return (
        <div className="animate-fade-in" style={{ padding: '1rem 0' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 600 }}>Categories</h1>

            <div className="clean-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 500 }}>Add New Category</h2>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '500px' }}>
                    <div style={{ flex: 1 }}>
                        <label className="label-clean">Category Name *</label>
                        <input
                            type="text"
                            required
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            className="input-clean"
                            placeholder="e.g. T-Shirts"
                        />
                    </div>
                    <button type="submit" disabled={adding} className="btn-primary" style={{ height: '42px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {adding ? 'Adding...' : <><Plus size={18} /> Add</>}
                    </button>
                </form>
            </div>

            <div className="clean-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 500 }}>All Categories</h2>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                ) : categories.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No categories found. Create one above!</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {categories.map(cat => (
                            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 500 }}>{cat.name}</div>
                                <button onClick={() => handleDelete(cat.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.5rem' }} title="Delete category">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
