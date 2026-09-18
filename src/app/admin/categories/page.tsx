'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, UploadCloud } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    mainImageUrl?: string;
    hoverImageUrl?: string;
    createdAt: any;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [hoverImage, setHoverImage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
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

    const handleImageUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            return data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            alert("Failed to upload image. Please check credentials.");
            return null;
        }
    };

    const uploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploadingImage(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) setMainImage(url);
        setUploadingImage(false);
    };

    const uploadHoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploadingImage(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) setHoverImage(url);
        setUploadingImage(false);
    };

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
                mainImageUrl: mainImage,
                hoverImageUrl: hoverImage,
                createdAt: new Date()
            });
            setNewCatName('');
            setMainImage('');
            setHoverImage('');
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
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500 }}>Add New Category</h2>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>

                    <div>
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

                    <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="label-clean">Main Photo</label>
                            <label className="upload-zone" style={{ height: '200px', ...(mainImage ? { backgroundImage: `url('${mainImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}) }}>
                                {!mainImage && (
                                    <>
                                        <UploadCloud size={32} color="var(--text-secondary)" style={{ marginBottom: ('1rem') }} />
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{uploadingImage ? 'Uploading...' : 'Upload Main Photo'}</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={uploadMainImage} style={{ display: 'none' }} disabled={uploadingImage} />
                                {mainImage && <div className="upload-overlay">Replace Photo</div>}
                            </label>
                        </div>

                        <div>
                            <label className="label-clean">Secondary/Hover Photo</label>
                            <label className="upload-zone" style={{ height: '200px', ...(hoverImage ? { backgroundImage: `url('${hoverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}) }}>
                                {!hoverImage && (
                                    <>
                                        <UploadCloud size={32} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>{uploadingImage ? 'Uploading...' : 'Upload Hover Photo'}</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={uploadHoverImage} style={{ display: 'none' }} disabled={uploadingImage} />
                                {hoverImage && <div className="upload-overlay">Replace Photo</div>}
                            </label>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={adding || uploadingImage || !newCatName.trim()} className="btn-primary" style={{ height: '48px', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            {adding ? 'Adding...' : <><Plus size={18} /> Add Category</>}
                        </button>
                    </div>
                </form>
            </div>

            <div className="clean-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontWeight: 500 }}>All Categories</h2>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                ) : categories.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No categories found. Create one above!</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {categories.map((cat, i) => (
                            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{(i + 1).toString().padStart(2, '0')}</div>
                                    {cat.mainImageUrl ? (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: `url('${cat.mainImageUrl}') center/cover` }} />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--border-color)' }} />
                                    )}
                                    <div style={{ fontWeight: 500, fontSize: '1.05rem' }}>{cat.name}</div>
                                </div>
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
