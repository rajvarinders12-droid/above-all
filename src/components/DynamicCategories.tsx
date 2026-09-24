import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CategoryCard from './CategoryCard';

export default async function DynamicCategories() {
    let categories: any[] = [];

    try {
        const q = query(collection(db, 'categories'));
        const querySnapshot = await getDocs(q);
        const fetched: any[] = [];

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
        categories = fetched;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }

    if (categories.length === 0) {
        return null; // Do not show anything if no categories are present
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    href={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    imageUrl={cat.mainImageUrl || '/sample.jpg'} // Fallback if admin didn't provide
                    hoverImageUrl={cat.hoverImageUrl}
                    title={cat.name}
                />
            ))}
        </div>
    );
}
