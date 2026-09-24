import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductCardItem from './ProductCardItem';

export default async function FeaturedProducts() {
  let products: any[] = [];

  try {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const fetchedProducts: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.featured === true) {
        fetchedProducts.push({
          id: doc.id,
          name: data.name || 'Unnamed Product',
          price: data.actualPrice || data.price || 0,
          imageUrl: data.mainImageUrl || data.imageUrl || '',
          mainImageUrl: data.mainImageUrl || data.imageUrl || '',
          variants: data.variants || [],
          actualPrice: data.actualPrice || 0,
          discountedPrice: data.discountedPrice || 0,
          inStock: data.inStock || 0
        });
      }
    });

    products = fetchedProducts.slice(0, 6);
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
      {products.map((product) => (
        <ProductCardItem key={product.id} product={product} />
      ))}
    </div>
  );
}
