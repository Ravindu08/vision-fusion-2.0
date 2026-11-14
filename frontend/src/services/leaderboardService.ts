import apiClient from './api';
import type { CharacterStage } from '../config/characterAssets';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  university: string;
  total_xp: number;
  character_stage: string;
  stage_slug: CharacterStage;
  overall_percent: number;
  sessions_attended: number;
  quizzes_completed: number;
  certificate_unlocked: boolean;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  total_participants: number;
  total_possible_xp: number;
  certificate_threshold_xp: number;
  entries: LeaderboardEntry[];
  current_user_entry: LeaderboardEntry | null;
}

export const leaderboardService = {
  async getLeaderboard(params?: {
    limit?: number;
    search?: string;
    stage?: string;
  }): Promise<LeaderboardResponse> {
    const response = await apiClient.get<LeaderboardResponse>('/leaderboard', {
      params,
    });
    return response.data;
  },
};

export default leaderboardService;

