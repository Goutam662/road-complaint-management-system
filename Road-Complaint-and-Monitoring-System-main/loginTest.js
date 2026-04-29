const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

(async () => {
  try {
    const r = await fetch('https://road-complaint-and-monitoring-system.onrender.com/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    const data = await r.json();
    console.log('login response', data);
  } catch (e) {
    console.error(e);
  }
})();