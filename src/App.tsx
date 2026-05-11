import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import DayPage from './pages/DayPage';
import { useStore } from './store/useStore';

function App() {
  const { activeProfileId } = useStore();

  return (
    <Router>
      <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
        {/* Animated Background Overlay */}
        <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-blue rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/profile/:profileId" 
              element={<Dashboard />} 
            />
            <Route 
              path="/profile/:profileId/day/:date" 
              element={<DayPage />} 
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
