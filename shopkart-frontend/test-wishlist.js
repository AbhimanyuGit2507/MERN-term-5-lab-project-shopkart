import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

const runTests = async () => {
  try {
    const timestamp = Date.now();
    const testUser = {
      fullName: 'Test User',
      email: `test${timestamp}@example.com`,
      password: 'password123',
      phone: '1234567890'
    };

    console.log('1. Registering user...');
    await api.post('/customers/register', testUser);
    console.log('✅ Registered');

    console.log('2. Logging in...');
    const loginRes = await api.post('/customers/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Logged in');
    
    const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0] : '';
    api.defaults.headers.Cookie = cookie;

    console.log('3. Fetching products...');
    const productsRes = await api.get('/products');
    const products = productsRes.data.products;
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      throw new Error("No products found, seed failed.");
    }

    const testProductId = products[0]._id;

    console.log(`4. Adding product ${testProductId} to wishlist...`);
    await api.post(`/wishlist/${testProductId}`);
    console.log('✅ Added to wishlist');

    console.log('5. Testing duplicate add (expecting 409)...');
    try {
      await api.post(`/wishlist/${testProductId}`);
      console.log('❌ Failed: duplicate add did not throw 409');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('✅ Caught duplicate 409 correctly');
      } else {
        throw err;
      }
    }

    console.log('6. Fetching wishlist...');
    const wishlistRes = await api.get('/wishlist');
    const wishlist = wishlistRes.data.wishlist;
    if (wishlist.length === 1 && wishlist[0]._id === testProductId) {
      console.log('✅ Wishlist contains the product');
    } else {
      throw new Error("Wishlist does not contain the expected product");
    }

    console.log('7. Removing from wishlist...');
    await api.delete(`/wishlist/${testProductId}`);
    console.log('✅ Removed from wishlist');

    console.log('8. Fetching wishlist again...');
    const wishlistRes2 = await api.get('/wishlist');
    if (wishlistRes2.data.wishlist.length === 0) {
      console.log('✅ Wishlist is empty');
    } else {
      throw new Error("Wishlist is not empty after removal");
    }

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error(error.response ? error.response.data : error.message);
  }
};

runTests();
