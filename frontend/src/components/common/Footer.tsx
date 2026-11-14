import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cyber-border bg-cyber-darkest/95 text-slate-400 text-xs font-mono py-12 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand & Affiliation */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-slate-950 font-mono text-sm shadow-glow-cyan">
              VF2
            </div>
            <span className="font-bold text-slate-100 uppercase tracking-wider font-display text-sm">
              Vision Fusion 2.0 – Tech Career Week
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
            A gamified technology career development platform organized by IEEE IAS Student Branch Chapter and IEEE WIE Student Branch Affinity Group of Uva Wellassa University.
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-cyan-400">
              <Shield className="w-3.5 h-3.5" /> IEEE IAS UWU
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" /> IEEE WIE UWU
            </span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-3">
            Quick Navigation
          </h3>
          <ul className="space-y-2">
            <li><Link to="/events" className="hover:text-cyan-400 transition-colors">Event Sessions</Link></li>
            <li><Link to="/quizzes" className="hover:text-cyan-400 transition-colors">Quizzes & Activities</Link></li>
            <li><Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Live Leaderboard</Link></li>
            <li><Link to="/certificate" className="hover:text-cyan-400 transition-colors">Certificate Portal</Link></li>
          </ul>
        </div>

        {/* Col 3: Gamification Specs */}
        <div>
          <h3 className="font-bold text-slate-200 uppercase tracking-wider mb-3">
            Gamification Rules
          </h3>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>• 30% XP via Event Participation</li>
            <li>• 70% XP via Quizzes & Challenges</li>
            <li>• 5 Character Stages (25 Official Poses)</li>
            <li>• &ge;70% Overall XP for Certificate (350+ XP)</li>
            <li>• Zero manual admin attendance</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-cyber-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <div>
          © 2026 Vision Fusion 2.0. Organized with pride by IEEE IAS & IEEE WIE UWU.
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PostgreSQL Engine Active
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

