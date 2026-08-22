async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyName: 'Test Co ' + Date.now(),
        name: 'Admin User',
        email: 'admin' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
