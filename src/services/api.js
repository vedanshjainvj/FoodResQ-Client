import axios from 'axios';

const API_URL = 'https://foodresq-server.onrender.com/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  updateProfile: async (userData) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const response = await api.put(`/auth/updateprofile`, userData);
    
    if (response.data.success) {
      // Update the stored user data
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  }
};

// Food services
export const foodService = {
  getAllFood: async (params = {}) => {
    const response = await api.get('/food', { params });
    return response.data;
  },
  
  getFood: async (id) => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },
  
  createFood: async (foodData) => {
    const response = await api.post('/food', foodData);
    return response.data;
  },
  
  updateFood: async (id, foodData) => {
    const response = await api.put(`/food/${id}`, foodData);
    return response.data;
  },
  
  deleteFood: async (id) => {
    const response = await api.delete(`/food/${id}`);
    return response.data;
  },
  
  acceptFood: async (id, quantity) => {
    const response = await api.post(`/food/${id}/accept`, { quantity });
    return response.data;
  }
};

export default api; 