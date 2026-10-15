import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        setCart(response.data.cart);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleClear = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-73px)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[calc(100vh-73px)]">
      <h1 className="text-3xl font-extrabold mb-8">Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4 text-lg">Your cart is empty.</p>
          <button onClick={() => navigate('/products')} className="text-indigo-600 font-bold hover:underline">Browse Products</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {cart.map(item => (
            <div key={item._id} className="flex gap-6 border-b py-6 last:border-b-0">
              <img src={item.product.image} className="w-24 h-24 object-cover rounded-lg border border-gray-200" alt={item.product.name} />
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg">{item.product.name}</h3>
                <p className="text-gray-500">₹{item.product.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center">
                <p className="font-bold text-lg text-indigo-600">₹{item.product.price * item.quantity}</p>
              </div>
            </div>
          ))}
          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <button onClick={handleClear} className="text-red-500 font-medium hover:underline">Clear Cart</button>
            <div className="flex items-center gap-6">
              <div className="text-xl font-bold">Total: ₹{cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}</div>
              <button onClick={() => navigate('/checkout')} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
