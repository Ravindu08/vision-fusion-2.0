import apiClient from './api';
import type { QuizSummary, QuizDetail, QuizResult } from '../types/quiz';

export const quizService = {
  async getQuizzes(): Promise<QuizSummary[]> {
    const response = await apiClient.get<QuizSummary[]>('/quizzes');
    return response.data;
  },

  async getQuizDetail(quizId: string): Promise<QuizDetail> {
    const response = await apiClient.get<QuizDetail>(`/quizzes/${quizId}`);
    return response.data;
  },

  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<QuizResult> {
    const response = await apiClient.post<QuizResult>(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  },
};

export default quizService;

