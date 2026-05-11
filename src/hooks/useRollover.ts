import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import studyPlan from '../data/studyPlan.json';

export const useRollover = (profileId: string | null) => {
  const { progress, addRolloverTasks } = useStore();

  useEffect(() => {
    if (!profileId) return;

    const userProgress = progress[profileId];
    if (!userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check all previous days in the study plan
    const incompleteTasks: string[] = [];
    
    studyPlan.forEach(day => {
      // Only check days before today
      if (day.date < today) {
        day.topics.forEach(topic => {
          if (!userProgress.completedTopics.includes(topic.id)) {
            incompleteTasks.push(topic.id);
          }
        });
      }
    });

    if (incompleteTasks.length > 0) {
      // Filter out tasks already in rollover
      const newTasks = incompleteTasks.filter(id => !userProgress.rolloverTasks.includes(id));
      if (newTasks.length > 0) {
        addRolloverTasks(profileId, newTasks);
      }
    }
  }, [profileId, progress, addRolloverTasks]);
};
