import api from './api';

export const authService = {
  register: async ({ name, email, password, role, tenantName }) => {
    const { data } = await api.post('/auth/register', { name, email, password, role, tenantName });
    return data;
  },

  login: async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  refresh: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
};
