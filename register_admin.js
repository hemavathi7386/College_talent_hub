const axios = require('axios');

async function registerAdmin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'System Administrator',
      email: 'admin@cutmap.ac.in',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('Admin user registered successfully!');
    console.log('Email: admin@cutmap.ac.in');
    console.log('Password: admin123');
    console.log('Token:', response.data.token);
    
  } catch (error) {
    if (error.response) {
      console.log('Registration failed:', error.response.data.message);
      if (error.response.data.message === 'User already exists') {
        console.log('Admin user already exists - you can login now!');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

registerAdmin();
