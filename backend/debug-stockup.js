const fetch = require('node-fetch');

(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'manager@example.com', password: 'password123' }),
    });
    const loginBody = await loginRes.text();
    console.log('LOGIN STATUS', loginRes.status);
    console.log('LOGIN BODY', loginBody);
    const token = JSON.parse(loginBody).token;
    const resp = await fetch('http://localhost:3000/stock-updates', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    });
    const body = await resp.text();
    console.log('STOCK STATUS', resp.status);
    console.log('STOCK BODY', body);
  } catch (err) {
    console.error('ERROR', err);
  }
})();
