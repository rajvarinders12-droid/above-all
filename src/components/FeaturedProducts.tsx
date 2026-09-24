import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductCardItem from './ProductCardItem';

export default async function FeaturedProducts() {
  let products: any[] = [];

  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(6));
    const querySnapshot = await getDocs(q);
    const fetchedProducts: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      let originalPrice = Number(data.actualPrice || data.price || 0);
      let sellingPrice = Number(data.discountedPrice) > 0 ? Number(data.discountedPrice) : originalPrice;

      // Auto-correct if user entered the prices backwards in the admin portal
      if (sellingPrice > originalPrice && originalPrice > 0) {
        const temp = sellingPrice;
        sellingPrice = originalPrice;
        originalPrice = temp;
      }

      fetchedProducts.push({
        id: doc.id,
        name: data.name || 'Unnamed Product',
        price: originalPrice,
        imageUrl: data.mainImageUrl || data.imageUrl || '',
        mainImageUrl: data.mainImageUrl || data.imageUrl || '',
        variants: data.variants || [],
        actualPrice: originalPrice,
        discountedPrice: sellingPrice !== originalPrice ? sellingPrice : 0,
        inStock: data.inStock || 0
      });
    });

    products = fetchedProducts;
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
