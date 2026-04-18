import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('dh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (!err.response) {
      // Missing response usually means CORS error or Server is totally down
      err.response = {
        data: {
          message: 'Network Error: Cannot reach the backend API. Please ensure your Vercel backend has FRONTEND_URL set correctly, and you have Redeployed it.',
        },
      };
      return Promise.reject(err);
    }
    
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('dh_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
