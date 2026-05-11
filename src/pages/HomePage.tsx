import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { profiles, setActiveProfile, progress } = useStore();

  const handleProfileSelect = (id: string) => {
    setActiveProfile(id);
    navigate(`/profile/${id}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent mb-4">
          FBLA Nationals Command Center
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-medium">
          Business Management Nationals Preparation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {profiles.map((profile, index) => {
          const profileProgress = progress[profile.id] || { streak: 0, completedTopics: [], completedDays: [] };
          const completionPercentage = Math.round((profileProgress.completedTopics.length / 500) * 100); // Placeholder total 500

          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleProfileSelect(profile.id)}
              className="glass rounded-3xl p-8 cursor-pointer relative group overflow-hidden border border-white/5 hover:border-neon-blue/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center mb-6 border-2 border-white/10 group-hover:border-neon-blue transition-colors overflow-hidden">
                  <span className="text-3xl font-bold text-white/50 group-hover:text-neon-blue">{profile.avatar}</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 group-hover:text-neon-blue transition-colors">
                  {profile.name}
                </h2>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center">
                    <Flame className="w-5 h-5 text-orange-500 mb-1" />
                    <span className="text-lg font-bold">{profileProgress.streak}</span>
                    <span className="text-xs text-gray-500 uppercase font-black">Streak</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center">
                    <CheckCircle2 className="w-5 h-5 text-neon-green mb-1" />
                    <span className="text-lg font-bold">{completionPercentage}%</span>
                    <span className="text-xs text-gray-500 uppercase font-black">Comp</span>
                  </div>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                  />
                </div>

                <button className="w-full py-4 bg-white/5 group-hover:bg-neon-blue group-hover:text-black rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all">
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
