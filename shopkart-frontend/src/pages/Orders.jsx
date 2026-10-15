import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data.orders);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) return <div className="min-h-[calc(100vh-73px)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="min-h-[calc(100vh-73px)] flex justify-center items-center text-red-600">Failed to load orders.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-[calc(100vh-73px)]">
      <h1 className="text-3xl font-extrabold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4 text-lg">You have not placed any orders yet.</p>
            <button onClick={() => navigate('/products')} className="text-indigo-600 font-bold hover:underline">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 gap-4">
                <div>
                  <p className="font-bold text-gray-900">Order #{order._id}</p>
                  <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-extrabold text-xl text-indigo-600">₹{order.totalAmount}</p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold mt-2 uppercase tracking-wide">{order.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item._id} className="flex items-center gap-4 text-sm">
                    {item.image && <img src={item.image} className="w-12 h-12 object-cover rounded-md border border-gray-200" alt={item.name}/>}
                    <div className="flex-1">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500 ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
