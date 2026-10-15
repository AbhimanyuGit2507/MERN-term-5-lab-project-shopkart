import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Check, Eye, X } from 'lucide-react';

export default function ProductCard({ product, initiallyInWishlist = false, onRemove }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlistStatus, setWishlistStatus] = useState(initiallyInWishlist ? 'added' : 'default');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const result = await addToCart(product._id);
    setAddingToCart(false);
    if (result.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1800);
    } else {
      if (result.message.includes("Unauthorized") || result.message.includes("login")) {
        navigate('/login');
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col group">
        <div className="relative overflow-hidden aspect-4/3 bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3">
            {initiallyInWishlist || onRemove ? (
              <button
                onClick={handleRemoveClick}
                disabled={wishlistStatus === 'loading'}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-red-600 hover:bg-white shadow-sm transition"
                title="Remove from wishlist"
              >
                <Heart size={18} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleWishlistClick}
                disabled={wishlistStatus === 'loading'}
                className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm transition ${
                  wishlistStatus === 'added' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'
                }`}
                title="Add to wishlist"
              >
                <Heart size={18} fill={wishlistStatus === 'added' ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {product.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>

          <div className="mb-4">
            <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5 border border-gray-200"
            >
              <Eye size={16} />
              <span>View Details</span>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock <= 0}
              className={`w-full font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-xs ${
                addedSuccess
                  ? 'bg-green-600 text-white'
                  : product.stock <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check size={16} />
                  <span>Added to Cart!</span>
                </>
              ) : addingToCart ? (
                <span>Adding...</span>
              ) : product.stock <= 0 ? (
                <span>Out of Stock</span>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-16/10 bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:bg-white shadow-md transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {product.stock} units available
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-6">
                Premium authentic electronics from ShopKart. Guaranteed high durability, modern ergonomics, and fast dispatch.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block font-semibold uppercase">Price</span>
                  <span className="text-2xl font-black text-indigo-600">₹{product.price}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart();
                      setShowDetailsModal(false);
                    }}
                    disabled={product.stock <= 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
