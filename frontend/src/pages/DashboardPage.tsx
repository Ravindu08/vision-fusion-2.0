import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CharacterDisplay } from '../components/character/CharacterDisplay';
import { CharacterEvolutionTrack } from '../components/character/CharacterEvolutionTrack';
import { eventService } from '../services/eventService';
import {
  type CharacterStage,
  type CharacterPose,
  STAGES_METADATA,
} from '../config/characterAssets';
import type { EventSession } from '../types/event';
import {
  Award,
  Calendar,
  HelpCircle,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, triggerLevelUp } = useAuth();
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Character preview & pose controls
  const [selectedPose, setSelectedPose] = useState<CharacterPose>('idle');
  const [previewStage, setPreviewStage] = useState<CharacterStage | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await eventService.getSessions();
        setSessions(data);
      } catch (err) {
        console.error('Failed loading sessions for dashboard', err);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, []);

  // Set default dynamic pose based on current stage progress
  useEffect(() => {
    if (user) {
      const p = user.stage_progress_percent;
      if (p >= 75) setSelectedPose('quizzing');
      else if (p >= 50) setSelectedPose('focused');
      else if (p >= 25) setSelectedPose('active');
      else setSelectedPose('idle');
    }
  }, [user?.stage_progress_percent]);

  if (!user) return null;

  const currentDisplayStage: CharacterStage = previewStage || user.stage_slug;
  const attendedCount = sessions.filter((s) => s.has_participated).length;
  const totalSessions = sessions.length || 5;

  const availablePoses: { key: CharacterPose; label: string }[] = [
    { key: 'idle', label: 'Standby' },
    { key: 'active', label: 'Combat Ready' },
    { key: 'focused', label: 'Power Surge' },
    { key: 'quizzing', label: 'Tactical Overdrive' },
    { key: 'celebrating', label: 'Apex Victory' },
  ];

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Hero Banner */}
        <div className="cyber-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Operative Progression Hub
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Operative <span className="cyber-gradient-text">{user.full_name}</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
                Student ID: {user.student_id || 'NOT_ASSIGNED'} • Affiliation: {user.university}
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3.5 rounded-xl bg-cyber-dark/80 border border-cyber-border text-center min-w-[120px]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Total XP</div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
                  {user.total_xp}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">500 Max Budget</div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-dark/80 border border-cyber-border text-center min-w-[120px]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Power Tier</div>
                <div className="text-base font-black text-purple-400 font-mono mt-1">
                  Tier {['recruit', 'builder', 'pathfinder', 'intelligence-operative', 'vanguard'].indexOf(user.stage_slug) + 1} / 5
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{user.character_stage}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyber-dark/80 border border-cyber-border text-center min-w-[120px]">
                <div className="text-[10px] font-mono uppercase text-slate-400">Certificate</div>
                <div
                  className={`text-sm font-bold font-mono mt-1.5 flex items-center justify-center gap-1 ${
                    user.is_certificate_eligible ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {user.is_certificate_eligible ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Eligible
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> {user.overall_percent}% / 70%
                    </>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {user.is_certificate_eligible ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-STAGE VISUAL EVOLUTION TRACK */}
        <div className="cyber-card p-6 border-cyan-500/30">
          <CharacterEvolutionTrack
            currentStage={user.stage_slug}
            totalXp={user.total_xp}
            onSelectPreviewStage={(st) => setPreviewStage(st)}
          />
        </div>

        {/* Character Evolution & Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Operative Avatar Card */}
          <div className="lg:col-span-5 cyber-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block text-left">
                  Active Operative Avatar
                </span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold">
                  {STAGES_METADATA[currentDisplayStage].title}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold uppercase shadow-glow-cyan">
                XP: {user.total_xp}
              </span>
            </div>

            {/* Character Visual */}
            <div className="relative py-2">
              <CharacterDisplay
                stage={currentDisplayStage}
                pose={selectedPose}
                size="lg"
                showBadge={true}
                glow={true}
              />
            </div>

            {/* In-Stage Pose & Power Tier Controls */}
            <div className="w-full mt-4 pt-4 border-t border-cyber-border text-left">
              <span className="block text-[11px] font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" /> Stance & Energy Tier:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {availablePoses.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPose(p.key)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono transition-all border cursor-pointer ${
                      selectedPose === p.key
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-glow-cyan font-bold'
                        : 'bg-cyber-dark border-cyber-border text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress to next stage */}
            <div className="w-full mt-4 pt-4 border-t border-cyber-border/80 text-left space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Next Evolution</span>
                <span className="text-cyan-400 font-bold">{user.next_stage_title}</span>
              </div>
              <div className="w-full bg-cyber-dark h-3 rounded-full overflow-hidden border border-cyber-border">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-600 transition-all duration-500 shadow-glow-cyan"
                  style={{ width: `${Math.max(8, user.stage_progress_percent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span>Stage Progress: {user.stage_progress_percent}%</span>
                <span>{user.xp_to_next_stage} XP to evolve</span>
              </div>
            </div>

            {/* Preview Level-Up Celebration Button */}
            <button
              onClick={() => triggerLevelUp('builder', 'The Recruit', 250)}
              className="w-full mt-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Preview Evolution Animation
            </button>
          </div>

          {/* Action Center & Modules */}
          <div className="lg:col-span-7 space-y-6">
            {/* Certificate Status Banner */}
            <div
              className={`p-4 md:p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                user.is_certificate_eligible
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-cyber-card border-cyber-border text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    user.is_certificate_eligible
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm md:text-base flex items-center gap-2">
                    Digital Certificate Eligibility
                    {user.is_certificate_eligible ? (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-400 rounded-full">
                        {Math.max(0, 350 - user.total_xp)} XP Remaining
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Accumulate &ge;70% of total event XP (350+ XP) to unlock the official IEEE PDF certificate.
                  </p>
                </div>
              </div>

              <Link
                to="/certificate"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyber-dark border border-cyber-border hover:border-cyan-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                Certificate Portal <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* XP Distribution Breakdown */}
            <div className="cyber-card p-6">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                XP Journey Allocation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">Event Participation</span>
                      <span className="text-xs font-mono font-bold text-cyan-400">30% (300 XP)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mb-3">
                      Attend sessions & click "I Participated" to claim attendance XP.
                    </p>
                  </div>
                  <Link
                    to="/events"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    View Sessions ({attendedCount}/{totalSessions}) <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-cyber-dark/80 border border-cyber-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">Quizzes & Challenges</span>
                      <span className="text-xs font-mono font-bold text-purple-400">70% (700 XP)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mb-3">
                      Complete knowledge challenges across cloud, AI, and cybersecurity.
                    </p>
                  </div>
                  <Link
                    to="/quizzes"
                    className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                  >
                    Take Available Quizzes <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Spotlight Sessions */}
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Event Sessions Spotlight
                </h2>
                <Link to="/events" className="text-xs font-mono text-cyan-400 hover:underline">
                  All Sessions &rarr;
                </Link>
              </div>

              {loadingSessions ? (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  Loading sessions...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-lg bg-cyber-dark/60 border border-cyber-border flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              session.session_type === 'PHYSICAL'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-cyan-500/10 text-cyan-400'
                            }`}
                          >
                            {session.session_type}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {session.session_date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 truncate">
                          {session.title}
                        </h4>
                      </div>

                      <div className="shrink-0 text-right">
                        {session.has_participated ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Claimed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-mono font-bold">
                            +{session.xp_reward} XP
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links Hub */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                to="/leaderboard"
                className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyan-400/50 hover:bg-slate-800/60 transition-all flex flex-col items-center text-center group"
              >
                <Trophy className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Leaderboard</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Global Rankings</span>
              </Link>

              <Link
                to="/quizzes"
                className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-purple-400/50 hover:bg-slate-800/60 transition-all flex flex-col items-center text-center group"
              >
                <HelpCircle className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Quizzes</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">350 XP Arena</span>
              </Link>

              <Link
                to="/certificate"
                className="p-4 rounded-xl bg-cyber-card border border-cyber-border hover:border-emerald-400/50 hover:bg-slate-800/60 transition-all flex flex-col items-center text-center group col-span-2 sm:col-span-1"
              >
                <Award className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Certificate</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">&ge;70% Threshold (350+ XP)</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
