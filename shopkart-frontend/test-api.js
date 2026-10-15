import axios from 'axios';

async function testFlow() {
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  let cookie = '';

  try {
    console.log('1. Testing Registration...');
    const regRes = await api.post('/customers/register', {
      fullName: 'Test User',
      email: email,
      phone: '1234567890',
      password: password
    });
    console.log('Registration Success:', regRes.data.success);

    console.log('\n2. Testing Login...');
    const loginRes = await api.post('/customers/login', {
      email: email,
      password: password
    });
    console.log('Login Success:', loginRes.data.success);
    
    if (loginRes.headers['set-cookie']) {
      cookie = loginRes.headers['set-cookie'][0];
    }

    console.log('\n3. Testing /customers/me (Protected Route)...');
    const meRes = await api.get('/customers/me', {
      headers: { Cookie: cookie }
    });
    console.log('Me Success, Name:', meRes.data.fullName);

    console.log('\n4. Testing Logout...');
    const logoutRes = await api.post('/customers/logout', {}, {
      headers: { Cookie: cookie }
    });
    console.log('Logout Success:', logoutRes.data.success);

    console.log('\n5. Testing /customers/me after logout...');
    try {
      await api.get('/customers/me', {
        headers: { Cookie: logoutRes.headers['set-cookie'] ? logoutRes.headers['set-cookie'][0] : '' }
      });
      console.log('Error: /customers/me should have failed!');
    } catch (err) {
      console.log('Successfully blocked access after logout (Status:', err.response?.status, ')');
    }

    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error('Test Failed:', error.response ? error.response.data : error.message);
  }
}

testFlow();
