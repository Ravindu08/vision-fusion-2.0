import React, { useEffect } from 'react';
import { CharacterDisplay } from './CharacterDisplay';
import { type CharacterStage, STAGES_METADATA } from '../../config/characterAssets';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Award, Zap, CheckCircle2, X } from 'lucide-react';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newStage: CharacterStage;
  previousStageTitle?: string;
  totalXp: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newStage,
  previousStageTitle = 'Previous Stage',
  totalXp,
}) => {
  useEffect(() => {
    if (isOpen) {
      // 1. Dual side cannon confetti burst
      const end = Date.now() + 2 * 1000;
      const colors = ['#00f0ff', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const meta = STAGES_METADATA[newStage] || STAGES_METADATA.recruit;
  const isCertEligible = meta.minPercent >= 40 || totalXp >= 350;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Background radial glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: meta.color }}
      />

      {/* Main Modal Card */}
      <div
        className="relative w-full max-w-lg cyber-card p-6 md:p-8 text-center border-2 border-cyan-400/60 shadow-[0_0_50px_rgba(0,240,255,0.4)] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-cyber-dark/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-cyber-border transition-colors z-20 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Futuristic Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400 text-cyan-300 text-xs font-mono uppercase tracking-widest font-black shadow-glow-cyan mb-4 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Operative Evolution Triggered!
        </div>

        {/* Level Up Title */}
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight cyber-gradient-text font-display mb-1">
          Level Up!
        </h2>
        <p className="text-xs text-slate-400 font-mono tracking-wide">
          Your skills and dedication have propelled you to the next rank
        </p>

        {/* Evolution Transition Pill */}
        <div className="my-5 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-cyber-dark/80 border border-cyber-border font-mono text-xs">
          <span className="text-slate-400">{previousStageTitle}</span>
          <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-bold uppercase">{meta.title}</span>
        </div>

        {/* Evolved Character Avatar Display with Glow */}
        <div className="my-4 py-2 flex flex-col items-center justify-center">
          <CharacterDisplay
            stage={newStage}
            pose="celebrating"
            size="lg"
            showBadge={true}
            glow={true}
          />
        </div>

        {/* Unlocked Benefits & Tagline */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-xl bg-cyber-dark/60 border border-cyber-border text-left">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Operative Progression Status
            </div>
            <div className="text-xs text-slate-200 font-sans leading-relaxed">
              {meta.tagline}
            </div>
          </div>

          {isCertEligible && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Digital Certificate Eligibility Unlocked (&ge;70% XP / 350+ XP)!</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose();
            // If on quizzes page, navigate to dashboard to experience the evolved operative journey!
            if (window.location.pathname.includes('/quizzes')) {
              window.location.href = '/dashboard';
            }
          }}
          className="w-full cyber-btn-primary py-3.5 text-xs font-mono uppercase font-black tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan hover:scale-[1.02] transition-transform"
        >
          Equip Evolution & Continue <Award className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;
