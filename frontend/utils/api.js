import axios from 'axios';

// Environment-aware dynamic API initialization base parameters
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = rawApiUrl.endsWith('/api')
  ? rawApiUrl.replace(/\/$/, '')
  : `${rawApiUrl.replace(/\/$/, '')}/api`;
const HEALTH_URL = import.meta.env.VITE_HEALTH_URL || 'http://localhost:5000/';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global Request Interceptor: Automatically handles token attachment dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🟢 FIX 1: Optimized Response Interceptor 
// Automatically unwraps response.data so your API interface layer stays completely clean.
apiClient.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    // Retain the core server-side message details safely
    const customError = error.response?.data?.error || error.response?.data?.message || error.message || 'An API error occurred';
    return Promise.reject(new Error(customError));
  }
);

// Unified Global API Interface Methods
export const api = {
  // === Health Check ===
  health: {
    check: async () => {
      const response = await axios.get(HEALTH_URL);
      return response.data;
    }
  },

  // === Auth APIs ===
  auth: {
    signup: async (payload) => {
      // 🟢 Interceptor automatically returns data directly now
      return await apiClient.post('/auth/signup', payload);
    },
    login: async (payload) => {
      // 🟢 FIX 2: Adapted to use the clean, unwrapped interceptor format securely
      const data = await apiClient.post('/auth/login', payload);
      if (data && data.token) {
        localStorage.setItem('token', data.token); // Cache token locally
      }
      return data;
    },
    updateProfile: async (payload) => {
      return await apiClient.put('/auth/update-profile', payload);
    },
    logout: () => {
      localStorage.removeItem('token');
    }
  },

  // === Product APIs ===
  products: {
    getAllProducts: async () => {
      return await apiClient.get('/products');
    },
    getProductBySlug: async (slug) => {
      return await apiClient.get(`/products/${slug}`);
    },
    addProduct: async (formData) => {
      return await apiClient.post('/products/admin/add', formData);
    },
    updateProduct: async (id, payload) => {
      return await apiClient.put(`/products/admin/update/${id}`, payload);
    },
    deleteProduct: async (id) => {
      return await apiClient.delete(`/products/admin/delete/${id}`);
    }
  },

  // === Cart APIs ===
  cart: {
    getCart: async (userId) => {
      return await apiClient.get(`/cart/${userId}`);
    },
    addToCart: async (userId, productId) => {
      return await apiClient.post('/cart/add', { userId, productId });
    },
    decreaseQty: async (userId, productId) => {
      return await apiClient.post('/cart/decrease', { userId, productId });
    },
    removeItem: async (userId, productId) => {
      return await apiClient.post('/cart/remove', { userId, productId });
    }
  },

  // === Order APIs ===
  orders: {
    createRazorpayOrder: async (cartItems) => {
      return await apiClient.post('/orders/create-razorpay-order', { cartItems });
    },
    verifyRazorpayPayment: async (paymentDetails) => {
      return await apiClient.post('/orders/verify-payment', paymentDetails);
    },
    getUserOrders: async (userId) => {
      return await apiClient.get(`/orders/user/${userId}`);
    },
    dispatchOrder: async (dispatchDetails) => {
      return await apiClient.post('/orders/admin/dispatch', dispatchDetails);
    },
    getAllAdminOrders: async () => {
      return await apiClient.get('/orders/admin/all');
    },
    updateOrderStatus: async (orderId, status) => {
      return await apiClient.post('/orders/admin/update-status', { orderId, status });
    },
    deleteOrder: async (orderId) => {
      return await apiClient.delete(`/orders/admin/delete-order/${orderId}`);
    }
  }
};