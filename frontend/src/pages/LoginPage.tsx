import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      let msg = 'Authentication failed. Please verify your credentials.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          msg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          msg = err.response.data.detail.map((d: any) => d.msg).join(', ');
        }
      } else if (err.message === 'Network Error' || !err.response) {
        msg = 'Backend server is not running or connection was refused.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-cyber-darkest text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-slate-950 font-mono text-xl shadow-glow-cyan group-hover:scale-105 transition-transform">
              VF2
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-wider cyber-gradient-text uppercase font-display block">
                Vision Fusion 2.0
              </span>
              <span className="text-xs text-slate-400 font-mono block">
                Tech Career Week • IEEE IAS & WIE UWU
              </span>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-100">
            Access Operative Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Log in to manage attendance, quizzes, and character XP
          </p>
        </div>

        {/* Form Card */}
        <div className="cyber-card p-8 border-cyber-border/80">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@uwu.ac.lk"
                  className="w-full bg-cyber-dark/80 border border-cyber-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-cyber-dark/80 border border-cyber-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-btn-primary py-3 flex items-center justify-center gap-2 mt-6 text-sm uppercase tracking-wider font-mono font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Authenticate <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="mt-6 pt-6 border-t border-cyber-border/60">
            <span className="block text-[11px] font-mono uppercase text-slate-400 tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Demo Fill:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@visionfusion.ieee.lk', 'Admin@VF2026!')}
                className="px-2.5 py-1.5 text-left rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-400" /> Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">admin@vision...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('student@uwu.ac.lk', 'StudentPass123!')}
                className="px-2.5 py-1.5 text-left rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
              >
                <div className="font-bold">Student</div>
                <div className="text-[10px] text-slate-400 truncate">student@uwu...</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-xs text-slate-400 mt-6 font-mono">
          Don't have an operative account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

