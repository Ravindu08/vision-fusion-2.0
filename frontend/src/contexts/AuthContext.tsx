import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProgress, LoginPayload, RegisterPayload } from '../types/auth';
import type { CharacterStage } from '../config/characterAssets';
import { authService } from '../services/authService';
import { LevelUpModal } from '../components/character/LevelUpModal';

interface LevelUpState {
  isOpen: boolean;
  newStage: CharacterStage;
  previousStageTitle: string;
  totalXp: number;
}

interface AuthContextType {
  user: UserProgress | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  triggerLevelUp: (newStage: CharacterStage, previousStageTitle?: string, totalXp?: number) => void;
  closeLevelUp: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProgress | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vf2_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Level-up celebration state
  const [levelUpState, setLevelUpState] = useState<LevelUpState>({
    isOpen: false,
    newStage: 'recruit',
    previousStageTitle: 'The Recruit',
    totalXp: 0,
  });

  const fetchProfile = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch {
      localStorage.removeItem('vf2_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await authService.login(payload);
      localStorage.setItem('vf2_token', data.access_token);
      setToken(data.access_token);
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const data = await authService.register(payload);
      localStorage.setItem('vf2_token', data.access_token);
      setToken(data.access_token);
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('vf2_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile();
    }
  };

  const triggerLevelUp = (
    newStage: CharacterStage,
    previousStageTitle: string = 'Previous Stage',
    totalXp: number = user?.total_xp || 0
  ) => {
    setLevelUpState({
      isOpen: true,
      newStage,
      previousStageTitle,
      totalXp,
    });
  };

  const closeLevelUp = () => {
    setLevelUpState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
        triggerLevelUp,
        closeLevelUp,
      }}
    >
      {children}

      {/* Global Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={levelUpState.isOpen}
        onClose={closeLevelUp}
        newStage={levelUpState.newStage}
        previousStageTitle={levelUpState.previousStageTitle}
        totalXp={levelUpState.totalXp}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
