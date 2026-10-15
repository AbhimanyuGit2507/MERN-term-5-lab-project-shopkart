# 🛒 ShopKart — Full-Stack MERN E-Commerce Application

ShopKart is a full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js), featuring customer authentication, product catalog, wishlist, shopping cart, Razorpay payment gateway integration, and order management.

---

## 🌟 Key Features

- **Authentication & Authorization**: Cookie-based JWT authentication with bcrypt password hashing.
- **Product Catalog**: Dynamic product listings with categories, stock tracking, and pricing.
- **Wishlist Management**: Add/remove products with duplicate prevention.
- **Shopping Cart**: Add products, calculate totals, and sync with MongoDB.
- **Razorpay Checkout**: Seamless test-mode payment gateway integration with server-side order generation and HMAC SHA256 signature verification.
- **Order Management**: Order snapshots (persisting purchase-time prices and images) and customer order history.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios, React Router v6
- **Backend**: Node.js, Express 5, Mongoose, Razorpay SDK, Cookie-Parser, JWT, Crypto
- **Database**: MongoDB Atlas

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- Razorpay Test Account credentials

### 2. Backend Setup
```bash
cd shopkart-backend
npm install
cp .env.example .env
# Edit .env and supply your MongoDB URI, JWT Secret, and Razorpay Keys
npm start # or node index.js
```

### 3. Frontend Setup
```bash
cd shopkart-frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.
