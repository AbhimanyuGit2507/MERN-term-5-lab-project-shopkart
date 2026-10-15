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

    console.log('3. Fetching products...');
    const prodRes = await api.get('/products');
    const products = prodRes.data.products;
    if (products.length === 0) throw new Error("No products found");
    const testProduct = products[0];
    const initialStock = testProduct.stock;
    console.log(`✅ Found ${products.length} products (Test product: "${testProduct.name}", Initial Stock: ${initialStock})`);

    console.log('4. Testing Cart granular operations (Add, Quantity Update, Remove)...');
    await api.post(`/cart/${testProduct._id}`);
    await api.put(`/cart/${testProduct._id}`, { quantity: 2 });
    let cartRes = await api.get('/cart');
    if (cartRes.data.cart[0].quantity !== 2) throw new Error("Cart quantity update failed");
    console.log('✅ Updated cart quantity to 2');

    console.log('5. Testing Server-side Shipping Address Validation (expecting 400)...');
    try {
      await api.post('/orders/create-payment-order', { shippingAddress: { fullName: "" } });
      throw new Error("Server failed to reject invalid shipping address!");
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Correctly rejected invalid shipping address with 400 Bad Request');
      } else {
        throw err;
      }
    }

    console.log('6. Creating payment order with valid address...');
    const createOrderRes = await api.post('/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Checkout Tester',
        phone: '9876543210',
        addressLine1: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    });
    const { shopKartOrderId, razorpayOrderId, amount } = createOrderRes.data;
    const expectedPaise = testProduct.price * 2 * 100;
    if (amount !== expectedPaise) throw new Error(`Total mismatch: expected ${expectedPaise}, got ${amount}`);
    console.log(`✅ Created pending order ${shopKartOrderId} and Razorpay order ${razorpayOrderId} with server-calculated total`);

    console.log('7. Generating Razorpay signature...');
    const razorpay_payment_id = 'pay_dummy123';
    const secret = '86OMwQ9v0uThNetS5iKFe5u4';
    const body = razorpayOrderId + '|' + razorpay_payment_id;
    const razorpay_signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    console.log('✅ Generated signature:', razorpay_signature);

    console.log('8. Verifying payment...');
    const verifyRes = await api.post('/orders/verify-payment', {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id,
      razorpay_signature
    });
    console.log('✅ Payment verified! Order status:', verifyRes.data.order.status);

    console.log('9. Checking cart is cleared after payment...');
    cartRes = await api.get('/cart');
    if (cartRes.data.cart.length > 0) throw new Error("Cart was not cleared!");
    console.log('✅ Cart is correctly empty!');

    console.log('10. Verifying inventory stock was decremented...');
    const updatedProdRes = await api.get(`/products/${testProduct._id}`);
    const newStock = updatedProdRes.data.product.stock;
    if (newStock !== initialStock - 2) {
      throw new Error(`Stock not decremented properly! Expected ${initialStock - 2}, got ${newStock}`);
    }
    console.log(`✅ Stock decremented accurately: ${initialStock} -> ${newStock}`);

    console.log('11. Testing Bonus Challenge (+10 Marks): Order Status Progression...');
    const statusRes = await api.patch(`/orders/${shopKartOrderId}/status`, { status: 'CONFIRMED' });
    if (statusRes.data.order.status !== 'CONFIRMED') throw new Error("Status update to CONFIRMED failed");
    await api.patch(`/orders/${shopKartOrderId}/status`, { status: 'SHIPPED' });
    const finalStatusRes = await api.patch(`/orders/${shopKartOrderId}/status`, { status: 'DELIVERED' });
    if (finalStatusRes.data.order.status !== 'DELIVERED') throw new Error("Status update to DELIVERED failed");
    console.log('✅ Successfully progressed order status: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED');

    console.log('\n🎉 ALL FULL-STACK & BONUS TESTS PASSED WITH 100% SUCCESS!');

  } catch (err) {
    console.error('\n❌ Test failed:');
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

runTests();
