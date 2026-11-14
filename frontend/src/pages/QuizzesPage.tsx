import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { quizService } from '../services/quizService';
import type { QuizSummary, QuizDetail, QuizResult } from '../types/quiz';
import confetti from 'canvas-confetti';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const QuizzesPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser, triggerLevelUp } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Active quiz playing state
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const fetchQuizzes = async () => {
    try {
      const data = await quizService.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [isAuthenticated]);

  const handleStartQuiz = async (quizId: string) => {
    setLoadingDetail(true);
    setQuizResult(null);
    setSelectedAnswers({});
    try {
      const detail = await quizService.getQuizDetail(quizId);
      setActiveQuiz(detail);
    } catch (err) {
      console.error('Failed to load quiz detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);

    try {
      const result = await quizService.submitQuiz(activeQuiz.id, selectedAnswers);
      setQuizResult(result);

      if (result.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#00f0ff', '#10b981', '#f59e0b'],
        });
      }

      if (result.has_evolved) {
        const stageSlug = result.character_stage.toLowerCase().replace(/ /g, '-') as any;
        triggerLevelUp(stageSlug, user?.character_stage, result.new_total_xp);
      }

      await refreshUser();
      await fetchQuizzes();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header Banner */}
        <div className="cyber-card p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> 70% Journey XP Arena
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
              Vision Fusion 2.0 <span className="cyber-gradient-text">Quizzes & Challenges</span>
            </h1>
            <p className="text-slate-400 text-sm font-mono leading-relaxed">
              Test your technical skills, master core computer science & AI concepts, and earn the majority 70% of your XP to evolve your operative avatar.
            </p>
          </div>
        </div>

        {/* QUIZ PLAYER MODAL / SECTION */}
        {activeQuiz && (
          <div className="cyber-card p-6 md:p-8 mb-8 border-purple-500/50 shadow-glow-purple">
            <div className="flex items-center justify-between border-b border-cyber-border pb-4 mb-6">
              <div>
                <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                  Active Challenge
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
                  {activeQuiz.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-3 py-1 text-xs font-mono rounded bg-cyber-dark border border-cyber-border text-slate-400 hover:text-white"
              >
                ✕ Close Quiz
              </button>
            </div>

            {/* If Quiz Already Completed / Result Available */}
            {quizResult ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyber-dark border border-cyber-border shadow-glow-cyan">
                  {quizResult.passed ? (
                    <Award className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                </div>

                <h3 className="text-2xl font-black">
                  {quizResult.passed ? (
                    <span className="text-emerald-400">Challenge Passed!</span>
                  ) : (
                    <span className="text-amber-400">Challenge Incomplete</span>
                  )}
                </h3>

                <p className="text-sm font-mono text-slate-300 max-w-md mx-auto">
                  {quizResult.message}
                </p>

                <div className="inline-flex items-center gap-6 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block">Score</span>
                    <span className="text-base font-bold text-cyan-400">
                      {quizResult.score} / {quizResult.total_questions}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Accuracy</span>
                    <span className="text-base font-bold text-purple-400">
                      {quizResult.percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">XP Gained</span>
                    <span className="text-base font-bold text-emerald-400">
                      +{quizResult.xp_awarded} XP
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="cyber-btn-primary px-6 py-2.5 text-xs font-mono uppercase font-bold"
                  >
                    Return to Quizzes Hub
                  </button>
                </div>
              </div>
            ) : (
              /* Questions Answering Form */
              <div className="space-y-8">
                {activeQuiz.questions.map((q, qIndex) => {
                  const currentSelected = selectedAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl bg-cyber-dark/60 border border-cyber-border"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIndex + 1}
                        </span>
                        <h4 className="text-sm md:text-base font-semibold text-slate-100">
                          {q.question_text}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
                        {q.options.map((option, optIdx) => {
                          const isSelected = currentSelected === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`text-left p-3.5 rounded-lg border text-xs md:text-sm font-sans transition-all flex items-center gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-500/20 border-purple-400 text-purple-100 shadow-glow-purple font-medium'
                                  : 'bg-cyber-dark border-cyber-border text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border text-[11px] font-mono flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-purple-400 bg-purple-500 text-slate-950 font-bold'
                                    : 'border-slate-600 text-slate-500'
                                }`}
                              >
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-4 border-t border-cyber-border">
                  <span className="text-xs font-mono text-slate-400">
                    Answered {Object.keys(selectedAnswers).length} of {activeQuiz.questions.length} questions
                  </span>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={
                      submitting ||
                      Object.keys(selectedAnswers).length < activeQuiz.questions.length
                    }
                    className="cyber-btn-primary px-8 py-3 text-xs font-mono uppercase font-bold flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Evaluating...
                      </>
                    ) : (
                      <>
                        Submit & Claim XP <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUIZZES LISTING */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 font-display">
            Available Knowledge Challenges
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Quizzes: <span className="text-purple-400 font-bold">{quizzes.length}</span>
          </span>
        </div>

        {loading ? (
          <div className="cyber-card p-16 flex flex-col items-center justify-center text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Loading Challenge Vault...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="cyber-card p-6 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" /> +{quiz.xp_reward} XP
                    </span>

                    {quiz.is_completed ? (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                          quiz.has_passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {quiz.has_passed ? 'Completed ✅' : 'Attempted'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono uppercase">
                        Available
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3 mb-4">
                    {quiz.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-cyber-border text-xs font-mono text-slate-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Questions: {quiz.total_questions}</span>
                    <span>Passing: {quiz.pass_percentage}%</span>
                  </div>

                  {quiz.is_completed && (
                    <div className="p-2 rounded bg-cyber-dark text-[11px] flex justify-between text-slate-300">
                      <span>Your Score: {quiz.user_score}/{quiz.total_questions} ({quiz.user_percentage}%)</span>
                      <span className="text-emerald-400 font-bold">+{quiz.xp_earned} XP</span>
                    </div>
                  )}

                  <div className="pt-2">
                    {quiz.is_completed && !quiz.has_passed ? (
                      <button
                        onClick={() => handleStartQuiz(quiz.id)}
                        disabled={loadingDetail}
                        className="w-full py-2.5 rounded-lg bg-cyber-dark border border-cyber-border text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retake Challenge
                      </button>
                    ) : quiz.is_completed && quiz.has_passed ? (
                      <div className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Passed & Claimed (+{quiz.xp_earned} XP)
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(quiz.id)}
                        disabled={loadingDetail}
                        className="w-full cyber-btn-primary py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        {loadingDetail ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Enter Quiz Challenge <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default QuizzesPage;
