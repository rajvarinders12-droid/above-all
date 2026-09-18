'use client';

import React, { useState, useEffect, use } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UploadCloud, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ColorVariant {
    id: string;
    colorName: string;
    imageUrl: string;
    sizes: string[];
}

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const productId = params.id;

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Basic Info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [featured, setFeatured] = useState(false);
    const [category, setCategory] = useState('');
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    // Pricing
    const [actualPrice, setActualPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);

    // Inventory
    const [inStock, setInStock] = useState('10');

    // Images
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [sizeChartUrl, setSizeChartUrl] = useState('');

    // Variants
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const [variants, setVariants] = useState<ColorVariant[]>([]);

    // Load product data
    useEffect(() => {
        async function loadProduct() {
            try {
                const productSnap = await getDoc(doc(db, 'products', productId));
                if (productSnap.exists()) {
                    const data = productSnap.data();
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setCategory(data.category || '');
                    setFeatured(!!data.featured);
                    setActualPrice(data.actualPrice?.toString() || data.price?.toString() || '');
                    setDiscountedPrice(data.discountedPrice?.toString() || data.actualPrice?.toString() || data.price?.toString() || '');
                    setInStock(data.inStock?.toString() || '0');
                    setMainImageUrl(data.mainImageUrl || data.imageUrl || '');
                    setGalleryImages(data.galleryImages || []);
                    setSizeChartUrl(data.sizeChartUrl || '');
                    setVariants(data.variants || []);
                } else {
                    alert('Product not found!');
                    router.push('/admin/products');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        }
        loadProduct();
    }, [productId, router]);

    // Fetch existing categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const querySnapshot = await getDocs(collection(db, 'products'));
                const cats = new Set<string>();
                querySnapshot.forEach((doc: any) => {
                    if (doc.data().category) cats.add(doc.data().category);
                });
                setExistingCategories(Array.from(cats));
            } catch (err) {
                console.error(err);
            }
        }
        fetchCategories();
    }, []);

    // Calculate Discount
    useEffect(() => {
        if (actualPrice && discountedPrice) {
            const actual = parseFloat(actualPrice);
            const discounted = parseFloat(discountedPrice);
            if (actual > 0 && discounted > 0 && actual > discounted) {
                const percent = Math.round(((actual - discounted) / actual) * 100);
                setDiscountPercent(percent);
            } else {
                setDiscountPercent(0);
            }
        } else {
            setDiscountPercent(0);
        }
    }, [actualPrice, discountedPrice]);

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
            alert("Failed to upload image.");
            return null;
        }
    };

    const uploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) setMainImageUrl(url);
        setLoading(false);
    };

    const uploadSizeChart = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) setSizeChartUrl(url);
        setLoading(false);
    };

    const uploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) setGalleryImages(prev => [...prev, url]);
        setLoading(false);
    };

    const removeGalleryImage = (indexToRemove: number) => {
        setGalleryImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const uploadVariantImage = async (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setLoading(true);
        const url = await handleImageUpload(e.target.files[0]);
        if (url) {
            setVariants(variants.map(v => v.id === variantId ? { ...v, imageUrl: url } : v));
        }
        setLoading(false);
    };

    const addVariant = () => {
        setVariants([...variants, { id: Date.now().toString(), colorName: '', imageUrl: '', sizes: [] }]);
    };

    const removeVariant = (id: string) => {
        setVariants(variants.filter(v => v.id !== id));
    };

    const toggleVariantSize = (variantId: string, size: string) => {
        setVariants(variants.map(v => {
            if (v.id === variantId) {
                const hasSize = v.sizes.includes(size);
                return { ...v, sizes: hasSize ? v.sizes.filter(s => s !== size) : [...v.sizes, size] };
            }
            return v;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description || !category || !actualPrice || !inStock) {
            return alert("Please fill in all required fields (Name, Category, Description, Price, and Inventory).");
        }
        if (!mainImageUrl) return alert("Please upload a main product image.");
        setLoading(true);
        setSuccess(false);

        try {
            await updateDoc(doc(db, 'products', productId), {
                name,
                description,
                category,
                featured,
                actualPrice: parseFloat(actualPrice),
                discountedPrice: parseFloat(discountedPrice) || parseFloat(actualPrice),
                discountPercent,
                inStock: parseInt(inStock),
                mainImageUrl,
                galleryImages,
                sizeChartUrl,
                variants,
                updatedAt: new Date()
            });

            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            console.error("Error updating product: ", error);
            alert("Failed to update product. Error: " + (error?.message || JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product...</div>;
    }

    return (
        <div style={{ paddingBottom: '4rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Edit Product</h1>
                    </div>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {success && (
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.2)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Check size={18} />
                    <span style={{ fontWeight: 500 }}>Product safely updated.</span>
                </div>
            )}

            <form style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* SECTION: Basic Info */}
                <div className="clean-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>General Information</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="label-clean">Product Name *</label>
                            <input type="text" placeholder="e.g. Classic White T-Shirt" required value={name} onChange={e => setName(e.target.value)} className="input-clean" />
                        </div>
                        <div>
                            <label className="label-clean">Category (Add to Category)</label>
                            <input
                                type="text"
                                list="category-suggestions"
                                placeholder="Select existing or type a new category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="input-clean"
                            />
                            <datalist id="category-suggestions">
                                {existingCategories.map((cat, i) => (
                                    <option key={i} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="label-clean">Description *</label>
                            <textarea placeholder="Describe the product..." required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="input-clean" style={{ resize: 'vertical' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem' }}>
                            <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="toggle-checkbox" />
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>Feature on Home Page</div>
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Highlight this product in the featured section.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION: Media */}
                <div className="clean-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Media</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Tip: Use .WEBP format for faster loading</span>
                    </div>

                    <div className="admin-grid">
                        {/* Main Image */}
                        <div>
                            <label className="label-clean">Main Image *</label>
                            <label className="upload-zone" style={mainImageUrl ? { backgroundImage: `url('${mainImageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}>
                                {!mainImageUrl && (
                                    <>
                                        <UploadCloud size={32} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Upload Image</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={uploadMainImage} style={{ display: 'none' }} />
                                {mainImageUrl && <div className="upload-overlay">Replace Image</div>}
                            </label>
                        </div>

                        {/* Size Chart */}
                        <div>
                            <label className="label-clean">Size Guide (Optional)</label>
                            <label className="upload-zone" style={sizeChartUrl ? { backgroundImage: `url('${sizeChartUrl}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}>
                                {!sizeChartUrl && (
                                    <>
                                        <UploadCloud size={32} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Upload Size Chart</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={uploadSizeChart} style={{ display: 'none' }} />
                                {sizeChartUrl && <div className="upload-overlay">Replace Size Chart</div>}
                            </label>
                        </div>

                        {/* Gallery Images */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <label className="label-clean">Additional Gallery Images</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {galleryImages.map((img, index) => (
                                    <div key={index} style={{ width: '100px', height: '100px', borderRadius: '6px', background: `url('${img}') center/cover no-repeat`, position: 'relative' }}>
                                        <button type="button" onClick={() => removeGalleryImage(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--text-primary)', color: 'var(--bg-color)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: '2px solid var(--bg-color)' }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}

                                <label className="upload-zone" style={{ width: '100px', height: '100px', minHeight: '100px', padding: 0 }}>
                                    <Plus size={24} color="var(--text-tertiary)" />
                                    <input type="file" accept="image/*" onChange={uploadGalleryImage} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION: Pricing & Inventory */}
                <div className="clean-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem' }}>Pricing & Inventory</h2>

                    <div className="admin-grid">
                        <div>
                            <label className="label-clean">Price (₹) *</label>
                            <input type="number" step="0.01" required value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="input-clean" placeholder="0.00" />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label className="label-clean">Compare at Price (₹)</label>
                            <input type="number" step="0.01" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} className="input-clean" placeholder="Optional discount" />
                            {discountPercent > 0 && (
                                <div style={{ position: 'absolute', right: '12px', top: '38px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>
                                    {discountPercent}% OFF
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label-clean">Inventory (Units) *</label>
                            <input type="number" required value={inStock} onChange={e => setInStock(e.target.value)} className="input-clean" />
                        </div>
                    </div>
                </div>

                {/* SECTION: Variants */}
                <div className="clean-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Variants</h2>
                        <button type="button" onClick={addVariant} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            <Plus size={16} /> Add Variant
                        </button>
                    </div>

                    {variants.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)', background: 'var(--bg-color)', borderRadius: '6px' }}>
                            No variants added. Product will be sold as a single item.
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {variants.map((variant, index) => (
                            <div key={variant.id} style={{ padding: '1.5rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                                {/* Variant Image */}
                                <div style={{ flexShrink: 0 }}>
                                    <label className="label-clean">Image</label>
                                    <label className="upload-zone" style={variant.imageUrl ? { width: '120px', height: '120px', borderRadius: '6px', backgroundImage: `url('${variant.imageUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { width: '120px', height: '120px', borderRadius: '6px' }}>
                                        {!variant.imageUrl && <UploadCloud size={24} color="var(--text-tertiary)" />}
                                        <input type="file" accept="image/*" onChange={(e) => uploadVariantImage(variant.id, e)} style={{ display: 'none' }} />
                                        {variant.imageUrl && <div className="upload-overlay" style={{ fontSize: '0.7rem' }}>Replace</div>}
                                    </label>
                                </div>

                                {/* Variant Details */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '250px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ width: '100%', maxWidth: '300px' }}>
                                            <label className="label-clean">Color / Option Name</label>
                                            <input type="text" placeholder="e.g. Black" value={variant.colorName} onChange={e => setVariants(variants.map(v => v.id === variant.id ? { ...v, colorName: e.target.value } : v))} className="input-clean" />
                                        </div>
                                        <button type="button" onClick={() => removeVariant(variant.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0.5rem', marginTop: '1.2rem' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="label-clean">Available Sizes</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size} type="button" onClick={() => toggleVariantSize(variant.id, size)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid', fontWeight: 500, transition: 'var(--transition-fast)',
                                                        background: variant.sizes.includes(size) ? 'var(--text-primary)' : 'transparent',
                                                        color: variant.sizes.includes(size) ? 'var(--bg-color)' : 'var(--text-secondary)',
                                                        borderColor: variant.sizes.includes(size) ? 'var(--text-primary)' : 'var(--border-color)'
                                                    }}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    );
}
