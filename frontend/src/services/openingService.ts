import { Opening, Application } from '../types';
import { api } from '../lib/api';

export const openingService = {
  getOpenings: async (filters: any = {}): Promise<Opening[]> => {
    const response = await api.get('/openings', { params: filters });
    return response.data;
  },

  getOpeningById: async (id: string): Promise<Opening> => {
    const response = await api.get(`/openings/${id}`);
    return response.data;
  },

  createOpening: async (openingData: any): Promise<Opening> => {
    const response = await api.post('/openings', openingData);
    return response.data;
  },

  updateOpening: async (id: string, openingData: any): Promise<Opening> => {
    const response = await api.patch(`/openings/${id}`, openingData);
    return response.data;
  },

  deleteOpening: async (id: string): Promise<void> => {
    await api.delete(`/openings/${id}`);
  },

  apply: async (openingId: string, data: any): Promise<Application> => {
    const response = await api.post(`/applications/openings/${openingId}/apply`, data);
    return response.data;
  },

  getApplicationsByOpening: async (openingId: string): Promise<Application[]> => {
    const response = await api.get(`/applications/openings/${openingId}/applications`);
    return response.data;
  },

  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get('/users/me/applications');
    return response.data;
  },

  updateApplicationStatus: async (applicationId: string, data: { status: string, roleId?: string }): Promise<Application> => {
    const response = await api.patch(`/applications/applications/${applicationId}/status`, data);
    return response.data;
  }
};