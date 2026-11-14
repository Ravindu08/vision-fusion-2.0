export type CharacterStage =
  | 'recruit'
  | 'builder'
  | 'pathfinder'
  | 'intelligence-operative'
  | 'vanguard';

export type CharacterPose =
  | 'idle'
  | 'active'
  | 'celebrating'
  | 'quizzing'
  | 'focused';

export interface StageMeta {
  stage: CharacterStage;
  title: string;
  tagline: string;
  minPercent: number;
  maxPercent: number;
  color: string;
  glowClass: string;
  badgeClass: string;
}

export const STAGES_METADATA: Record<CharacterStage, StageMeta> = {
  'recruit': {
    stage: 'recruit',
    title: 'The Recruit',
    tagline: 'Initiating Tech Career Journey',
    minPercent: 0,
    maxPercent: 20,
    color: '#38bdf8',
    glowClass: 'shadow-glow-cyan',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  },
  'builder': {
    stage: 'builder',
    title: 'The Builder',
    tagline: 'Forging Core Technical Skills',
    minPercent: 20,
    maxPercent: 40,
    color: '#06b6d4',
    glowClass: 'shadow-glow-cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  'pathfinder': {
    stage: 'pathfinder',
    title: 'The Pathfinder',
    tagline: 'Navigating New Tech Horizons (Cert Eligible)',
    minPercent: 40,
    maxPercent: 60,
    color: '#10b981',
    glowClass: 'shadow-glow-emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'intelligence-operative': {
    stage: 'intelligence-operative',
    title: 'The Intelligence Operative',
    tagline: 'Mastering Strategy & Problem Solving',
    minPercent: 60,
    maxPercent: 80,
    color: '#a855f7',
    glowClass: 'shadow-glow-purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  'vanguard': {
    stage: 'vanguard',
    title: 'The Vanguard',
    tagline: 'Leading the Technological Frontier',
    minPercent: 80,
    maxPercent: 100,
    color: '#f59e0b',
    glowClass: 'shadow-glow-purple',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
};

export const CHARACTER_ASSET_PATHS: Record<CharacterStage, Record<CharacterPose, string>> = {
  'recruit': {
    idle: '/assets/characters/recruit/pose_1.jpg',
    active: '/assets/characters/recruit/pose_2.jpg',
    celebrating: '/assets/characters/recruit/pose_3.jpg',
    quizzing: '/assets/characters/recruit/pose_4.jpg',
    focused: '/assets/characters/recruit/pose_5.jpg',
  },
  'builder': {
    idle: '/assets/characters/builder/pose_1.jpg',
    active: '/assets/characters/builder/pose_2.jpg',
    celebrating: '/assets/characters/builder/pose_3.jpg',
    quizzing: '/assets/characters/builder/pose_4.jpg',
    focused: '/assets/characters/builder/pose_5.jpg',
  },
  'pathfinder': {
    idle: '/assets/characters/pathfinder/pose_1.jpg',
    active: '/assets/characters/pathfinder/pose_2.jpg',
    celebrating: '/assets/characters/pathfinder/pose_3.jpg',
    quizzing: '/assets/characters/pathfinder/pose_4.jpg',
    focused: '/assets/characters/pathfinder/pose_5.jpg',
  },
  'intelligence-operative': {
    idle: '/assets/characters/intelligence-operative/pose_1.jpg',
    active: '/assets/characters/intelligence-operative/pose_2.jpg',
    celebrating: '/assets/characters/intelligence-operative/pose_3.jpg',
    quizzing: '/assets/characters/intelligence-operative/pose_4.jpg',
    focused: '/assets/characters/intelligence-operative/pose_5.jpg',
  },
  'vanguard': {
    idle: '/assets/characters/vanguard/pose_1.jpg',
    active: '/assets/characters/vanguard/pose_2.jpg',
    celebrating: '/assets/characters/vanguard/pose_3.jpg',
    quizzing: '/assets/characters/vanguard/pose_4.jpg',
    focused: '/assets/characters/vanguard/pose_5.jpg',
  },
};
