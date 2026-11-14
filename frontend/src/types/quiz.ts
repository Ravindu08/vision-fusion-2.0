export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  order_index: number;
}

export interface QuizSummary {
  id: string;
  session_id: string | null;
  title: string;
  description: string | null;
  xp_reward: number;
  pass_percentage: number;
  total_questions: number;
  is_completed: boolean;
  user_score: number | null;
  user_percentage: number | null;
  has_passed: boolean;
  xp_earned: number;
}

export interface QuizDetail extends QuizSummary {
  questions: Question[];
}

export interface QuizResult {
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  pass_percentage: number;
  xp_awarded: number;
  new_total_xp: number;
  character_stage: string;
  has_evolved: boolean;
  is_certificate_eligible: boolean;
  message: string;
  attempt_id: string;
}

