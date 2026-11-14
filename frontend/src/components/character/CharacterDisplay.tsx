import React from 'react';
import {
  type CharacterStage,
  type CharacterPose,
  STAGES_METADATA,
  CHARACTER_ASSET_PATHS,
} from '../../config/characterAssets';

interface CharacterDisplayProps {
  stage?: CharacterStage;
  pose?: CharacterPose;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  glow?: boolean;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  stage = 'recruit',
  pose = 'idle',
  size = 'md',
  showBadge = true,
  className = '',
  glow = true,
}) => {
  const currentStage: CharacterStage = (stage in STAGES_METADATA) ? stage : 'recruit';
  const meta = STAGES_METADATA[currentStage];
  const currentPose: CharacterPose = (CHARACTER_ASSET_PATHS[currentStage] && pose in CHARACTER_ASSET_PATHS[currentStage]) ? pose : 'idle';
  const imageSrc = CHARACTER_ASSET_PATHS[currentStage][currentPose] || CHARACTER_ASSET_PATHS.recruit.idle;

  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
    sm: 'w-24 h-32',
    md: 'w-44 h-56',
    lg: 'w-64 h-80',
    xl: 'w-80 h-96',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Background Cyber Ambient Aura */}
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl blur-xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: meta.color }}
        />
      )}

      {/* Character Image Container */}
      <div
        className={`relative ${sizeClasses[size]} rounded-2xl p-2 flex items-center justify-center transition-all duration-500 ease-out`}
      >
        <img
          src={imageSrc}
          alt={`${meta.title} - ${currentPose}`}
          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src !== CHARACTER_ASSET_PATHS.recruit.idle) {
              target.src = CHARACTER_ASSET_PATHS.recruit.idle;
            }
          }}
        />
      </div>

      {/* Stage Badge */}
      {showBadge && (
        <div className="mt-3 flex flex-col items-center">
          <span
            className={`px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase border rounded-full ${meta.badgeClass}`}
          >
            {meta.title}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono tracking-tight">
            {meta.tagline}
          </span>
        </div>
      )}
    </div>
  );
};

export default CharacterDisplay;
