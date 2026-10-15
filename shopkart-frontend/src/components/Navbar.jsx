import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, LogOut } from 'lucide-react';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await api.post('/customers/logout');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition">
        <ShoppingCart size={24} />
        <span className="font-bold text-xl tracking-tight">ShopKart</span>
      </Link>
      
      <div>
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <Link to="/home" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Home</Link>
            <Link to="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Products</Link>
            <Link to="/wishlist" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Wishlist</Link>
            <Link to="/cart" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">Cart</Link>
            <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition">My Orders</Link>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Logging out...' : (
                <>
                  <LogOut size={16} />
                  Logout
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2">
              Login
            </Link>
            <Link to="/register" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition shadow-sm">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
