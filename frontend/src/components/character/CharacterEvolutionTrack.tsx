import React from 'react';
import {
  type CharacterStage,
  STAGES_METADATA,
  CHARACTER_ASSET_PATHS,
} from '../../config/characterAssets';
import { CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';

interface CharacterEvolutionTrackProps {
  currentStage: CharacterStage;
  totalXp: number;
  onSelectPreviewStage?: (stage: CharacterStage) => void;
}

export const CharacterEvolutionTrack: React.FC<CharacterEvolutionTrackProps> = ({
  currentStage,
  totalXp,
  onSelectPreviewStage,
}) => {
  const stages: CharacterStage[] = [
    'recruit',
    'builder',
    'pathfinder',
    'intelligence-operative',
    'vanguard',
  ];

  const STAGE_THRESHOLDS: Record<CharacterStage, number> = {
    'recruit': 0,
    'builder': 100,
    'pathfinder': 200,
    'intelligence-operative': 350,
    'vanguard': 450,
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 5-Stage Operative Evolution Track
        </span>
        <span className="text-xs font-mono text-cyan-400 font-bold">
          {totalXp} / 500 XP
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stages.map((st) => {
          const meta = STAGES_METADATA[st];
          const thresholdXp = STAGE_THRESHOLDS[st];
          const isUnlocked = totalXp >= thresholdXp;
          const isCurrent = currentStage === st;
          const imageSrc = CHARACTER_ASSET_PATHS[st]?.idle || CHARACTER_ASSET_PATHS.recruit.idle;

          return (
            <div
              key={st}
              onClick={() => onSelectPreviewStage && onSelectPreviewStage(st)}
              className={`p-3 rounded-xl border transition-all duration-300 relative flex flex-col items-center text-center cursor-pointer ${
                isCurrent
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan ring-1 ring-cyan-400'
                  : isUnlocked
                  ? 'bg-cyber-dark/80 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-cyber-dark/40 border-cyber-border opacity-70 hover:opacity-100 hover:border-slate-600'
              }`}
            >
              {/* Status Pill Badge */}
              <div className="absolute top-2 right-2">
                {isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                ) : isUnlocked ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>

              {/* Character Thumbnail */}
              <div className="w-16 h-20 rounded-lg overflow-hidden flex items-center justify-center p-1 mb-2 bg-cyber-darkest/60 border border-cyber-border">
                <img
                  src={imageSrc}
                  alt={meta.title}
                  className={`w-full h-full object-contain filter ${
                    isUnlocked ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]' : 'grayscale opacity-50'
                  }`}
                />
              </div>

              {/* Title & XP */}
              <div className="text-xs font-bold font-mono text-slate-200 truncate w-full">
                {meta.title}
              </div>

              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {thresholdXp === 0 ? 'Start (0 XP)' : `${thresholdXp} XP`}
              </div>

              {/* Certificate Badge on Intelligence Operative (350+ XP) */}
              {st === 'intelligence-operative' && (
                <span className="mt-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                  <Award className="w-2.5 h-2.5" /> Cert Unlock
                </span>
              )}

              {isCurrent && (
                <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase bg-cyan-500 text-slate-950">
                  Active
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterEvolutionTrack;

