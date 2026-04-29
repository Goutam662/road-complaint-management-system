import fs from 'fs';
(async () => {
  const registerResp = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name:'Test User', mobile:'9999999999', village:'Testville', email:'uploadtest@example.com', password:'Password123'})
  });
  const regData = await registerResp.json();
  console.log('register status', registerResp.status, JSON.stringify(regData));
  const token = regData.token;
  if (!token) return;
  const filePath = './backend/uploads/healthcheck.txt';
  fs.writeFileSync(filePath, 'upload test');
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));
  form.append('location', 'Test Location');
  form.append('description', 'Test desc');
  form.append('severity', 'High');
  form.append('path', JSON.stringify([{lat:10,lng:20},{lat:10.5,lng:20.5}]));
  form.append('routePath', JSON.stringify([]));
  form.append('lat', '10');
  form.append('lng', '20');
  form.append('latitude', '10');
  form.append('longitude', '20');
  const uploadResp = await fetch('http://localhost:5000/api/complaints/upload', {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`},
    body: form
  });
  const uploadText = await uploadResp.text();
  console.log('upload status', uploadResp.status, uploadText);
})();
