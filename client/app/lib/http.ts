import axios from 'axios';

// Use explicit backend URL, defaulting to localhost:5000 for local development
const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

console.log('[HTTP Client] Base URL configured as:', baseUrl);

const apiClient = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export { apiClient };

