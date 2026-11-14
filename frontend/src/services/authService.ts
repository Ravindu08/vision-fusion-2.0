import apiClient from './api';
import type { LoginPayload, RegisterPayload, TokenResponse, UserProgress } from '../types/auth';

export const authService = {
  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/register', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', payload);
    return response.data;
  },

  async getCurrentUser(): Promise<UserProgress> {
    const response = await apiClient.get<UserProgress>('/auth/me');
    return response.data;
  },
};

export default authService;

