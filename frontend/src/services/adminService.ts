import apiClient from './api';

export interface AdminStats {
  total_students: number;
  total_sessions: number;
  total_attendance_records: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  total_certificates_claimed: number;
  total_certificates_eligible: number;
}

export interface AdminUserItem {
  id: string;
  full_name: string;
  email: string;
  university: string | null;
  student_id: string | null;
  role: string;
  total_xp: number;
  character_stage: string;
  is_active: boolean;
  created_at: string | null;
  sessions_attended: number;
  quizzes_completed: number;
  certificate_eligible: boolean;
  certificate_claimed: boolean;
}

export interface AdminUserListResponse {
  total: number;
  users: AdminUserItem[];
}

export interface AdminUserUpdate {
  full_name?: string;
  student_id?: string;
  university?: string;
  total_xp?: number;
  is_active?: boolean;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  },

  async getUsers(params?: {
    search?: string;
    stage?: string;
    skip?: number;
    limit?: number;
  }): Promise<AdminUserListResponse> {
    const res = await apiClient.get<AdminUserListResponse>('/admin/users', { params });
    return res.data;
  },

  async updateUser(userId: string, data: AdminUserUpdate): Promise<AdminUserItem> {
    const res = await apiClient.put<AdminUserItem>(`/admin/users/${userId}`, data);
    return res.data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`);
    return res.data;
  },

  async downloadCsv(): Promise<Blob> {
    const res = await apiClient.get('/admin/export/csv', {
      responseType: 'blob',
    });
    return res.data;
  },
};

export default adminService;
