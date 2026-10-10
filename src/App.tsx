import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Medications } from './components/Medications';
import { AIScanner } from './components/AIScanner';
import { OCRScanner } from './components/OCRScanner';
import { GestureRecognition } from './components/GestureRecognition';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

const MainLayout: React.FC = () => {
  const { isAuthenticated, currentTab } = useApp();

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#080D19] text-[#F8FAFC] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* Top Persistent Navigation Bar matching video */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 pb-12">
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'medications' && <Medications />}
        {currentTab === 'ai-scanner' && <AIScanner />}
        {currentTab === 'ocr' && <OCRScanner />}
        {currentTab === 'gestures' && <GestureRecognition />}
        {currentTab === 'reports' && <Reports />}
        {(currentTab === 'settings' || currentTab === 'patients' || currentTab === 'caregivers' || currentTab === 'assistant') && (
          <Settings />
        )}
      </main>

      {/* Sleek Subdued Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1220]/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-semibold">IntelliMed AI</span>
            <span>· Intelligent Medication Monitoring & Assistance System</span>
          </div>
          <div>Final-Year Major Project Clinical Demonstration Platform</div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
