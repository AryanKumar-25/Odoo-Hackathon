import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to our Express backend
});

// Auto-attach JWT token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
