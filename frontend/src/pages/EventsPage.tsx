import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import { eventService } from '../services/eventService';
import type { EventSession } from '../types/event';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Zap,
  CheckCircle2,
  Filter,
  Loader2,
  Sparkles,
  AlertCircle,
  LogIn,
  Check
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser, triggerLevelUp } = useAuth();
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PHYSICAL' | 'ONLINE'>('ALL');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchSessions = async () => {
    try {
      const data = await eventService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [isAuthenticated]);

  const handleClaimParticipation = async (session: EventSession) => {
    if (!isAuthenticated) return;
    setClaimingId(session.id);
    setNotification(null);

    try {
      const result = await eventService.declareParticipation(session.id);
      
      // Trigger celebration confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#a855f7', '#10b981', '#f59e0b']
      });

      setNotification({
        type: 'success',
        message: `+${result.xp_awarded} XP Awarded! Participation recorded for "${session.title}". Total XP is now ${result.new_total_xp}.`
      });

      // Update session state in local list
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, has_participated: true } : s))
      );

      // Check for level-up evolution trigger
      if (result.has_evolved) {
        const stageSlug = result.character_stage.toLowerCase().replace(/ /g, '-') as any;
        triggerLevelUp(stageSlug, user?.character_stage, result.new_total_xp);
      }

      // Refresh global user state so Navbar XP and Dashboard update immediately
      await refreshUser();
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to claim participation. Please try again.';
      setNotification({
        type: 'error',
        message: errMsg
      });
    } finally {
      setClaimingId(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.session_type === filter;
  });

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Header Banner */}
        <div className="cyber-card p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Event Sessions & Self-Attendance
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
              Vision Fusion 2.0 <span className="cyber-gradient-text">Event Schedule</span>
            </h1>
            <p className="text-slate-400 text-sm font-mono leading-relaxed">
              Explore upcoming sessions. When you participate, click <span className="text-cyan-400 font-bold">"I Participated"</span> on the session card to automatically claim your attendance XP.
            </p>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all animate-pulse-slow ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white ml-4 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Filter:</span>
            <div className="inline-flex rounded-lg bg-cyber-dark p-1 border border-cyber-border">
              {(['ALL', 'PHYSICAL', 'ONLINE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                    filter === type
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Sessions' : type === 'PHYSICAL' ? 'Physical' : 'Online'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing <span className="text-cyan-400 font-bold">{filteredSessions.length}</span> sessions
          </div>
        </div>

        {/* Sessions Listing */}
        {loading ? (
          <div className="cyber-card p-16 flex flex-col items-center justify-center text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400">
              Retrieving Sessions from Database...
            </span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="cyber-card p-12 text-center text-slate-400 font-mono text-sm">
            No sessions match the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="cyber-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
                        session.session_type === 'PHYSICAL'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {session.session_type === 'PHYSICAL' ? 'Physical' : 'Online'}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      +{session.xp_reward} XP
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">
                    {session.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4 font-sans">
                    {session.description || 'No description provided.'}
                  </p>
                </div>

                {/* Logistics Info */}
                <div className="space-y-2 pt-4 border-t border-cyber-border text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{session.session_date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </span>
                  </div>

                  {session.session_type === 'PHYSICAL' ? (
                    <div className="flex items-start gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">{session.venue || 'Main Campus Venue'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {session.meeting_url ? (
                        <a
                          href={session.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1 truncate text-cyan-400 font-bold"
                        >
                          Join Google Meet <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span>Online Meeting Link TBA</span>
                      )}
                    </div>
                  )}

                  {/* Action / Participation Button */}
                  <div className="pt-3">
                    {session.has_participated ? (
                      <div className="w-full py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-glow-emerald">
                        <Check className="w-4 h-4" /> Participation Claimed (+{session.xp_reward} XP)
                      </div>
                    ) : isAuthenticated ? (
                      <button
                        onClick={() => handleClaimParticipation(session)}
                        disabled={claimingId === session.id}
                        className="w-full cyber-btn-primary py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                      >
                        {claimingId === session.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Recording...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> I Participated (+{session.xp_reward} XP)
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="w-full cyber-btn-secondary py-2 text-xs font-mono flex items-center justify-center gap-1.5 text-slate-300 hover:text-cyan-400"
                      >
                        <LogIn className="w-3.5 h-3.5" /> Log in to Claim XP
                      </Link>
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

export default EventsPage;
