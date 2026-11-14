import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CharacterDisplay } from '../components/character/CharacterDisplay';
import { eventService } from '../services/eventService';
import type { EventSession } from '../types/event';
import {
  type CharacterStage,
  type CharacterPose,
  STAGES_METADATA,
} from '../config/characterAssets';
import {
  Sparkles,
  Zap,
  Award,
  ArrowRight,
  Calendar,
  Terminal,
  BookOpen
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<CharacterStage>('recruit');
  const [currentPose, setCurrentPose] = useState<CharacterPose>('idle');
  const [sessions, setSessions] = useState<EventSession[]>([]);

  const stages: CharacterStage[] = [
    'recruit',
    'builder',
    'pathfinder',
    'intelligence-operative',
    'vanguard',
  ];

  const poses: CharacterPose[] = [
    'idle',
    'active',
    'celebrating',
    'quizzing',
    'focused',
  ];

  useEffect(() => {
    eventService.getSessions().then(setSessions).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full space-y-16 py-8">
        {/* 1. Hero Section */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="cyber-card p-8 md:p-14 text-center relative overflow-hidden group border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_0_40px_rgba(0,240,255,0.12)] transition-all duration-500">
            {/* Background Image Layer - Crisp & Vibrant */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 group-hover:opacity-95 transition-all duration-700 pointer-events-none scale-100 group-hover:scale-[1.02]"
              style={{
                backgroundImage: "url('/assets/backgrounds/hero_bg.jpg'), url('/assets/backgrounds/hero_bg.png')",
              }}
            />

            {/* Subtle Gradient & Tint to preserve artwork while boosting text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/55 to-slate-950/85 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-slate-950/30 to-slate-950/70 pointer-events-none" />

            {/* Cyan / Purple Neon Ambient Highlights */}
            <div className="absolute top-0 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Hero Text Content */}
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> IEEE IAS & WIE UWU • Tech Career Week 2026
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 max-w-4xl mx-auto leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                Gamified Technology <br />
                <span className="cyber-gradient-text drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
                  Career Journey
                </span>
              </h1>

              <p className="max-w-2xl mx-auto text-slate-100 text-sm sm:text-base md:text-lg mb-8 leading-relaxed font-sans font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Experience Vision Fusion 2.0. Attend career sessions, conquer technical quizzes, evolve your personal operative character through 5 stages, and unlock your official IEEE digital certificate.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-200 mb-8">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-md">
                  <Calendar className="w-4 h-4 text-cyan-400" /> 5 IT Career Sessions
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-md">
                  <Zap className="w-4 h-4 text-amber-400" /> 30% Attendance / 70% Quizzes
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 backdrop-blur-md shadow-md">
                  <Award className="w-4 h-4 text-emerald-400" /> Official IEEE Certificate (&ge;70% XP / 350+ XP)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto cyber-btn-primary px-8 py-3.5 text-sm font-mono uppercase font-bold flex items-center justify-center gap-2 shadow-glow-cyan hover:scale-105 transition-transform"
                >
                  Enroll as The Recruit <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/events"
                  className="w-full sm:w-auto cyber-btn-secondary px-8 py-3.5 text-sm font-mono uppercase flex items-center justify-center gap-2 backdrop-blur-md bg-slate-950/60 hover:bg-slate-900/80 transition-all hover:scale-105"
                >
                  <Calendar className="w-4 h-4 text-cyan-400" /> Explore Sessions
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Gamification Mechanics Section */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              The Progression Engine
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
              How You Earn XP & Unlock Your Certificate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="cyber-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono uppercase text-cyan-400 font-bold mb-1">
                  30% of Total XP
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Event Self-Participation
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  No attendance codes, paper sheets, or manual admin marks. Simply click "I Participated" during active physical and online sessions to claim attendance XP automatically.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cyber-border text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Allocation: 150 XP (30 XP &times; 5)</span>
                <span className="text-cyan-400 font-bold">5 Sessions</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="cyber-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono uppercase text-purple-400 font-bold mb-1">
                  70% of Total XP
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Quizzes & Tech Challenges
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Complete 10-question technical quizzes for each event (70 XP per quiz, pass at 40%). Try again anytime to maximize your score and climb the leaderboard!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cyber-border text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Allocation: 350 XP (70 XP &times; 5)</span>
                <span className="text-purple-400 font-bold">Retakes Allowed</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="cyber-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-1">
                  &ge;70% Threshold
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">
                  Verified Digital Certificate
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Accumulate at least 70% of total event XP (350+ XP out of 500 XP). The system automatically unlocks your cryptographic IEEE-branded certificate for instant download.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cyber-border text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Threshold: 350 XP (70%)</span>
                <span className="text-emerald-400 font-bold">Instant Issuance</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Character Evolution Interactive Showcase */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400">
              Visual Gamification System
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
              5 Character Stages • 25 Official Poses
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-mono mt-1">
              Your avatar evolves automatically as you accumulate XP throughout Tech Career Week.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 cyber-card p-6">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Select Stage to Inspect
              </h3>

              <div className="space-y-2 mb-6">
                {stages.map((st) => {
                  const meta = STAGES_METADATA[st];
                  const active = currentStage === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setCurrentStage(st)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-glow-cyan'
                          : 'bg-cyber-dark/60 border-cyber-border text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">{meta.title}</div>
                        <div className="text-xs font-mono text-slate-500">
                          {meta.minPercent}% - {meta.maxPercent}% Total XP ({meta.minPercent * 10} - {meta.maxPercent * 10} XP)
                        </div>
                      </div>
                      {active && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Pose Variation
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {poses.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPose(p)}
                    className={`px-2 py-1.5 rounded text-xs font-mono capitalize transition-all border cursor-pointer ${
                      currentPose === p
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                        : 'bg-cyber-dark border-cyber-border text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 cyber-card p-8 flex flex-col items-center justify-center min-h-[460px]">
              <CharacterDisplay
                stage={currentStage}
                pose={currentPose}
                size="xl"
                showBadge={true}
                glow={true}
              />
            </div>
          </div>
        </section>

        {/* 4. Event Sessions Spotlight */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                Live Agenda
              </span>
              <h2 className="text-2xl font-extrabold text-slate-100 mt-0.5">
                Spotlight Sessions
              </h2>
            </div>
            <Link
              to="/events"
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              Full Schedule &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="cyber-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        session.session_type === 'PHYSICAL'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {session.session_type}
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      +{session.xp_reward} XP
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-2 line-clamp-2">
                    {session.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans line-clamp-3 mb-4">
                    {session.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-cyber-border text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>{session.session_date}</span>
                  <span>{session.start_time.slice(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Organizing Bodies Showcase */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="cyber-card p-8 border-cyber-border/80 text-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-6">
              Organized with Pride By
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold">
                  IAS
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 text-sm">IEEE IAS UWU</div>
                  <div className="text-xs text-slate-400 font-mono">Industry Applications Society</div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-cyber-border" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold">
                  WIE
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-100 text-sm">IEEE WIE UWU</div>
                  <div className="text-xs text-slate-400 font-mono">Women in Engineering Affinity Group</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;

