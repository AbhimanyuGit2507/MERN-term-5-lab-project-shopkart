import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children, isAuthenticated }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart || []);
    } catch (err) {
      // If unauthorized or network error, set empty
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const res = await api.post(`/cart/${productId}`);
      setCart(res.data.cart || []);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add item to cart' 
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      setCart(res.data.cart || []);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update quantity' 
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      setCart(res.data.cart || []);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to remove item' 
      };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart([]);
      return { success: true };
    } catch (err) {
      setCart([]);
      return { success: false };
    }
  };

  // Total quantity of items in cart
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Total cart monetary value
  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
