import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data.wishlist);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [navigate]);

  const handleRemove = (productId) => {
    setWishlist(prev => prev.filter(p => p._id !== productId));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong.</h2>
        <p className="text-gray-600 mb-6">We couldn't load your wishlist.</p>
        <button 
          onClick={fetchWishlist}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="text-5xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6 max-w-md">Save products you love and find them here later.</p>
        <button 
          onClick={() => navigate('/products')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              initiallyInWishlist={true}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
