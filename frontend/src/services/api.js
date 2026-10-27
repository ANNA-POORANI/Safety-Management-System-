import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cpsms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('cpsms_token');
        localStorage.removeItem('cpsms_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
  resetSeed: () => api.post('/dashboard/reset')
};

export const chemicalAPI = {
  getAll: (params) => api.get('/chemicals', { params }),
  getById: (id) => api.get(`/chemicals/${id}`),
  create: (data) => api.post('/chemicals', data),
  update: (id, data) => api.put(`/chemicals/${id}`, data),
  delete: (id) => api.delete(`/chemicals/${id}`)
};

export const inspectionAPI = {
  getAll: (params) => api.get('/inspections', { params }),
  getById: (id) => api.get(`/inspections/${id}`),
  create: (data) => api.post('/inspections', data),
  update: (id, data) => api.put(`/inspections/${id}`, data),
  delete: (id) => api.delete(`/inspections/${id}`)
};

export const incidentAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`)
};

export const emergencyAPI = {
  getProtocols: () => api.get('/emergency'),
  getById: (id) => api.get(`/emergency/${id}`),
  trigger: (id) => api.post(`/emergency/${id}/trigger`),
  standDown: (id) => api.post(`/emergency/${id}/standdown`)
};

export const complianceAPI = {
  getAll: (params) => api.get('/compliance', { params }),
  getById: (id) => api.get(`/compliance/${id}`),
  create: (data) => api.post('/compliance', data),
  update: (id, data) => api.put(`/compliance/${id}`, data),
  delete: (id) => api.delete(`/compliance/${id}`)
};

export default api;
