import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_ROOT = API_BASE.replace('/api', '');

const axiosClient = axios.create({ baseURL: API_BASE });

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_ROOT}/api/token/refresh/`, { refresh });
        localStorage.setItem('accessToken', data.access);
        err.config.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(err.config);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;