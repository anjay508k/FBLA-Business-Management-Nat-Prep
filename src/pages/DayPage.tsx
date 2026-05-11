import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import studyPlan from '../data/studyPlan.json';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Trophy,
  BookOpen,
  MessageSquare,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useRollover } from '../hooks/useRollover';

const DayPage = () => {
  const { profileId, date } = useParams();
  const navigate = useNavigate();
  const { progress, toggleTopic, saveMcqScore, updateStreak, addRolloverTasks, completeRolloverTask } = useStore();
  
  useRollover(profileId || null);

  const dayData = studyPlan.find(d => d.date === date);
  const userProgress = progress[profileId || ''] || { completedTopics: [], mcqScores: {}, rolloverTasks: [] };
  
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [mcqState, setMcqState] = useState<'view' | 'quiz' | 'result'>('view');
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  if (!dayData) return <Navigate to={`/profile/${profileId}`} />;

  const isDayCompleted = dayData.topics.every(t => userProgress.completedTopics.includes(t.id)) && 
                         userProgress.mcqScores[date!] !== undefined;

  // Handle completion and streak
  useEffect(() => {
    if (isDayCompleted) {
      updateStreak(profileId!);
    }
  }, [isDayCompleted, profileId, updateStreak]);

  const handleMcqSubmit = () => {
    let score = 0;
    dayData.mcqs.forEach((q, idx) => {
      if (currentAnswers[q.id] === q.answer) score++;
    });
    saveMcqScore(profileId!, date!, score);
    setMcqState('result');
  };

  const rolloverTasks = userProgress.rolloverTasks.map(id => {
    // Find task in full study plan
    for (const day of studyPlan) {
      const task = day.topics.find(t => t.id === id);
      if (task) return { ...task, originalDate: day.date };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link to={`/profile/${profileId}`} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-neon-blue bg-neon-blue/10 px-2 py-0.5 rounded-full uppercase">Day {dayData.day}</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase ${
              dayData.difficulty === 'Hard' ? 'text-red-500 bg-red-500/10' : 'text-neon-green bg-neon-green/10'
            }`}>
              {dayData.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-black">{dayData.title}</h1>
          <p className="text-gray-400">{new Date(date!).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Rollover Section */}
      {rolloverTasks.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-orange-500">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-widest text-sm">Rolled Over Tasks</h3>
          </div>
          <div className="space-y-3">
            {rolloverTasks.map(task => (
              <div key={task!.id} className="glass p-4 rounded-2xl border-l-4 border-orange-500 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{task!.title}</h4>
                  <p className="text-xs text-gray-500">From {task!.originalDate}</p>
                </div>
                <button 
                  onClick={() => completeRolloverTask(profileId!, task!.id)}
                  className="p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Topics */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-neon-blue" />
          <h2 className="text-2xl font-black">Study Objectives</h2>
        </div>
        <div className="space-y-4">
          {dayData.topics.map((topic) => (
            <div key={topic.id} className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${userProgress.completedTopics.includes(topic.id) ? 'border-neon-green/30' : ''}`}>
              <div 
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTopic(profileId!, topic.id, date!);
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      userProgress.completedTopics.includes(topic.id) 
                      ? 'bg-neon-green border-neon-green text-black' 
                      : 'border-white/20'
                    }`}
                  >
                    {userProgress.completedTopics.includes(topic.id) && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h3 className="font-bold group-hover:text-neon-blue transition-colors">{topic.title}</h3>
                    <span className="text-[10px] text-gray-500 uppercase font-black">{topic.studyTime} Est.</span>
                  </div>
                </div>
                {expandedTopic === topic.id ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
              </div>
              
              <AnimatePresence>
                {expandedTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-white/5"
                  >
                    <div className="p-5 text-gray-300 text-sm leading-relaxed border-t border-white/5">
                      {topic.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Role Play Connection */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-neon-purple" />
          <h2 className="text-2xl font-black">Role Play Connection</h2>
        </div>
        <div className="glass p-8 rounded-3xl border-t-2 border-neon-purple relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-16 h-16 text-neon-purple" />
          </div>
          <p className="text-gray-300 leading-relaxed italic">
            "{dayData.roleplayConnection}"
          </p>
        </div>
      </section>

      {/* MCQ Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-neon-green" />
          <h2 className="text-2xl font-black">Daily MCQs</h2>
        </div>

        {dayData.mcqs.length === 0 ? (
          <div className="glass p-8 rounded-3xl text-center">
            <p className="text-gray-400">No MCQs scheduled for this day. Focus on the study objectives and role play connections!</p>
          </div>
        ) : userProgress.mcqScores[date!] !== undefined && mcqState !== 'quiz' ? (
          <div className="glass p-8 rounded-3xl text-center border-2 border-neon-green/30">
            <Trophy className="w-12 h-12 text-neon-green mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-2">Quiz Completed!</h3>
            <div className="text-4xl font-black text-neon-green mb-6">{userProgress.mcqScores[date!]}/20</div>
            <button 
              onClick={() => setMcqState('quiz')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
            >
              Retake Quiz
            </button>
          </div>
        ) : mcqState === 'view' ? (
          <div className="glass p-8 rounded-3xl text-center">
            <p className="text-gray-400 mb-8">Ready to test your knowledge? {dayData.mcqs.length} questions on today's topics.</p>
            <button 
              onClick={() => setMcqState('quiz')}
              className="w-full py-4 bg-neon-green text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Start Daily Assessment <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {dayData.mcqs.map((q, qIdx) => (
              <div key={q.id} className="glass p-6 rounded-3xl">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-black shrink-0">{qIdx + 1}</span>
                  <p className="font-bold text-lg">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setCurrentAnswers({ ...currentAnswers, [q.id]: oIdx })}
                      className={`p-4 rounded-2xl text-left transition-all border-2 ${
                        currentAnswers[q.id] === oIdx 
                        ? 'border-neon-blue bg-neon-blue/10' 
                        : 'border-white/5 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-black">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>
                {mcqState === 'result' && (
                  <div className={`mt-6 p-4 rounded-2xl text-sm ${currentAnswers[q.id] === q.answer ? 'bg-neon-green/10 text-neon-green' : 'bg-red-500/10 text-red-500'}`}>
                    <p className="font-black uppercase mb-1">{currentAnswers[q.id] === q.answer ? 'Correct' : 'Incorrect'}</p>
                    <p className="text-gray-300">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
            
            {mcqState === 'quiz' && (
              <button 
                onClick={handleMcqSubmit}
                disabled={Object.keys(currentAnswers).length < dayData.mcqs.length}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest transition-all ${
                  Object.keys(currentAnswers).length < dayData.mcqs.length 
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                  : 'bg-neon-green text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(57,255,20,0.3)]'
                }`}
              >
                {Object.keys(currentAnswers).length < dayData.mcqs.length ? `Complete all questions (${Object.keys(currentAnswers).length}/${dayData.mcqs.length})` : 'Submit Assessment'}
              </button>
            )}
            
            {mcqState === 'result' && (
              <button 
                onClick={() => {
                  setMcqState('view');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-6 bg-neon-blue text-black rounded-3xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
              >
                Back to Top
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default DayPage;
