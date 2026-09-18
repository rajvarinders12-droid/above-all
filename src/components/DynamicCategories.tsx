'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CategoryCard from './CategoryCard';

interface Category {
    id: string;
    name: string;
    mainImageUrl?: string;
    hoverImageUrl?: string;
}

export default function DynamicCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                // Ensure there is an index for orderBy('name') or fetch all and sort on client
                const q = query(collection(db, 'categories'));
                const querySnapshot = await getDocs(q);
                const fetched: Category[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetched.push({
                        id: doc.id,
                        name: data.name,
                        mainImageUrl: data.mainImageUrl,
                        hoverImageUrl: data.hoverImageUrl,
                    });
                });

                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(fetched);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
                Loading categories...
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.6)' }}>
                No categories available at the moment.
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    href={`/category/${cat.name.toLowerCase().replace(/\\s+/g, '-')}`}
                    imageUrl={cat.mainImageUrl || '/sample.jpg'} // Fallback if admin didn't provide
                    hoverImageUrl={cat.hoverImageUrl}
                    title={cat.name}
                />
            ))}
        </div>
    );
}
