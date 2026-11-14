import apiClient from './api';
import type { EventSession } from '../types/event';

export interface ParticipationResponse {
  success: boolean;
  message: string;
  session_id: string;
  session_title: string;
  xp_awarded: number;
  new_total_xp: number;
  character_stage: string;
  has_evolved: boolean;
  declared_at: string;
}

export const eventService = {
  async getSessions(): Promise<EventSession[]> {
    const response = await apiClient.get<EventSession[]>('/sessions');
    return response.data;
  },

  async getSession(id: string): Promise<EventSession> {
    const response = await apiClient.get<EventSession>(`/sessions/${id}`);
    return response.data;
  },

  async declareParticipation(sessionId: string): Promise<ParticipationResponse> {
    const response = await apiClient.post<ParticipationResponse>(`/attendance/${sessionId}/declare`);
    return response.data;
  },

  async getMyAttendance(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/attendance/my-records');
    return response.data;
  },
};

export default eventService;
