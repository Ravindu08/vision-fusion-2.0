import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';
import {
  leaderboardService,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from '../services/leaderboardService';
import {
  CHARACTER_ASSET_PATHS,
  STAGES_METADATA,
  type CharacterStage,
} from '../config/characterAssets';
import {
  Trophy,
  Crown,
  Medal,
  Search,
  RefreshCw,
  Award,
  Users,
  Zap,
  Sparkles,
  Calendar,
  HelpCircle,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

const STAGE_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Tiers' },
  { value: 'vanguard', label: 'Vanguard' },
  { value: 'intelligence-operative', label: 'Intel Operative' },
  { value: 'pathfinder', label: 'Pathfinder' },
  { value: 'builder', label: 'Builder' },
  { value: 'recruit', label: 'Recruit' },
];

export const LeaderboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  const fetchLeaderboard = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await leaderboardService.getLeaderboard({
          limit: 100,
          search: searchTerm.trim() || undefined,
          stage: stageFilter !== 'all' ? stageFilter : undefined,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setError('Unable to load leaderboard data right now. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchTerm, stageFilter]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaderboard(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchLeaderboard]);

  const getStageMeta = (slug: CharacterStage) => {
    return STAGES_METADATA[slug] || STAGES_METADATA.recruit;
  };

  const getAvatarSrc = (slug: CharacterStage, rank: number) => {
    const stagePaths = CHARACTER_ASSET_PATHS[slug] || CHARACTER_ASSET_PATHS.recruit;
    if (rank === 1) return stagePaths.celebrating;
    if (rank <= 3) return stagePaths.active;
    return stagePaths.idle;
  };

  const showPodium =
    !searchTerm.trim() &&
    stageFilter === 'all' &&
    data &&
    data.entries.length > 0;

  const topThree = showPodium ? data.entries.slice(0, 3) : [];
  // Desktop podium visual order: [2nd, 1st, 3rd]
  const podiumOrder: LeaderboardEntry[] =
    topThree.length === 3
      ? [topThree[1], topThree[0], topThree[2]]
      : topThree;

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <Crown className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/50 flex items-center justify-center text-purple-300">
          <Medal className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
        #{rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Hero Header */}
        <div className="cyber-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5" /> Vision Fusion 2.0 Standings
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Live Operative <span className="cyber-gradient-text">Leaderboard</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
                Track student progression across UWU Tech Career Week. Earn XP through event attendance (30%) and technical quizzes (70%) to evolve into The Vanguard.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Active Operatives</div>
                  <div className="text-base font-bold font-mono text-slate-100">
                    {data ? data.total_participants : '--'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchLeaderboard(true)}
                disabled={refreshing}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Current User Standing OR Sign-In CTA */}
        {isAuthenticated && data?.current_user_entry ? (
          <div className="cyber-card p-5 border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-slate-900/90 to-purple-500/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getAvatarSrc(data.current_user_entry.stage_slug, data.current_user_entry.rank)}
                    alt={data.current_user_entry.character_stage}
                    className="w-14 h-14 rounded-xl object-cover border border-cyan-400/50 bg-slate-950"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono font-extrabold text-[10px]">
                    #{data.current_user_entry.rank}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Your Current Standing
                  </div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    {data.current_user_entry.full_name}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase border rounded-full ${
                        getStageMeta(data.current_user_entry.stage_slug).badgeClass
                      }`}
                    >
                      {data.current_user_entry.character_stage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {data.current_user_entry.sessions_attended} Sessions • {data.current_user_entry.quizzes_completed} Quizzes •{' '}
                    {data.current_user_entry.certificate_unlocked
                      ? 'Certificate Unlocked'
                      : `${Math.max(0, data.certificate_threshold_xp - data.current_user_entry.total_xp)} XP to Certificate`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <div className="text-2xl font-extrabold font-mono text-cyan-400">
                    {data.current_user_entry.total_xp} XP
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {data.current_user_entry.overall_percent}% of {data.total_possible_xp} XP
                  </div>
                </div>
                <Link
                  to="/quizzes"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Earn XP <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="cyber-card p-5 border-purple-500/30 bg-purple-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100">Join the Vision Fusion 2.0 Arena</h2>
                <p className="text-xs text-slate-400">
                  Register or log in to unlock your operative character, earn XP, and claim your IEEE Digital Certificate.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-colors"
              >
                Register Now
              </Link>
            </div>
          </div>
        ) : user?.role === 'ADMIN' ? (
          <div className="cyber-card p-4 border-purple-500/30 bg-purple-500/5 text-xs font-mono text-purple-300">
            Viewing as Administrator — Admin accounts are excluded from student rankings.
          </div>
        ) : null}

        {/* Top 3 Podium */}
        {!loading && showPodium && (
          <section aria-label="Top 3 Operatives Podium">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {podiumOrder.map((entry) => {
                const meta = getStageMeta(entry.stage_slug);
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const borderGlow = isFirst
                  ? 'border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.18)] md:order-2'
                  : isSecond
                  ? 'border-cyan-400/40 md:order-1'
                  : 'border-purple-400/40 md:order-3';
                const accentText = isFirst
                  ? 'text-amber-400'
                  : isSecond
                  ? 'text-cyan-300'
                  : 'text-purple-300';

                return (
                  <div
                    key={entry.user_id}
                    className={`cyber-card p-5 flex flex-col items-center text-center relative overflow-hidden transition-transform hover:-translate-y-1 ${borderGlow} ${
                      isFirst ? 'md:py-7' : ''
                    } ${entry.is_current_user ? 'ring-2 ring-cyan-400/60' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {renderRankBadge(entry.rank)}
                      <span className={`font-mono font-extrabold text-sm uppercase tracking-wider ${accentText}`}>
                        {entry.rank === 1 ? 'Rank #1 • Leader' : `Rank #${entry.rank}`}
                      </span>
                    </div>

                    <div className="relative mb-3">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-25 pointer-events-none"
                        style={{ backgroundColor: meta.color }}
                      />
                      <img
                        src={getAvatarSrc(entry.stage_slug, entry.rank)}
                        alt={`${entry.full_name} - ${entry.character_stage}`}
                        className={`relative rounded-2xl object-cover border border-slate-700/80 bg-slate-950 ${
                          isFirst ? 'w-32 h-40' : 'w-24 h-32'
                        }`}
                      />
                    </div>

                    <h3 className="text-base font-bold text-white truncate max-w-full">
                      {entry.full_name}
                      {entry.is_current_user && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded">
                          YOU
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate max-w-full mb-2">
                      {entry.university}
                    </p>

                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase border rounded-full mb-3 ${meta.badgeClass}`}
                    >
                      {entry.character_stage}
                    </span>

                    <div className={`text-2xl font-extrabold font-mono ${accentText}`}>
                      {entry.total_xp} <span className="text-xs font-normal text-slate-400">XP</span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>{entry.sessions_attended} Sessions</span>
                      <span>•</span>
                      <span>{entry.quizzes_completed} Quizzes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Search & Stage Filters */}
        <div className="cyber-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search operative name or university..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStageFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  stageFilter === f.value
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings Table */}
        <div className="cyber-card overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="text-xs font-mono">Loading Operative Standings...</span>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => fetchLeaderboard(true)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !data || data.entries.length === 0 ? (
            <div className="p-14 text-center space-y-2">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No operatives match your filter</p>
              <p className="text-xs text-slate-500">Try clearing your search or selecting "All Tiers".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-cyber-border bg-slate-900/60 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3.5 px-4">Rank</th>
                    <th className="py-3.5 px-4">Operative</th>
                    <th className="py-3.5 px-4">Stage Tier</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Activity</th>
                    <th className="py-3.5 px-4 text-right">XP & Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.entries.map((entry) => {
                    const meta = getStageMeta(entry.stage_slug);
                    return (
                      <tr
                        key={entry.user_id}
                        className={`transition-colors ${
                          entry.is_current_user
                            ? 'bg-cyan-500/10 hover:bg-cyan-500/15'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {renderRankBadge(entry.rank)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarSrc(entry.stage_slug, entry.rank)}
                              alt={entry.character_stage}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-100 flex items-center gap-2 truncate">
                                <span className="truncate">{entry.full_name}</span>
                                {entry.is_current_user && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500 text-slate-950 font-bold rounded shrink-0">
                                    YOU
                                  </span>
                                )}
                                {entry.certificate_unlocked && (
                                  <span
                                    title="IEEE Certificate Eligible (350+ XP)"
                                    className="text-emerald-400 shrink-0"
                                  >
                                    <Award className="w-4 h-4" />
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {entry.university}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border rounded-full ${meta.badgeClass}`}
                          >
                            {entry.character_stage}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-1" title="Sessions Attended">
                              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                              {entry.sessions_attended}
                            </span>
                            <span className="flex items-center gap-1" title="Quizzes Completed">
                              <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                              {entry.quizzes_completed}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex flex-col items-end min-w-[110px]">
                            <div className="text-sm font-extrabold font-mono text-cyan-400">
                              {entry.total_xp} XP
                            </div>
                            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, entry.overall_percent)}%`,
                                  backgroundColor: meta.color,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

