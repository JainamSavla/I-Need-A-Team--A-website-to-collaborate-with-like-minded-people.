import { UserProfile } from '../types';
import { api } from '../lib/api';

export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return null;
    }
  },

  getCurrentUser: (): UserProfile | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.patch('/users/me', profile);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }
};