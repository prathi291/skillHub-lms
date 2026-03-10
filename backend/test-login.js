const email = 'student@lms.com';
const password = 'password123';
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
    .then(res => res.json())
    .then(data => console.log('Response:', data))
    .catch(err => console.error('Error:', err));
