import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, wishRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/wishlist')
        ]);
        
        if (prodRes.status === 'fulfilled') {
          setProducts(prodRes.value.data.products);
        }
        
        if (wishRes.status === 'fulfilled') {
          const ids = wishRes.value.data.wishlist.map(item => item._id);
          setWishlistIds(new Set(ids));
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard 
              key={p._id} 
              product={p} 
              initiallyInWishlist={wishlistIds.has(p._id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
