import { Message, Team } from '../types';
import { api } from '../lib/api';

export const chatService = {
  getMyTeams: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  getTeamMessages: async (teamId: string): Promise<Message[]> => {
    const response = await api.get(`/teams/${teamId}/chat`);
    return response.data;
  },

  sendMessage: async (teamId: string, text: string): Promise<Message> => {
    const response = await api.post(`/teams/${teamId}/chat`, { text });
    return response.data;
  },

  getTeamMembers: async (teamId: string): Promise<any[]> => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  getDirectMessages: async (userId: string): Promise<any[]> => {
    const response = await api.get(`/chat/direct/${userId}`);
    return response.data;
  },

  sendDirectMessage: async (userId: string, text: string): Promise<any> => {
    const response = await api.post(`/chat/direct/${userId}`, { text });
    return response.data;
  },

  getConversations: async (): Promise<any[]> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  }
};