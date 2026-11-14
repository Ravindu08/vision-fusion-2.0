export interface User {
  id: string;
  full_name: string;
  email: string;
  university: string;
  student_id: string | null;
  role: 'STUDENT' | 'ADMIN';
  total_xp: number;
  character_stage: string;
  is_active: boolean;
  created_at?: string;
}

export interface UserProgress extends User {
  stage_slug: 'recruit' | 'builder' | 'pathfinder' | 'intelligence-operative' | 'vanguard';
  stage_progress_percent: number;
  overall_percent: number;
  xp_to_next_stage: number;
  next_stage_title: string;
  is_certificate_eligible: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  university?: string;
  student_id?: string;
}

