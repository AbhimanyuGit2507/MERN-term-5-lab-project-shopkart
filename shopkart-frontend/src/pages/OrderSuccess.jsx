import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="text-6xl mb-6">✅</div>
      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Order Placed Successfully</h2>
      <p className="text-gray-600 mb-8 text-lg bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">Order ID: <span className="font-bold text-gray-900">{id}</span></p>
      <div className="flex gap-4">
        <button onClick={() => navigate('/orders')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">View My Orders</button>
        <button onClick={() => navigate('/products')} className="bg-white border-2 border-gray-200 text-gray-800 px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition">Continue Shopping</button>
      </div>
    </div>
  );
}
