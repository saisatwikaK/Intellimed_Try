import React, { useState } from 'react';
import { Activity, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { loginDemo } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('kavya.ts@apollo.med');
  const [password, setPassword] = useState('IntelliMed2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Kavya TS');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid clinical email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    setError('');
    loginDemo();
  };

  return (
    <div className="min-h-screen bg-[#080D19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111B2D] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 backdrop-blur-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-3">
            <div className="w-full h-full bg-[#0B1220] rounded-[14px] flex items-center justify-center">
              <Activity className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">IntelliMed AI</h1>
          <p className="text-xs uppercase tracking-wider text-cyan-400 font-mono mt-1">
            Intelligent Medication Monitoring & Assistance
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Final-Year Major Project Demonstration Portal
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mb-6 p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Presentation Mode Active:</span> You can click the one-click demo access button below to launch the operational dashboard immediately.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kavya TS"
                className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@apollo.med"
                className="w-full pl-9 pr-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111B2D] px-2 text-slate-500 font-mono">or immediate presentation</span>
          </div>
        </div>

        {/* 1-Click Demo Login */}
        <button
          onClick={() => loginDemo('Patient')}
          className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Launch Demo Session (Kavya TS)</span>
        </button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isRegister
              ? 'Already have credentials? Sign in here'
              : "Need a new account? Switch to registration form"}
          </button>
        </div>
      </div>
    </div>
  );
};
