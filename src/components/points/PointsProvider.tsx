import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePoints, PointActionType, POINT_VALUES } from '@/hooks/usePoints';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';
import { toast } from 'sonner';

interface PointsContextType {
  totalPoints: number;
  rank: { total_points: number; rank: number; total_users: number } | null;
  todayPoints: number;
  loading: boolean;
  daysRemaining: number;
  awardPoints: (actionType: PointActionType, actionId?: string, metadata?: Record<string, any>) => Promise<{ success: boolean; pointsAwarded: number; message: string }>;
  refreshPoints: () => Promise<void>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export const usePointsContext = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePointsContext must be used within a PointsProvider');
  }
  return context;
};

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const { user } = useAuth();
  const {
    totalPoints,
    rank,
    todayPoints,
    loading,
    awardPoints: baseAwardPoints,
    checkDailyLogin,
    getDaysRemaining,
    refreshPoints,
  } = usePoints();
  const { playPointsEarned, playDailyLogin } = useAchievementSounds();

  const [hasCheckedDailyLogin, setHasCheckedDailyLogin] = useState(false);

  // Check daily login on mount
  useEffect(() => {
    if (user && !hasCheckedDailyLogin) {
      const checkLogin = async () => {
        const result = await checkDailyLogin();
        if (!result.alreadyLoggedIn && result.pointsAwarded > 0) {
          // Play daily login sound
          playDailyLogin();
          toast.success(`+${result.pointsAwarded} points for daily login!`, {
            description: 'Keep your streak going!',
            duration: 3000,
          });
        }
        setHasCheckedDailyLogin(true);
      };
      checkLogin();
    }
  }, [user, hasCheckedDailyLogin, checkDailyLogin, playDailyLogin]);

  // Reset daily login check when user changes
  useEffect(() => {
    if (!user) {
      setHasCheckedDailyLogin(false);
    }
  }, [user]);

  // Wrapper for awarding points with toast notification
  const awardPoints = useCallback(async (
    actionType: PointActionType,
    actionId?: string,
    metadata?: Record<string, any>
  ) => {
    const result = await baseAwardPoints(actionType, actionId, metadata);
    
    if (result.success && result.pointsAwarded > 0) {
      // Play points earned sound
      playPointsEarned();
      const actionDisplayNames: Record<string, string> = {
        module_completion: 'Module completed',
        course_completion: 'Course completed',
        quiz_passed: 'Quiz passed',
        quiz_perfect: 'Perfect score',
        tutorial_completed: 'Tutorial completed',
        comment_posted: 'Comment posted',
        discussion_started: 'Discussion started',
        discussion_reply: 'Reply posted',
        rate_course: 'Course rated',
        referral_signup: 'Referral signup',
        complete_profile: 'Profile completed',
        first_course_started: 'Course started',
      };

      const displayName = actionDisplayNames[actionType] || actionType;
      
      toast.success(`+${result.pointsAwarded} points!`, {
        description: displayName,
        duration: 2500,
      });
    }

    return result;
  }, [baseAwardPoints, playPointsEarned]);

  const value: PointsContextType = {
    totalPoints,
    rank,
    todayPoints,
    loading,
    daysRemaining: getDaysRemaining(),
    awardPoints,
    refreshPoints: async () => {
      await refreshPoints();
    },
  };

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};
