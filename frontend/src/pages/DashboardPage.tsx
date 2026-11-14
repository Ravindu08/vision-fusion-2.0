import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CharacterEvolutionTrack } from '../components/character/CharacterEvolutionTrack';
import { eventService } from '../services/eventService';
import { quizService } from '../services/quizService';
import {
  type CharacterStage,
  STAGES_METADATA,
  getEventPoseImage,
  EVENT_POSE_META,
  type EventJourneyPose,
} from '../config/characterAssets';
import type { EventSession } from '../types/event';
import type { QuizSummary } from '../types/quiz';
import confetti from 'canvas-confetti';
import {
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  Check
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, refreshUser, triggerLevelUp } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Event Session for the Journey
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Animation & Transition States
  const [claimingAttendance, setClaimingAttendance] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const [isPowerSurging, setIsPowerSurging] = useState(false);

  // Temporary pose override during action transitions (e.g., clicking participate)
  const [animatingPose, setAnimatingPose] = useState<EventJourneyPose | null>(null);

  const loadData = async () => {
    try {
      const [sessionsData, quizzesData] = await Promise.all([
        eventService.getSessions(),
        quizService.getQuizzes(),
      ]);
      setSessions(sessionsData);
      setQuizzes(quizzesData);
      if (sessionsData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return null;

  const EVENT_STAGE_MAP: Record<number, CharacterStage> = {
    0: 'recruit',
    1: 'builder',
    2: 'pathfinder',
    3: 'intelligence-operative',
    4: 'vanguard',
  };

  // Find currently active session and its associated quiz
  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentSessionIndex = sessions.findIndex((s) => s.id === currentSession?.id);
  const activeEventIndex = currentSessionIndex >= 0 ? currentSessionIndex : 0;

  // The character represents the event's evolution chapter:
  // Event 1 -> The Recruit, Event 2 -> The Builder, Event 3 -> The Pathfinder, Event 4 -> The Intel Operative, Event 5 -> The Vanguard
  const currentStage: CharacterStage = EVENT_STAGE_MAP[activeEventIndex] || 'recruit';
  const stageMeta = STAGES_METADATA[currentStage] || STAGES_METADATA.recruit;

  const matchedQuiz = currentSession
    ? quizzes.find((q) => q.session_id === currentSession.id) ||
      quizzes.find((q) => q.title.toLowerCase().includes(currentSession.title.split(' ')[0].toLowerCase()))
    : null;

  // Helper function to check if a session is completed (Attendance 30 XP + Quiz >= 28 XP -> 70%+)
  const isSessionCompleted = (sessId: string): boolean => {
    const s = sessions.find((item) => item.id === sessId);
    if (!s || !s.has_participated) return false;
    const q = quizzes.find((qz) => qz.session_id === s.id);
    const quizXp = q?.xp_earned || 0;
    return (s.xp_reward + quizXp) >= 70;
  };

  // Event 0 is unlocked. Event i is unlocked if event i-1 is completed!
  const isSessionUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    return isSessionCompleted(sessions[index - 1]?.id);
  };

  // Determine Event Completion Stats
  const hasAttended = currentSession?.has_participated || false;
  const attendanceXp = hasAttended ? (currentSession?.xp_reward || 30) : 0;
  const quizXpEarned = matchedQuiz?.xp_earned || 0;
  const totalEventXp = attendanceXp + quizXpEarned;
  const isEventMastered = totalEventXp >= 70; // 30% attendance + 40%+ quiz = 70%+ completed

  // Determine current active Character Pose based on user journey rules:
  // Step 1: Not attended -> Pose 1 (Standby)
  // Step 2: Attended but no quiz -> Pose 2 (Combat Ready)
  // Step 3: Triggered quiz -> Pose 3 (Power Surge - transient)
  // Step 4: Quiz completed -> Pose 4 (Tactical Overdrive)
  // Step 5: Event >= 70% completed -> Pose 5 (Apex Victory)
  let activePose: EventJourneyPose = 1;
  if (animatingPose) {
    activePose = animatingPose;
  } else if (isEventMastered) {
    activePose = 5; // Pose 5: Apex Victory
  } else if (matchedQuiz?.is_completed) {
    activePose = 4; // Pose 4: Tactical Overdrive
  } else if (hasAttended) {
    activePose = 2; // Pose 2: Combat Ready
  } else {
    activePose = 1; // Pose 1: Standby
  }

  const activePoseImage = getEventPoseImage(currentStage, activePose);
  const activePoseMeta = EVENT_POSE_META[activePose];

  // Action: Handle "I Participated"
  const handleParticipate = async () => {
    if (!currentSession || hasAttended || claimingAttendance) return;
    setClaimingAttendance(true);

    try {
      const result = await eventService.declareParticipation(currentSession.id);
      
      // 1. Confetti Burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#38bdf8', '#10b981', '#a855f7'],
      });

      // 2. Animate Character to Pose 2 (Combat Ready) in center with celebration
      setAnimatingPose(2);
      setCelebrationMessage(`+${result.xp_awarded} XP Awarded! Attendance Confirmed for "${currentSession.title}"`);

      // Refresh data
      await loadData();
      await refreshUser();

      // Check level-up
      if (result.has_evolved) {
        const stageSlug = result.character_stage.toLowerCase().replace(/the\s+/g, '').replace(/\s+/g, '-') as CharacterStage;
        triggerLevelUp(stageSlug, user?.character_stage, result.new_total_xp);
      }

      // Smoothly return from animation override after 2.5s
      setTimeout(() => {
        setAnimatingPose(null);
        setCelebrationMessage(null);
      }, 2500);

    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to record attendance');
    } finally {
      setClaimingAttendance(false);
    }
  };

  // Action: Handle "Start Quiz Challenge" with Power Surge animation
  const handleStartQuiz = () => {
    if (!matchedQuiz) return;

    // Trigger full energetic Power Surge (Pose 3)
    setIsPowerSurging(true);
    setAnimatingPose(3);

    confetti({
      particleCount: 60,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#00f0ff', '#ec4899'],
    });

    // Wait 1.3 seconds for the dramatic power surge animation, then navigate
    setTimeout(() => {
      navigate(`/quizzes?quizId=${matchedQuiz.id}`);
    }, 1300);
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500 selection:text-black">
      <Navbar />

      {/* POWER SURGE TRANSITION MODAL OVERLAY */}
      {isPowerSurging && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-radial-glow opacity-70 pointer-events-none" />
          
          <div className="relative text-center max-w-lg mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs uppercase tracking-widest animate-pulse">
              <Zap className="w-4 h-4 text-purple-400" /> Power Surge Activated
            </div>

            <div className="w-56 h-72 md:w-64 md:h-80 mx-auto rounded-2xl overflow-hidden border-2 border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.6)] relative p-2 bg-slate-900/90 animate-bounce-slow">
              <img
                src={getEventPoseImage(currentStage, 3)}
                alt="Power Surge"
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black cyber-gradient-text uppercase tracking-wider">
                Deploying to Quiz Arena...
              </h2>
              <p className="text-xs font-mono text-slate-400">
                10 MCQs • 70 XP Available • Pass Mark 40% (4/10)
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin" /> Initializing Challenge Interface...
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Top Header Card */}
        <div className="cyber-card p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Operative Journey
              </div>
              <h1 className="text-xl md:text-3xl font-black text-white">
                Operative <span className="cyber-gradient-text">{user.full_name}</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Role: {user.character_stage} • {user.student_id ? `ID: ${user.student_id}` : 'University Participant'}
              </p>
            </div>

            {/* Overall XP & Certificate Summary Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-4 py-2 rounded-xl bg-cyber-dark/90 border border-cyber-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Total XP</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{user.total_xp} / 500</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-cyber-dark/90 border border-cyber-border text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Certificate</span>
                <span className={`text-xs font-mono font-bold flex items-center justify-center gap-1 mt-0.5 ${
                  user.is_certificate_eligible ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {user.is_certificate_eligible ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> {user.total_xp} / 350 XP
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Stage Operative Evolution Bar */}
        <div className="cyber-card p-4 md:p-5 border-cyan-500/30">
          <CharacterEvolutionTrack
            currentStage={currentStage}
            totalXp={user.total_xp}
          />
        </div>

        {/* EVENT SELECTOR TABS (5 Sessions) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-bold">
              <Award className="w-3.5 h-3.5 text-cyan-400" /> Select Career Event (5 Official Sessions):
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {sessions.map((sess, idx) => {
              const isSelected = sess.id === currentSession?.id;
              const isDone = isSessionCompleted(sess.id);
              const isUnlocked = isSessionUnlocked(idx);

              return (
                <button
                  key={sess.id}
                  onClick={() => {
                    if (!isUnlocked) {
                      alert(`🔒 Event 0${idx + 1} is locked! Complete Event 0${idx} first (70%+ XP) to unlock ${sess.title.split('-')[0].trim()}.`);
                      return;
                    }
                    setSelectedSessionId(sess.id);
                    setAnimatingPose(null);
                    setCelebrationMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    !isUnlocked
                      ? 'bg-cyber-dark/30 border-cyber-border/40 text-slate-600 opacity-60'
                      : isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan text-white'
                      : 'bg-cyber-dark/60 border-cyber-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                      Event 0{idx + 1}
                    </span>
                    {!isUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-500" />
                    ) : isDone ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                    ) : sess.has_participated ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <div className="text-xs font-bold truncate">{sess.title.split('-')[0].trim()}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {!isUnlocked ? 'Locked' : isDone ? '70%+ Complete' : sess.has_participated ? 'Attended (30 XP)' : 'Unlocked'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CINEMATIC CENTERPIECE: 5-POSE INTERACTIVE CHARACTER JOURNEY */}
        {loading ? (
          <div className="cyber-card p-16 flex flex-col items-center justify-center text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Synchronizing Event Journey...
            </span>
          </div>
        ) : currentSession ? (
          <div className="cyber-card p-6 md:p-10 relative overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(0,240,255,0.15)]">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Event Header Banner */}
            <div className="text-center max-w-2xl mx-auto mb-8 relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
                {currentSession.session_type} Session • {currentSession.session_date}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {currentSession.title}
              </h2>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {currentSession.description || 'Participate in this official technical career session to earn 30% attendance XP and conquer the 70% technical quiz.'}
              </p>
            </div>

            {/* CELEBRATION NOTIFICATION BANNER */}
            {celebrationMessage && (
              <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2 shadow-glow-emerald animate-in slide-in-from-top-4 duration-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{celebrationMessage}</span>
              </div>
            )}

            {/* THE CHARACTER DISPLAY CENTERPIECE */}
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              {/* Character Stage Badge & Pose Indicator */}
              <div className="mb-3 space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-glow-cyan inline-block">
                  {stageMeta.title}
                </span>
                <div className="text-[11px] font-mono text-purple-400 font-bold tracking-wide">
                  [{activePoseMeta.badge}] • {activePoseMeta.title}
                </div>
              </div>

              {/* High-Resolution Character Portrait Frame */}
              <div className="relative group my-2">
                <div className={`w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden border-2 transition-all duration-500 relative p-3 bg-cyber-darkest/90 flex items-center justify-center ${
                  activePose === 5
                    ? 'border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                    : activePose === 4
                    ? 'border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.4)]'
                    : activePose === 2
                    ? 'border-cyan-400 shadow-glow-cyan'
                    : 'border-cyber-border shadow-md'
                }`}>
                  <img
                    src={activePoseImage}
                    alt={stageMeta.title}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform duration-500 hover:scale-105"
                  />

                  {/* Corner Visual Tech Accents */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
                </div>
              </div>

              {/* Subtitle / Status Description */}
              <p className="text-xs font-mono text-slate-400 mt-2 max-w-md">
                {activePoseMeta.subtitle}
              </p>

              {/* PROGRESSION ACTIONS CONTAINER */}
              <div className="w-full max-w-xl mt-6 pt-6 border-t border-cyber-border space-y-4">
                {/* Event Completion Metric Pill */}
                <div className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded-lg bg-cyber-dark/80 border border-cyber-border">
                  <span className="text-slate-400">Event XP Progress:</span>
                  <span className="font-bold text-cyan-400">
                    {totalEventXp} / 100 XP ({totalEventXp}%)
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isEventMastered ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isEventMastered ? '70%+ Passed' : 'In Progress'}
                  </span>
                </div>

                {/* DYNAMIC ACTION BUTTONS PER STEP */}
                {/* 1. If NOT Participated yet: Prominent "I Participated" Button */}
                {!hasAttended ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleParticipate}
                      disabled={claimingAttendance}
                      className="w-full cyber-btn-primary py-4 text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-cyan hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                      {claimingAttendance ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Recording Participation...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-slate-950" />
                          Step 1: I Participated (+30 XP Attendance)
                        </>
                      )}
                    </button>
                    <p className="text-[11px] font-mono text-slate-500">
                      *Click during the session to unlock your Combat Ready stance and activate the Quiz Arena.
                    </p>
                  </div>
                ) : (
                  /* 2. Participated: Show Attendance Claimed Badge & Next Quiz Step */
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Step 1 Complete: Attendance Claimed (+30 XP)</span>
                      </div>
                      <span className="font-bold text-emerald-400">30 / 30 XP</span>
                    </div>

                    {/* Step 2: Quiz Arena Trigger */}
                    {matchedQuiz && (
                      <div className="p-4 rounded-xl bg-cyber-dark/90 border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold uppercase text-purple-400 flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Step 2: Knowledge Challenge Arena
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                              {matchedQuiz.total_questions} MCQs • 70 XP Available • Pass Mark 40%
                            </span>
                          </div>
                          {matchedQuiz.is_completed && (
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              Earned: +{matchedQuiz.xp_earned} XP
                            </span>
                          )}
                        </div>

                        {/* Quiz Action Buttons */}
                        {!matchedQuiz.is_completed ? (
                          <button
                            onClick={handleStartQuiz}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] transition-transform cursor-pointer"
                          >
                            <Zap className="w-4 h-4" /> Start Quiz Challenge (Power Surge) <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="space-y-2">
                            {matchedQuiz.xp_earned >= matchedQuiz.xp_reward ? (
                              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs text-center flex items-center justify-center gap-2 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                100% Max Score Achieved! (+70 XP Awarded)
                              </div>
                            ) : null}
                            <button
                              onClick={handleStartQuiz}
                              className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-4 h-4 text-amber-400" />
                              {matchedQuiz.xp_earned >= matchedQuiz.xp_reward
                                ? 'Retake Challenge to Practice & Perfect'
                                : `Retake to Boost XP (+${matchedQuiz.xp_reward - matchedQuiz.xp_earned} XP remaining)`}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Event Mastery Celebration Box */}
                    {isEventMastered && (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs text-center space-y-1">
                        <div className="flex items-center justify-center gap-2 font-bold text-amber-400">
                          <Award className="w-4 h-4" /> EVENT 70%+ MASTERY UNLOCKED
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">
                          You have achieved {totalEventXp} XP for this session! Apex Victory Pose has been activated.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;