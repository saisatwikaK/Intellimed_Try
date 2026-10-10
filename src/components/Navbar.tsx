import React, { useState } from 'react';
import {
  Activity,
  LayoutDashboard,
  Pill,
  Camera,
  FileText,
  Hand,
  Bot,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  User,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    notifications,
    markNotificationRead,
    clearNotifications,
    activePatient,
    patients,
    setActivePatientId,
    activeRole,
    setActiveRole,
    caregivers,
    logout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPatientMenu, setShowPatientMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'ai-scanner', label: 'AI Scanner', icon: Camera },
    { id: 'ocr', label: 'OCR', icon: FileText },
    { id: 'gestures', label: 'Gestures', icon: Hand },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  IntelliMed
                </span>
                <span className="text-xs px-1.5 py-0.2 font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 border border-cyan-800/50 rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 -mt-0.5 hidden sm:block">
                Smart Medication Monitoring
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'text-cyan-300 bg-slate-800/80 shadow-sm border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Notifications & Patient Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowPatientMenu(false);
                }}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111B2D] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 bg-[#172338] border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-white">System Alerts</span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No notifications currently active.
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={`${n.id || 'notif'}_${idx}`}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-left hover:bg-slate-800/40 cursor-pointer transition-colors ${
                            !n.read ? 'bg-cyan-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'urgent' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            ) : n.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3" /> {n.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Patient Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowPatientMenu(!showPatientMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">
                  {activePatient.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-medium">{activePatient.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPatientMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#111B2D] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Switch Patient
                  </div>
                  {patients.map((p, idx) => (
                    <button
                      key={`${p.id}_${idx}`}
                      onClick={() => {
                        setActivePatientId(p.id);
                        setShowPatientMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/60 transition-colors ${
                        p.id === activePatient.id ? 'text-cyan-300 font-semibold bg-cyan-950/20' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{p.age}y / {p.bloodGroup}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setCurrentTab('settings');
                        setShowPatientMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
                    >
                      Manage Profiles & Caregivers &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 bg-slate-800/40 hover:bg-red-950/30 border border-slate-700/60 hover:border-red-800/50 rounded-lg transition-colors"
              title="Logout demo session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={`mob_${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-300 bg-slate-800 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
