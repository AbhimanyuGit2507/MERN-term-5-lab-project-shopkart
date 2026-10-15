import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[calc(100vh-73px)]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6 max-w-sm">
            Looks like you haven't added anything to your cart yet. Explore our products and discover great deals!
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 divide-y divide-gray-100">
            {cart.map((item) => {
              if (!item.product) return null;
              const product = item.product;
              return (
                <div key={item._id || product._id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="text-sm font-medium text-indigo-600 mt-1">₹{product.price} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-xs hover:bg-gray-100 transition text-gray-700"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(product._id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-xs hover:bg-gray-100 transition text-gray-700 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex items-center gap-4">
                    <p className="font-extrabold text-lg text-gray-900 min-w-20 text-right">
                      ₹{product.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => navigate('/products')}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              ← Continue Shopping
            </button>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">Order Total</span>
                <span className="text-2xl font-black text-indigo-600">₹{cartTotal}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-extrabold hover:bg-indigo-700 transition shadow-md flex items-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
