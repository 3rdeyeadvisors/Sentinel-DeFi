import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { courseContent } from '@/data/courseContent';
import { usePoints } from '@/hooks/usePoints';
import { useBadges } from '@/hooks/useBadges';
import { useAchievementSounds } from '@/hooks/useAchievementSounds';

interface CourseProgress {
  course_id: number;
  completed_modules: number[];
  started_at: string;
  last_accessed: string;
  completion_percentage: number;
}

interface ProgressContextType {
  courseProgress: Record<number, CourseProgress>;
  loading: boolean;
  updateModuleProgress: (courseId: number, moduleIndex: number) => Promise<void>;
  startCourse: (courseId: number) => Promise<void>;
  getCourseProgress: (courseId: number) => CourseProgress | null;
  isCourseCompleted: (courseId: number) => boolean;
  getCompletionBadge: (courseId: number) => string | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [courseProgress, setCourseProgress] = useState<Record<number, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { awardPoints } = usePoints();
  const { awardBadge, checkBadgeProgress } = useBadges();
  const { playModuleComplete, playCourseComplete } = useAchievementSounds();

  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      setCourseProgress({});
      setLoading(false);
    }
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No valid session for loading progress');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const progressMap: Record<number, CourseProgress> = {};
      data?.forEach((progress) => {
        progressMap[progress.course_id] = progress;
      });

      setCourseProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('course_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            completed_modules: [],
            completion_percentage: 0,
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setCourseProgress(prev => ({
          ...prev,
          [courseId]: newData
        }));
      }
    } catch (error) {
      console.error('[Progress] Error starting course:', error);
    }
  };

  const updateModuleProgress = async (courseId: number, moduleIndex: number) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get existing progress to check if module already completed
      const { data: existingData, error: fetchError } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Ensure we have a valid array
      const completedModules = Array.isArray(existingData?.completed_modules) 
        ? existingData.completed_modules 
        : [];
      
      // Don't add if already completed
      if (completedModules.includes(moduleIndex)) {
        return;
      }

      // Build updated modules array
      const updatedModules = [...completedModules, moduleIndex].sort((a, b) => a - b);
      const totalModules = getCourseModuleCount(courseId);
      const completionPercentage = (updatedModules.length / totalModules) * 100;

      let resultData;

      if (existingData) {
        // Record exists - UPDATE it
        const { error: updateError, data: updateData } = await supabase
          .from('course_progress')
          .update({
            completed_modules: updatedModules,
            last_accessed: new Date().toISOString(),
            completion_percentage: completionPercentage,
          })
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .select()
          .single();

        if (updateError) throw updateError;
        resultData = updateData;
      } else {
        // Record doesn't exist - INSERT it
        const { error: insertError, data: insertData } = await supabase
          .from('course_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            completed_modules: updatedModules,
            last_accessed: new Date().toISOString(),
            completion_percentage: completionPercentage,
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;
        resultData = insertData;
        
        // Award points for first course started
        if (updatedModules.length === 1) {
          try {
            await awardPoints('first_course_started', `course_${courseId}`);
            await awardBadge('first_steps');
          } catch (e) {
            // Silently fail points/badges
          }
        }
      }

      // Award points for module completion
      try {
        await awardPoints('module_completion', `${courseId}_${moduleIndex}`);
        playModuleComplete();
      } catch (e) {
        // Silently fail points
      }

      // Check if course is now complete and award course completion points
      if (resultData.completion_percentage === 100) {
        try {
          await awardPoints('course_completion', `course_${courseId}`);
          playCourseComplete();
          await awardBadge('course_graduate');
          
          const completedCourses = Object.values(courseProgress).filter(
            p => p.completion_percentage === 100
          ).length + 1;
          
          if (completedCourses >= 3) {
            await awardBadge('scholar');
          }
          
          if (completedCourses >= courseContent.length) {
            await awardBadge('defi_master');
          }
        } catch (e) {
          // Silently fail points/badges
        }
      }

      // Update local state
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: resultData
      }));

    } catch (error) {
      console.error('[Progress] Error updating module progress:', error);
      throw error;
    }
  };

  const getCourseProgress = (courseId: number): CourseProgress | null => {
    return courseProgress[courseId] || null;
  };

  const isCourseCompleted = (courseId: number): boolean => {
    return courseProgress[courseId]?.completion_percentage === 100;
  };

  const getCompletionBadge = (courseId: number): string | null => {
    const progress = getCourseProgress(courseId);
    if (!progress) return null;

    if (progress.completion_percentage === 100) return '🏆 Completed';
    if (progress.completion_percentage >= 75) return '⭐ Almost There';
    if (progress.completion_percentage >= 50) return '💪 Making Progress';
    if (progress.completion_percentage >= 25) return '🚀 Getting Started';
    return '👋 Just Started';
  };

  const getCourseModuleCount = (courseId: number): number => {
    const course = courseContent.find(c => c.id === courseId);
    return course?.modules.length || 5;
  };

  const value = {
    courseProgress,
    loading,
    updateModuleProgress,
    startCourse,
    getCourseProgress,
    isCourseCompleted,
    getCompletionBadge,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};