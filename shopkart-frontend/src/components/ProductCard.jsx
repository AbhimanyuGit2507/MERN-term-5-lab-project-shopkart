import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProductCard({ product, initiallyInWishlist = false, onRemove }) {
  const navigate = useNavigate();
  const [wishlistStatus, setWishlistStatus] = useState(initiallyInWishlist ? 'added' : 'default'); // 'default', 'loading', 'added', 'error'

  const handleWishlistClick = async () => {
    if (wishlistStatus === 'loading' || wishlistStatus === 'added') return;

    setWishlistStatus('loading');
    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistStatus('added');
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistStatus('added');
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setWishlistStatus('error');
        setTimeout(() => setWishlistStatus('default'), 3000);
      }
    }
  };

  const handleRemoveClick = async () => {
    setWishlistStatus('loading');
    try {
      await api.delete(`/wishlist/${product._id}`);
      setWishlistStatus('default');
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setWishlistStatus('error');
        setTimeout(() => setWishlistStatus('added'), 3000);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
          <span className="text-lg font-extrabold text-indigo-600">₹{product.price}</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">{product.category} • {product.stock} units left</p>
        
        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={() => navigate(`/products/${product._id}`)}
            className="w-full bg-gray-100 text-gray-800 font-medium py-2 rounded-lg hover:bg-gray-200 transition"
          >
            View Details
          </button>
          
          {initiallyInWishlist || onRemove ? (
            <button 
              onClick={handleRemoveClick}
              disabled={wishlistStatus === 'loading'}
              className="w-full border border-red-200 text-red-600 font-medium py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              {wishlistStatus === 'loading' ? 'Removing...' : 'Remove from Wishlist'}
            </button>
          ) : (
            <button 
              onClick={handleWishlistClick}
              disabled={wishlistStatus === 'loading' || wishlistStatus === 'added'}
              className={`w-full font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 
                ${wishlistStatus === 'added' ? 'bg-pink-50 text-pink-600 border border-pink-200' : 
                  wishlistStatus === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {wishlistStatus === 'loading' ? (
                '⏳ Saving...'
              ) : wishlistStatus === 'added' ? (
                <>♥ Added to Wishlist</>
              ) : wishlistStatus === 'error' ? (
                'Unable to save. Try again.'
              ) : (
                <>♡ Add to Wishlist</>
              )}
            </button>
          )}

          <button 
            onClick={async () => {
              try { await api.post(`/cart/${product._id}`); alert('Added to cart!'); }
              catch (err) { alert('Failed to add to cart'); }
            }}
            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
