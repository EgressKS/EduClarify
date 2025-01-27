import axios from 'axios';

const baseUrl =
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 30000,
});

export { apiClient };

