import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProgress {
  completedTopics: string[]; // IDs of completed topics
  mcqScores: Record<string, number>; // date -> score (out of 20)
  completedDays: string[]; // dates of fully completed days
  streak: number;
  lastCompletedDate: string | null;
  rolloverTasks: string[]; // IDs of tasks rolled over
}

interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface AppState {
  profiles: Profile[];
  activeProfileId: string | null;
  progress: Record<string, UserProgress>; // profileId -> progress
  
  // Actions
  setActiveProfile: (id: string) => void;
  toggleTopic: (profileId: string, topicId: string, date: string) => void;
  saveMcqScore: (profileId: string, date: string, score: number) => void;
  updateStreak: (profileId: string) => void;
  addRolloverTasks: (profileId: string, taskIds: string[]) => void;
  completeRolloverTask: (profileId: string, taskId: string) => void;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedTopics: [],
  mcqScores: {},
  completedDays: [],
  streak: 0,
  lastCompletedDate: null,
  rolloverTasks: [],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profiles: [
        { id: 'anjay', name: 'Anjay Kannan', avatar: 'AK' },
        { id: 'sai', name: 'Sai Koochana', avatar: 'SK' },
        { id: 'aarush', name: 'Aarush Ravella', avatar: 'AR' },
      ],
      activeProfileId: null,
      progress: {},

      setActiveProfile: (id) => set({ activeProfileId: id }),

      toggleTopic: (profileId, topicId) => set((state) => {
        const profileProgress = state.progress[profileId] || { ...DEFAULT_PROGRESS };
        const isCompleted = profileProgress.completedTopics.includes(topicId);
        
        const newCompletedTopics = isCompleted
          ? profileProgress.completedTopics.filter((id) => id !== topicId)
          : [...profileProgress.completedTopics, topicId];

        return {
          progress: {
            ...state.progress,
            [profileId]: {
              ...profileProgress,
              completedTopics: newCompletedTopics,
            },
          },
        };
      }),

      saveMcqScore: (profileId, date, score) => set((state) => {
        const profileProgress = state.progress[profileId] || { ...DEFAULT_PROGRESS };
        return {
          progress: {
            ...state.progress,
            [profileId]: {
              ...profileProgress,
              mcqScores: {
                ...profileProgress.mcqScores,
                [date]: score,
              },
            },
          },
        };
      }),

      updateStreak: (profileId) => set((state) => {
        const profileProgress = state.progress[profileId] || { ...DEFAULT_PROGRESS };
        const today = new Date().toISOString().split('T')[0];
        
        if (profileProgress.lastCompletedDate === today) return state;

        let newStreak = profileProgress.streak;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (profileProgress.lastCompletedDate === yesterdayStr) {
          newStreak += 1;
        } else if (profileProgress.lastCompletedDate === null) {
          newStreak = 1;
        } else {
          newStreak = 1; // Reset if more than 1 day missed
        }

        return {
          progress: {
            ...state.progress,
            [profileId]: {
              ...profileProgress,
              streak: newStreak,
              lastCompletedDate: today,
            },
          },
        };
      }),

      addRolloverTasks: (profileId, taskIds) => set((state) => {
        const profileProgress = state.progress[profileId] || { ...DEFAULT_PROGRESS };
        const newRollover = Array.from(new Set([...profileProgress.rolloverTasks, ...taskIds]));
        return {
          progress: {
            ...state.progress,
            [profileId]: {
              ...profileProgress,
              rolloverTasks: newRollover,
            },
          },
        };
      }),

      completeRolloverTask: (profileId, taskId) => set((state) => {
        const profileProgress = state.progress[profileId] || { ...DEFAULT_PROGRESS };
        return {
          progress: {
            ...state.progress,
            [profileId]: {
              ...profileProgress,
              rolloverTasks: profileProgress.rolloverTasks.filter(id => id !== taskId),
              completedTopics: [...profileProgress.completedTopics, taskId]
            },
          },
        };
      }),
    }),
    {
      name: 'fbla-prep-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
