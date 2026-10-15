import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: ""
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        if (response.data.cart.length === 0) {
          navigate('/cart');
        } else {
          setCart(response.data.cart);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
    loadRazorpayScript();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      return setError("All fields are required.");
    }
    if (!/^\d+$/.test(form.phone)) return setError("Phone must contain valid numbers.");
    if (!/^\d{6}$/.test(form.pincode)) return setError("Pincode must contain 6 digits.");
    
    setPlacingOrder(true);
    try {
      const response = await api.post('/orders/create-payment-order', { shippingAddress: form });
      const data = response.data;
      
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,
        handler: async function (res) {
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            });
            if (verifyRes.data.success) {
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (err) {
            setError("Payment verification failed.");
          }
        },
        prefill: {
          name: form.fullName,
          contact: form.phone
        },
        theme: { color: "#4f46e5" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError("Payment failed. Your cart has not been cleared. Please try again.");
      });
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || "Order creation failed.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) return <div className="min-h-[calc(100vh-73px)] flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-73px)]">
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-extrabold mb-6">Shipping Details</h2>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 font-medium border border-red-100">{error}</div>}
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
          <input name="addressLine1" placeholder="Address" onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
          <div className="flex gap-4">
            <input name="city" placeholder="City" onChange={handleChange} className="w-1/2 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
            <input name="state" placeholder="State" onChange={handleChange} className="w-1/2 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
          </div>
          <input name="pincode" placeholder="Pincode (6 digits)" onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition" />
          <div className="pt-4">
            <button type="submit" disabled={placingOrder} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-extrabold text-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50">
              {placingOrder ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
      <div className="md:w-1/3 bg-white p-8 rounded-2xl shadow-md border border-gray-100 h-fit">
        <h2 className="text-xl font-bold mb-6 border-b pb-4">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item._id} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
              <span className="font-bold text-gray-900">₹{item.product.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 flex justify-between font-extrabold text-2xl text-indigo-600">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  );
}
