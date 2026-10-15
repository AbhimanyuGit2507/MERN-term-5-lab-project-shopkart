import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserCircle, Mail, Phone, ShoppingBag } from 'lucide-react';

export default function Home({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await api.get('/customers/me');
        setCustomer(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [navigate, setIsAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-gray-50">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="bg-indigo-600 px-8 py-12 text-center text-white">
            <ShoppingBag className="mx-auto h-16 w-16 mb-4 opacity-90" />
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome, {customer.fullName}!
            </h1>
            <p className="mt-2 text-indigo-100 font-medium text-lg">
              We're glad to have you back at ShopKart.
            </p>
          </div>
          
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
              Your Profile Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <UserCircle className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                  <Phone className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
