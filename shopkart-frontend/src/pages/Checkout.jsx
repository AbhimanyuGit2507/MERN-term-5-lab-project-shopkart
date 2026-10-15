import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { ShieldCheck, Truck, Lock } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, cartTotal } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    loadRazorpayScript();
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.addressLine1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      return setError("All shipping details are required.");
    }

    const cleanPhone = form.phone.trim().replace(/[\s-()]/g, '');
    if (!/^\d{10,}$/.test(cleanPhone)) {
      return setError("Please enter a valid 10-digit phone number.");
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return setError("Pincode must be exactly 6 digits.");
    }

    setPlacingOrder(true);
    try {
      // Ensure Razorpay SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      // 1. Create order on backend (backend recalculates total & verifies stock)
      const response = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: cleanPhone,
          addressLine1: form.addressLine1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim()
        }
      });

      const data = response.data;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Purchase",
        order_id: data.razorpayOrderId,
        handler: async function (res) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            });

            if (verifyRes.data.success) {
              // 4. Update global cart state to empty (Navbar becomes Cart (0))
              await clearCart();
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: form.fullName,
          contact: cleanPhone
        },
        theme: { color: "#4f46e5" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError(`Payment failed: ${response.error?.description || "Transaction was declined"}. Your cart has not been cleared.`);
      });
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Order creation failed.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-8 min-h-[calc(100vh-73px)]">
      {/* Shipping Details Form */}
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <Truck className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-extrabold text-gray-900">Shipping Details</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-medium text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Full Name</label>
            <input
              name="fullName"
              placeholder="e.g. Aarav Sharma"
              value={form.fullName}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Phone Number</label>
            <input
              name="phone"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Street Address</label>
            <input
              name="addressLine1"
              placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
              value={form.addressLine1}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">City</label>
              <input
                name="city"
                placeholder="e.g. Bengaluru"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">State</label>
              <input
                name="state"
                placeholder="e.g. Karnataka"
                value={form.state}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pincode (6 digits)</label>
            <input
              name="pincode"
              placeholder="e.g. 560001"
              value={form.pincode}
              onChange={handleChange}
              maxLength={6}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none transition"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-extrabold text-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {placingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Place Order with Razorpay</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-green-600" />
              <span>Razorpay Test Mode • 256-bit Secure Encryption</span>
            </p>
          </div>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="md:w-1/3 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-900">Order Summary</h2>
        <div className="space-y-4 mb-6 divide-y divide-gray-50">
          {cart.map((item) => {
            if (!item.product) return null;
            return (
              <div key={item._id || item.product._id} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-gray-800 block">{item.product.name}</span>
                  <span className="text-gray-400 text-xs">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-gray-900">₹{item.product.price * item.quantity}</span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <span className="font-bold text-gray-600">Total Payable</span>
          <span className="font-black text-2xl text-indigo-600">₹{cartTotal}</span>
        </div>
      </div>
    </div>
  );
}
