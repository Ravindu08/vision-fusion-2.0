import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
  X,
  Compass,
  Calendar,
  HelpCircle,
  Trophy,
  Award,
  Shield,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/', icon: Compass, public: true },
    { label: 'Dashboard', path: '/dashboard', icon: Zap, public: false },
    { label: 'Events & Schedule', path: '/events', icon: Calendar, public: true },
    { label: 'Quizzes', path: '/quizzes', icon: HelpCircle, public: false },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy, public: true },
    { label: 'Certificate', path: '/certificate', icon: Award, public: false },
  ];

  const filteredLinks = navLinks.filter(
    (link) => link.public || isAuthenticated
  );

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b border-cyber-border bg-cyber-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-slate-950 font-mono shadow-glow-cyan group-hover:scale-105 transition-transform">
            VF2
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base md:text-lg tracking-wider cyber-gradient-text uppercase font-display leading-tight">
              Vision Fusion 2.0
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
              IEEE IAS & WIE • Uva Wellassa University
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/admin')
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                  : 'text-purple-400 hover:bg-purple-500/10 border border-purple-500/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-cyber-border">
              {/* XP and Stage Badge */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  {user.total_xp} XP
                </div>
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {user.character_stage}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-cyber-card border border-cyber-border hover:border-red-500/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="cyber-btn-secondary px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </Link>
              <Link
                to="/register"
                className="cyber-btn-primary px-3.5 py-1.5 text-xs font-mono flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && user && (
            <div className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> {user.total_xp}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-cyber-card border border-cyber-border text-slate-300 hover:text-cyan-400"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyber-border bg-cyber-darkest px-4 py-4 space-y-2">
          {isAuthenticated && user && (
            <div className="p-3 mb-3 rounded-lg bg-cyber-card border border-cyber-border flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{user.full_name}</div>
                <div className="text-xs text-cyan-400 font-mono">
                  {user.character_stage} • {user.total_xp} XP
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}

          {filteredLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2.5 transition-all ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-3 py-2.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2.5 text-purple-400 bg-purple-500/10 border border-purple-500/20"
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-3 grid grid-cols-2 gap-2 border-t border-cyber-border/80">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="cyber-btn-secondary text-center text-xs py-2 font-mono flex items-center justify-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="cyber-btn-primary text-center text-xs py-2 font-mono flex items-center justify-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

