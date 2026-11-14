import apiClient from './api';

export interface CertificateStatus {
  is_eligible: boolean;
  current_xp: number;
  threshold_xp: number;
  overall_percentage: number;
  is_claimed: boolean;
  certificate_id: string | null;
  issued_at: string | null;
}

export const certificateService = {
  async getStatus(): Promise<CertificateStatus> {
    const response = await apiClient.get<CertificateStatus>('/certificates/status');
    return response.data;
  },

  async claim(): Promise<{ success: boolean; message: string; certificate_id: string }> {
    const response = await apiClient.post('/certificates/claim');
    return response.data;
  },

  async downloadPdf(): Promise<Blob> {
    const response = await apiClient.get('/certificates/download', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default certificateService;

