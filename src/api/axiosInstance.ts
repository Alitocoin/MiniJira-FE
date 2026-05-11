import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request: adjunta token si existe
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: si 401, limpia sesión y redirige a /login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
