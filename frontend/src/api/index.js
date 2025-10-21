import api from './axios';

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.patch(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export const tasksAPI = {
  getByProject: async (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/projects/${projectId}/tasks?${params}`);
    return response.data;
  },

  create: async (projectId, taskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.patch(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export const notesAPI = {
  getByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/notes`);
    return response.data;
  },

  create: async (projectId, noteData) => {
    const response = await api.post(`/projects/${projectId}/notes`, noteData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export const uploadsAPI = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (filename) => {
    const response = await api.delete(`/uploads/${filename}`);
    return response.data;
  },
};
