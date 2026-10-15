# ShopKart

A full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). The project implements a complete online shopping flow including JWT authentication with HTTP-only cookies, dynamic product catalogs, persistent wishlists, cart state synchronization, Razorpay test payment integration, and snapshot-based order management.

---

## Overview

ShopKart was built to demonstrate an end-to-end e-commerce flow with strict server-side validation and business logic enforcement. Rather than treating checkout and cart management as pure UI states, the application ensures data integrity across every step of the customer journey:

- **State Persistence vs. Historical Snapshots**: Carts hold dynamic references to products and live inventory, while confirmed orders snapshot names, images, prices, and quantities at the exact moment of purchase so future catalog updates never alter past receipts.
- **Server-Authoritative Pricing & Stock**: Total amounts are recalculated on the server directly from current database records. Frontend-supplied prices or totals are strictly ignored to prevent tampering.
- **Secure Payment Verification**: Payment confirmation requires cryptographic HMAC SHA-256 signature verification using the secret key before marking orders as paid and clearing user carts.
- **Order Tracking**: Visual delivery progression tracking (`PLACED` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`) with a status simulation control for testing.

---

## Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios (configured with `withCredentials: true` for cookie handling)
- **State Management**: React Context (`CartContext`) for global cart count and synchronization

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) stored in HTTP-only, SameSite cookies with bcrypt password hashing
- **Payments**: Razorpay Node SDK with built-in Node `crypto` for signature verification
- **CORS**: Configured with credentials support for local development

---

## Application Flow

```text
Register / Login (JWT Cookie)
       ↓
Browse Products (Search & Category Filters)
       ↓
Wishlist & Shopping Cart (Real-time DB Sync)
       ↓
Checkout Form (Client & Server Address Validation)
       ↓
Server Stock Check & Order Creation (PENDING_PAYMENT)
       ↓
Razorpay Standard Checkout (Test Mode)
       ↓
HMAC SHA-256 Signature Verification
       ↓
Order Confirmed (PAID / PLACED) + Stock Decremented + Cart Cleared
       ↓
Order History & Delivery Progression Tracker
```

---

## API Reference

### Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| POST | `/customers/register` | Register a new customer account | No |
| POST | `/customers/login` | Authenticate customer and issue JWT cookie | No |
| GET | `/customers/me` | Fetch authenticated customer profile | Yes |
| POST | `/customers/logout` | Clear auth cookie | Yes |

### Products (`/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| GET | `/products` | List all products (auto-seeds defaults if collection is empty) | No |
| GET | `/products/:id` | Fetch details for a single product | No |

### Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| GET | `/wishlist` | Fetch current user's wishlist | Yes |
| POST | `/wishlist/:productId` | Add product to wishlist (returns 409 if already present) | Yes |
| DELETE | `/wishlist/:productId` | Remove product from wishlist | Yes |

### Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| GET | `/cart` | Get current user's cart with populated product data | Yes |
| POST | `/cart/:productId` | Add item or increment quantity | Yes |
| PUT | `/cart/:productId` | Update item quantity (removes if quantity <= 0) | Yes |
| DELETE | `/cart/:productId` | Remove a specific item from cart | Yes |
| DELETE | `/cart` | Clear entire cart | Yes |

### Orders & Checkout (`/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| POST | `/orders/create-payment-order` | Validate stock/address, create pending ShopKart order and Razorpay order | Yes |
| POST | `/orders/verify-payment` | Verify HMAC SHA-256 signature, mark PAID, decrement stock, clear cart | Yes |
| GET | `/orders` | List all orders placed by the authenticated user | Yes |
| GET | `/orders/:id` | Fetch specific order details (enforces ownership) | Yes |
| PATCH | `/orders/:id/status` | Update delivery progression status | Yes |

---

## Project Structure

```text
lab-1/
├── shopkart-backend/
│   ├── config/
│   │   └── razorpay.js            # Razorpay SDK initialization
│   ├── controllers/
│   │   ├── cart.controller.js     # Cart item addition, updates, removals
│   │   ├── customer.controller.js # Auth, registration, profile
│   │   ├── order.controller.js    # Order lifecycle, stock, payments
│   │   ├── product.controller.js  # Product listing and single lookup
│   │   └── wishlist.controller.js # Wishlist management
│   ├── middlewares/
│   │   └── auth.middleware.js     # JWT cookie extraction and validation
│   ├── models/
│   │   ├── customer.model.js      # User schema with cart & wishlist refs
│   │   ├── order.model.js         # Order schema with snapshot items & address
│   │   └── product.model.js       # Product schema with stock & pricing
│   ├── routes/                    # Express route definitions
│   ├── test-checkout.js           # Automated end-to-end checkout test suite
│   ├── index.js                   # Server entrypoint and DB connection
│   └── .env.example               # Environment variable template
│
├── shopkart-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar with dynamic cart counter
│   │   │   └── ProductCard.jsx    # Card with wishlist toggle and details modal
│   │   ├── context/
│   │   │   └── CartContext.jsx    # Global cart state provider
│   │   ├── pages/
│   │   │   ├── Cart.jsx           # Cart view with quantity controls
│   │   │   ├── Checkout.jsx       # Shipping form and Razorpay trigger
│   │   │   ├── Home.jsx           # Profile dashboard
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Orders.jsx         # Order history and delivery stepper
│   │   │   ├── OrderSuccess.jsx   # Post-payment confirmation screen
│   │   │   ├── Products.jsx       # Catalog with search and filters
│   │   │   ├── Register.jsx       # Customer registration
│   │   │   └── Wishlist.jsx       # Saved products page
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with credentials
│   │   ├── App.jsx                # Router configuration and auth check
│   │   └── main.jsx               # React DOM entrypoint
│   └── test-api.js                # Auth integration test script
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- MongoDB instance (local or MongoDB Atlas connection string)
- Razorpay account (for test API Key ID and Secret)

### 1. Backend Configuration
Navigate to the backend directory and install dependencies:

```bash
cd shopkart-backend
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Your `.env` file should look like this:

```env
PORT=5000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net"
JWT_SECRET="your_jwt_secret_here"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret_here"
```

Start the backend server:

```bash
node index.js
```

The server will connect to MongoDB and listen on `http://localhost:5000`.

### 2. Frontend Configuration
In a separate terminal, navigate to the frontend directory:

```bash
cd shopkart-frontend
npm install
npm run dev
```

Open your browser and visit `http://localhost:5173`.

---

## Running Automated Tests

The codebase includes standalone Node.js integration test scripts that verify end-to-end flows against a running backend:

- **Checkout, Payments & Status Progression**:
  ```bash
  cd shopkart-backend
  node test-checkout.js
  ```
  Tests registration, login, product fetching, cart modification, server-side address validation (rejecting malformed inputs), Razorpay order creation, HMAC signature verification, cart clearing, inventory stock decrements, and order status transitions.

- **Wishlist & Duplication Handling**:
  ```bash
  cd shopkart-frontend
  node test-wishlist.js
  ```

- **Authentication & Protected Endpoints**:
  ```bash
  cd shopkart-frontend
  node test-api.js
  ```
