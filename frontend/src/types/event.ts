export interface EventSession {
  id: string;
  title: string;
  description: string | null;
  session_type: 'PHYSICAL' | 'ONLINE';
  session_date: string;
  start_time: string;
  end_time: string;
  venue: string | null;
  meeting_url: string | null;
  joining_instructions: string | null;
  xp_reward: number;
  is_active: boolean;
  created_at?: string;
  has_participated?: boolean;
  declared_at?: string | null;
}

