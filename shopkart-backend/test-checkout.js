const axios = require('axios');
const crypto = require('crypto');

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

let cookie = '';

api.interceptors.request.use(config => {
  if (cookie) config.headers.Cookie = cookie;
  return config;
});

api.interceptors.response.use(response => {
  if (response.headers['set-cookie']) {
    cookie = response.headers['set-cookie'][0];
  }
  return response;
});

async function runTests() {
  const email = `testcheckout${Date.now()}@example.com`;
  
  try {
    console.log('1. Registering user...');
    await api.post('/customers/register', {
      fullName: 'Checkout Tester',
      email,
      password: 'password123',
      phone: '1234567890'
    });
    console.log('✅ Registered');

    console.log('2. Logging in...');
    await api.post('/customers/login', {
      email,
      password: 'password123'
    });
    console.log('✅ Logged in');

    console.log('3. Fetching products (auto-seeding if empty)...');
    const prodRes = await api.get('/products');
    const products = prodRes.data.products;
    if (products.length === 0) throw new Error("No products found");
    const testProductId = products[0]._id;
    console.log(`✅ Found ${products.length} products`);

    console.log('4. Adding product to cart...');
    await api.post(`/cart/${testProductId}`);
    console.log('✅ Added to cart');

    console.log('5. Creating payment order...');
    const createOrderRes = await api.post('/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Checkout Tester',
        phone: '1234567890',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      }
    });
    const { shopKartOrderId, razorpayOrderId } = createOrderRes.data;
    console.log(`✅ Created pending order ${shopKartOrderId} and Razorpay order ${razorpayOrderId}`);

    console.log('6. Generating Razorpay signature...');
    const razorpay_payment_id = 'pay_dummy123';
    const secret = '86OMwQ9v0uThNetS5iKFe5u4';
    const body = razorpayOrderId + '|' + razorpay_payment_id;
    const razorpay_signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    console.log('✅ Generated signature:', razorpay_signature);

    console.log('7. Verifying payment...');
    const verifyRes = await api.post('/orders/verify-payment', {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id,
      razorpay_signature
    });
    console.log('✅ Payment verified! Order status:', verifyRes.data.order.status);

    console.log('8. Fetching my orders...');
    const ordersRes = await api.get('/orders');
    const orders = ordersRes.data.orders;
    if (orders.length !== 1 || orders[0]._id !== shopKartOrderId) {
      throw new Error("Order not found in My Orders");
    }
    console.log('✅ My orders contains the completed order');

    console.log('9. Checking cart is cleared...');
    const cartRes = await api.get('/cart');
    if (cartRes.data.cart.length > 0) {
      throw new Error("Cart was not cleared!");
    }
    console.log('✅ Cart is correctly empty!');

    console.log('\n🎉 ALL CHECKOUT TESTS PASSED!');

  } catch (err) {
    console.error('\n❌ Test failed:');
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

runTests();
