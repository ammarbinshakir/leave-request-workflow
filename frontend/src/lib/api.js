import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include user ID
api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (email) => api.post('/auth/login', { email }),
  getUsers: () => api.get('/auth/users'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const leaveAPI = {
  applyForLeave: (leaveData) => api.post('/leave/apply', leaveData),
  getPendingRequests: () => api.get('/leave/pending'),
  processLeaveRequest: (id, action, comments) => 
    api.post(`/leave/approve/${id}`, { action, comments }),
  getMyRequests: () => api.get('/leave/my-requests'),
  getLeaveBalance: () => api.get('/leave/balance'),
  getMonthlySummary: (year, month) => 
    api.get(`/leave/summary?year=${year}&month=${month}`),
};

export default api;