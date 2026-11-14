import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ThreatHistory from './pages/ThreatHistory';
import HowItWorks from './pages/HowItWorks';

const STORAGE_KEY = 'trustlens_threat_history_v1';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [forceMock, setForceMock] = useState(false);
  const [activeResult, setActiveResult] = useState(null);

  // Keep history empty until a scan is actually submitted.
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage:', e);
    }
    return [];
  });

  // Save history updates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }
  }, [history]);

  const handleSaveScanToHistory = (newResult) => {
    setHistory(prev => {
      // Prevent duplicates with same scan_id
      const filtered = prev.filter(item => item.scan_id !== newResult.scan_id);
      return [newResult, ...filtered].slice(0, 50); // retain last 50
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  };

  const handleNavChange = (pageId) => {
    if (pageId === 'analyze') {
      setActivePage('dashboard');
      setTimeout(() => {
        document.getElementById('analysis-workspace')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar
        activePage={activePage}
        setActivePage={handleNavChange}
        forceMock={forceMock}
        setForceMock={setForceMock}
        historyCount={history.length}
      />

      <main className="flex-1">
        {activePage === 'dashboard' && (
          <Dashboard
            onSaveScanToHistory={handleSaveScanToHistory}
            forceMock={forceMock}
            setActivePage={handleNavChange}
            activeResult={activeResult}
            setActiveResult={setActiveResult}
          />
        )}

        {activePage === 'history' && (
          <ThreatHistory
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={(item) => setActiveResult(item)}
            setActivePage={handleNavChange}
          />
        )}

        {activePage === 'how-it-works' && (
          <HowItWorks setActivePage={handleNavChange} />
        )}

        <footer className="border-t border-slate-800/80 bg-midnight-950/70 px-4 py-5 text-center text-base leading-relaxed text-slate-300">
          TrustLens provides educational guidance. Demo and offline heuristic
          outputs are simulated, not verified security verdicts.
        </footer>
      </main>
    </div>
  );
}
