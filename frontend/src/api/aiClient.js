import axios from 'axios';

// Points to Node (port 5000) not Django directly
// Node proxies /api/ai/* to Django automatically
const aiClient = axios.create({
  baseURL: 'http://localhost:5000/api/ai',
});

// Uses 'token' — same key your whole app uses
aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

aiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default aiClient;