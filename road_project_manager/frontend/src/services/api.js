import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Project service
export const projectService = {
  getAll: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    console.log('API: Updating project', id, 'with data:', projectData);
    try {
      const response = await api.put(`/projects/${id}/`, projectData);
      console.log('API: Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Update failed:', error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    await api.delete(`/projects/${id}/`);
  },

  getNearby: async (lat, lng, radius = 10) => {
    const response = await api.get(`/projects/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },

  getSegments: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/segments/`);
    return response.data;
  },

  getPhotos: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/photos/`);
    return response.data;
  },
};

// Road segment service
export const segmentService = {
  getAll: async () => {
    const response = await api.get('/segments/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/segments/${id}/`);
    return response.data;
  },

  create: async (segmentData) => {
    const response = await api.post('/segments/', segmentData);
    return response.data;
  },

  update: async (id, segmentData) => {
    const response = await api.put(`/segments/${id}/`, segmentData);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/segments/${id}/`);
  },
};

// Photo service
export const photoService = {
  getAll: async () => {
    const response = await api.get('/photos/');
    return response.data;
  },

  upload: async (formData) => {
    const response = await api.post('/photos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/photos/${id}/`);
  },
};

// Auth service
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },
};

export default api;