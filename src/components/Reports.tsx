import React, { useState } from 'react';
import {
  BarChart3,
  FileDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Reports: React.FC = () => {
  const { medicationLogs, exportCsvData } = useApp();

  const [timeRange, setTimeRange] = useState<'7 Days' | '30 Days' | '3 Months' | '6 Months'>('7 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [medFilter, setMedFilter] = useState('All Medicines');

  // Compute metrics from actual logs
  const totalTracked = medicationLogs.length;
  const takenCount = medicationLogs.filter((l) => l.status === 'Taken').length;
  const missedCount = medicationLogs.filter((l) => l.status === 'Missed').length;
  const adherenceRate = totalTracked > 0 ? Math.round((takenCount / totalTracked) * 100) : 91;

  // Filter logs for the table
  const filteredLogs = medicationLogs.filter((log) => {
    const matchesSearch =
      log.medicine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All Status' || log.status === statusFilter;
    const matchesMed = medFilter === 'All Medicines' || log.medicine.toLowerCase().includes(medFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesMed;
  });

  // Unique medicines for filter dropdown
  const uniqueMedicines = Array.from(new Set(medicationLogs.map((l) => l.medicine)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header matching video Frame 0:21 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reports & Analytics
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
              Live Audited
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Medication adherence monitoring — Last updated: 15/05/2026, 09:20 AM
          </p>
        </div>

        {/* Time Filter Buttons & Export matching video Frame 0:21 */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-[#111B2D] border border-slate-800 rounded-lg">
            {(['7 Days', '30 Days', '3 Months', '6 Months'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsvData}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* TOP 6 METRICS CARDS matching video Frame 0:22 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Tracked */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Tracked</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{totalTracked}</div>
          <span className="text-[10px] text-slate-500">Cumulative doses</span>
        </div>

        {/* Card 2: Adherence Rate */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Adherence Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{adherenceRate}%</div>
          <span className="text-[10px] text-emerald-400/80 font-semibold">+3.2% vs baseline</span>
        </div>

        {/* Card 3: Missed Doses */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Missed Doses</span>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">{missedCount}</div>
          <span className="text-[10px] text-slate-500">Documented gap</span>
        </div>

        {/* Card 4: On-Time Doses */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">On-Time Doses</span>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{takenCount}</div>
          <span className="text-[10px] text-cyan-400/80 font-semibold">&lt; 30m deviation</span>
        </div>

        {/* Card 5: Alerts Triggered */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Alerts Triggered</span>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">1</div>
          <span className="text-[10px] text-amber-400/80">Stock warning</span>
        </div>

        {/* Card 6: Critical Warnings */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Critical Warnings</span>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">2</div>
          <span className="text-[10px] text-purple-400/80">Interaction alerts</span>
        </div>
      </div>

      {/* TWO CHARTS SECTION matching video Frame 0:23 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart (8 cols): Adherence Trend */}
        <div className="lg:col-span-8 bg-[#111B2D] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Adherence Trend</h3>
              <p className="text-xs text-slate-400">Medication compliance rate over selected period</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Target &gt;90%
            </span>
          </div>

          {/* SVG Smooth Area Line Chart */}
          <div className="h-64 w-full relative pt-4">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="#1e293b" />

              {/* Y Axis Labels */}
              <text x="10" y="34" fill="#64748b" fontSize="10" fontFamily="monospace">100%</text>
              <text x="10" y="84" fill="#64748b" fontSize="10" fontFamily="monospace">80%</text>
              <text x="10" y="134" fill="#64748b" fontSize="10" fontFamily="monospace">60%</text>
              <text x="10" y="184" fill="#64748b" fontSize="10" fontFamily="monospace">40%</text>

              {/* Area Path */}
              <path
                d="M 60,50 Q 140,40 220,110 T 380,45 T 540,55 L 540,180 L 60,180 Z"
                fill="url(#adherenceGrad)"
              />

              {/* Curve Line */}
              <path
                d="M 60,50 Q 140,40 220,110 T 380,45 T 540,55"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[
                { x: 60, y: 50, label: 'D1: 95%' },
                { x: 140, y: 40, label: 'D2: 98%' },
                { x: 220, y: 110, label: 'D3: 68%' },
                { x: 300, y: 55, label: 'D4: 92%' },
                { x: 380, y: 45, label: 'D5: 96%' },
                { x: 460, y: 48, label: 'D6: 95%' },
                { x: 540, y: 55, label: 'D7: 94%' },
              ].map((pt, i) => (
                <g key={i} className="cursor-pointer group">
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#080D19" stroke="#38bdf8" strokeWidth="2.5" />
                  <circle cx={pt.x} cy={pt.y} r="2" fill="#22d3ee" />
                </g>
              ))}

              {/* X Axis labels matching video: D1 .. D7 */}
              {['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'].map((label, idx) => (
                <text
                  key={label}
                  x={60 + idx * 80}
                  y="198"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Right Chart (4 cols): Missed Dose Distribution matching video Frame 0:23 */}
        <div className="lg:col-span-4 bg-[#111B2D] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Missed Dose Distribution</h3>
            <p className="text-xs text-slate-400">By time of day</p>

            {/* SVG Donut Chart */}
            <div className="my-6 flex items-center justify-center">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#172338" strokeWidth="14" />
                  {/* Afternoon Slice (60%) Cyan */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="14"
                    strokeDasharray="143 238"
                    strokeDashoffset="0"
                  />
                  {/* Morning Slice (25%) Blue */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="14"
                    strokeDasharray="60 238"
                    strokeDashoffset="-143"
                  />
                  {/* Night Slice (15%) Purple */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="14"
                    strokeDasharray="35 238"
                    strokeDashoffset="-203"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-2xl font-black text-white font-mono">{missedCount}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Total Missed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend matching video: Afternoon, Morning, Night */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Afternoon</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 font-bold">60%</span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Morning</span>
              </div>
              <span className="text-[11px] font-mono text-blue-300 font-bold">25%</span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>Night</span>
              </div>
              <span className="text-[11px] font-mono text-purple-300 font-bold">15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* MEDICATION LOG TABLE matching video Frame 0:26 */}
      <div className="bg-[#111B2D] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Medication Log</h3>
          </div>

          {/* Filter Bar matching video: Search, All Medicines dropdown, All Status dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicine or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={medFilter}
              onChange={(e) => setMedFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option>All Medicines</option>
              {uniqueMedicines.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option>All Status</option>
              <option>Taken</option>
              <option>Pending</option>
              <option>Missed</option>
            </select>
          </div>
        </div>

        {/* The Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">MEDICINE</th>
                <th className="py-3 px-3">SCHEDULED TIME</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No matching medication logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={`${log.id}_${idx}`} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-300 font-sans">{log.date}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white font-sans">{log.medicine}</span>{' '}
                      <span className="text-slate-400 text-[11px]">({log.dosage})</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{log.scheduledTime}</td>
                    <td className="py-3 px-3">
                      {log.status === 'Taken' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Taken
                        </span>
                      ) : log.status === 'Missed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/70 text-red-300 border border-red-800/50">
                          <AlertCircle className="w-3 h-3 text-red-400" /> Missed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                          <Clock className="w-3 h-3 text-cyan-400" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">{log.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT UPDATES TIMELINE matching video Frame 0:27 */}
      <div className="bg-[#111B2D] border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Recent Updates</span>
        </h3>

        <div className="space-y-3">
          {[
            {
              title: 'Paracetamol dose logged at 09:00 AM',
              time: 'Just now',
              type: 'taken',
            },
            {
              title: 'Metformin (1:00 PM) missed — no confirmation received',
              time: '2 hours ago',
              type: 'missed',
            },
            {
              title: 'Reminder schedule updated for Amlodipine',
              time: 'Yesterday',
              type: 'info',
            },
            {
              title: 'Critical: Metformin missed 3 consecutive days (Previous cycle)',
              time: '3 days ago',
              type: 'critical',
            },
            {
              title: 'Monthly clinical adherence summary generated for April 2026',
              time: '5 days ago',
              type: 'report',
            },
          ].map((update, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#0B1220]/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    update.type === 'taken'
                      ? 'bg-emerald-400'
                      : update.type === 'missed' || update.type === 'critical'
                      ? 'bg-red-400'
                      : 'bg-cyan-400'
                  }`}
                />
                <span className="text-slate-200 font-medium">{update.title}</span>
              </div>
              <span className="text-slate-400 text-[11px] font-mono shrink-0">{update.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
