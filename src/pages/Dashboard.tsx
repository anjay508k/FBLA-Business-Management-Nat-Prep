import { motion } from 'framer-motion';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Flame, 
  Target, 
  Calendar as CalendarIcon, 
  Trophy, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useRollover } from '../hooks/useRollover';
import studyPlan from '../data/studyPlan.json';

const Dashboard = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { profiles, progress } = useStore();
  
  useRollover(profileId || null);

  const profile = profiles.find((p) => p.id === profileId);
  const userProgress = progress[profileId || ''] || { streak: 0, completedTopics: [], completedDays: [], mcqScores: {} };

  if (!profile) return <Navigate to="/" />;

  // Calculate stats
  const totalTopics = studyPlan.reduce((acc, day) => acc + day.topics.length, 0);
  const completedTopicsCount = userProgress.completedTopics.length;
  const completionPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  // Countdown to Nationals (June 24, 2026)
  const nationalsDate = new Date('2026-06-24');
  const today = new Date();
  const daysUntil = Math.ceil((nationalsDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Calendar logic (May 11 - June 12)
  const startDate = new Date('2026-05-11');
  const endDate = new Date('2026-06-12');
  const days = [];
  let curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <Link to="/" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center font-black text-2xl">
              {profile.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-black">{profile.name}</h1>
              <p className="text-gray-400">Strategic Command Center</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <StatCard icon={<Flame className="text-orange-500" />} label="Streak" value={userProgress.streak} />
          <StatCard icon={<Target className="text-neon-blue" />} label="Completion" value={`${completionPercentage}%`} />
          <StatCard icon={<Clock className="text-neon-purple" />} label="Days Left" value={daysUntil} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-3xl p-6 mb-12 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">Overall XP Progress</h3>
            <div className="text-2xl font-black text-neon-blue">{completedTopicsCount * 100} XP</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-gray-500 uppercase">Level 1: Novice Manager</span>
          </div>
        </div>
        <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            className="h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_auto] animate-gradient-x"
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon className="w-6 h-6 text-neon-blue" />
          <h2 className="text-2xl font-black">Study Calendar</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {days.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayData = studyPlan.find(d => d.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const score = userProgress.mcqScores[dateStr];
            
            // For now, let's just mark it completed if all topics are checked
            const dayTopics = dayData?.topics.map(t => t.id) || [];
            const completedInDay = dayTopics.length > 0 && dayTopics.every(id => userProgress.completedTopics.includes(id));
            const hasScore = score !== undefined;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ y: -5 }}
                onClick={() => dayData && navigate(`/profile/${profileId}/day/${dateStr}`)}
                className={`
                  relative glass p-4 rounded-2xl cursor-pointer transition-all duration-300 group
                  ${!dayData ? 'opacity-30 cursor-not-allowed' : 'hover:border-neon-blue/50'}
                  ${isToday ? 'border-neon-blue glow-blue ring-1 ring-neon-blue' : ''}
                  ${completedInDay && hasScore ? 'border-neon-green/50 bg-neon-green/5' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-gray-500">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  {completedInDay && hasScore && (
                    <Trophy className="w-4 h-4 text-neon-green" />
                  )}
                </div>
                
                <div className="text-sm font-bold truncate group-hover:text-neon-blue transition-colors">
                  {dayData?.title || 'No Prep'}
                </div>

                {hasScore && (
                  <div className="mt-2 text-[10px] font-black text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded-full inline-block">
                    Score: {score}/20
                  </div>
                )}

                {isToday && (
                  <div className="absolute -top-2 -right-2 bg-neon-blue text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                    TODAY
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Motivational Section */}
      <div className="glass rounded-3xl p-8 border-l-4 border-neon-purple bg-gradient-to-r from-neon-purple/10 to-transparent">
        <h4 className="text-neon-purple font-black uppercase tracking-widest text-sm mb-2">Daily Directive</h4>
        <p className="text-xl font-medium text-gray-200 italic">
          "Management is doing things right; leadership is doing the right things. Today, strive for both."
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 border border-white/5 min-w-[140px]">
    <div className="p-3 bg-white/5 rounded-xl">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

export default Dashboard;
