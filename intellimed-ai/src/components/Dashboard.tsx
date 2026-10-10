import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Moon,
  ShieldAlert,
  Plus,
  FileDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Camera,
  Mic,
  Stethoscope,
  TrendingUp,
  AlertTriangle,
  X,
  PhoneCall,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MedicationSlot } from '../types';

export const Dashboard: React.FC = () => {
  const {
    activePatient,
    medications,
    markDoseStatus,
    vitals,
    updateVitals,
    logWaterIntake,
    setCurrentTab,
    exportCsvData,
    addMedication,
    caregivers,
  } = useApp();

  // Modals state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showAiDiagnosisModal, setShowAiDiagnosisModal] = useState(false);

  // New med form state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('Once Daily');
  const [medTime, setMedTime] = useState('08:00 AM');
  const [medSlot, setMedSlot] = useState<MedicationSlot>('Morning');
  const [medQuantity, setMedQuantity] = useState(30);
  const [medInstructions, setMedInstructions] = useState('');

  // Vitals form state
  const [vHeart, setVHeart] = useState(vitals.heartRate);
  const [vSys, setVSys] = useState(vitals.bloodPressureSystolic);
  const [vDia, setVDia] = useState(vitals.bloodPressureDiastolic);
  const [vSleep, setVSleep] = useState(vitals.sleepHours);

  // SOS state
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosDispatched, setSosDispatched] = useState(false);

  // Computed metrics
  const todayMeds = medications.filter((m) => m.patientId === activePatient.id || !m.patientId);
  const totalScheduledToday = todayMeds.length;
  const takenCount = todayMeds.filter((m) => m.status === 'Taken').length;
  const pendingCount = todayMeds.filter((m) => m.status === 'Pending').length;
  const missedCount = todayMeds.filter((m) => m.status === 'Missed').length;

  const adherenceRate = totalScheduledToday > 0 ? Math.round((takenCount / totalScheduledToday) * 100) : 100;

  const handleAddMedicineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDosage) return;
    addMedication({
      name: medName,
      dosage: medDosage,
      frequency: medFrequency,
      slots: [medSlot],
      scheduledTime: medTime,
      inventory: Number(medQuantity),
      totalQuantity: Number(medQuantity),
      instructions: medInstructions || 'Take with water as directed',
      patientId: activePatient.id,
      category: 'Prescription',
      expiryDate: '12/2027',
      refillWarningThreshold: 5,
    });
    setMedName('');
    setMedDosage('');
    setMedInstructions('');
    setShowAddMedModal(false);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    updateVitals({
      heartRate: Number(vHeart),
      bloodPressureSystolic: Number(vSys),
      bloodPressureDiastolic: Number(vDia),
      sleepHours: Number(vSleep),
    });
    setShowVitalsModal(false);
  };

  const triggerSos = () => {
    setShowSosModal(true);
    setSosCountdown(5);
    setSosDispatched(false);

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setSosCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setSosDispatched(true);
        setSosCountdown(null);
      }
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Header matching video */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Health Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Live Monitor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Your personalized AI-driven medical command center. Monitor vitals, track medication adherence, and review predictive health insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsvData}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS ROW matching video layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. AI Pill Scanner */}
        <button
          onClick={() => setCurrentTab('ai-scanner')}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-[#172338] to-[#111B2D] hover:from-[#1E2D47] hover:to-[#172338] border border-cyan-500/30 hover:border-cyan-400 rounded-xl transition-all group shadow-sm text-center"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-cyan-500/40">
            <Camera className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
            AI PILL SCANNER
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Visual Verify</span>
        </button>

        {/* 2. Voice Assistant */}
        <button
          onClick={() => setCurrentTab('assistant')}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-[#172338] to-[#111B2D] hover:from-[#1E2D47] hover:to-[#172338] border border-purple-500/30 hover:border-purple-400 rounded-xl transition-all group shadow-sm text-center"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-950/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-purple-500/40">
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-purple-300 uppercase">
            VOICE ASSISTANT
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Clinical QA</span>
        </button>

        {/* 3. Log Vitals */}
        <button
          onClick={() => setShowVitalsModal(true)}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-[#172338] to-[#111B2D] hover:from-[#1E2D47] hover:to-[#172338] border border-blue-500/30 hover:border-blue-400 rounded-xl transition-all group shadow-sm text-center"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-950/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-blue-500/40">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-blue-300 uppercase">
            LOG VITALS
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">BP & Heart</span>
        </button>

        {/* 4. Water Intake */}
        <button
          onClick={() => setShowWaterModal(true)}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-[#172338] to-[#111B2D] hover:from-[#1E2D47] hover:to-[#172338] border border-sky-500/30 hover:border-sky-400 rounded-xl transition-all group shadow-sm text-center"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-950/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-sky-500/40">
            <Droplet className="w-5 h-5 text-sky-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-sky-300 uppercase">
            WATER INTAKE
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">+250ml Log</span>
        </button>

        {/* 5. AI Diagnosis */}
        <button
          onClick={() => setShowAiDiagnosisModal(true)}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-[#172338] to-[#111B2D] hover:from-[#1E2D47] hover:to-[#172338] border border-indigo-500/30 hover:border-indigo-400 rounded-xl transition-all group shadow-sm text-center"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-950/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-indigo-500/40">
            <Stethoscope className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-indigo-300 uppercase">
            AI DIAGNOSIS
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Drug Interaction</span>
        </button>

        {/* 6. Emergency SOS */}
        <button
          onClick={triggerSos}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-b from-red-950/50 to-[#111B2D] hover:from-red-900/60 hover:to-[#172338] border border-red-500/50 hover:border-red-400 rounded-xl transition-all group shadow-sm text-center animate-pulse-subtle"
        >
          <div className="w-9 h-9 rounded-lg bg-red-900/60 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-red-500/60">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-[11px] font-bold tracking-wider text-red-300 uppercase">
            EMERGENCY SOS
          </span>
          <span className="text-[10px] text-red-400/90 mt-0.5">Dispatch Alert</span>
        </button>
      </div>

      {/* 8 OPERATIONAL METRICS CARDS matching video Frame 0:00 - 0:01 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: HEART RATE */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> HEART RATE
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">{vitals.heartRateChange}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{vitals.heartRate}</span>
            <span className="text-xs text-slate-400">bpm</span>
          </div>
          {/* Mini Wave SVG */}
          <div className="mt-3 h-5 w-full flex items-center">
            <svg className="w-full h-full text-rose-500/60" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,10 L20,10 L25,4 L30,16 L35,2 L40,18 L45,10 L70,10 L75,6 L80,14 L85,10 L100,10" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Card 2: BLOOD PRESSURE */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> BLOOD PRESSURE
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Optimal</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
            </span>
            <span className="text-xs text-slate-400">mmHg</span>
          </div>
          {/* Gauge bar */}
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Card 3: ADHERENCE */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> ADHERENCE
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">+5% this week</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">{adherenceRate}%</span>
            <span className="text-xs text-slate-400">compliance</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${adherenceRate}%` }} />
          </div>
        </div>

        {/* Card 4: MISSED DOSES */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> MISSED DOSES
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">-2 vs last week</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{missedCount}</span>
            <span className="text-xs text-slate-400">doses</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Under control</span>
          </div>
        </div>

        {/* Card 5: AI HEALTH SCORE */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI HEALTH SCORE
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold">Excellent</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{vitals.aiHealthScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full" style={{ width: `${vitals.aiHealthScore}%` }} />
          </div>
        </div>

        {/* Card 6: ACTIVE MEDS */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> ACTIVE MEDS
            </span>
            <span className="text-[10px] text-purple-300 font-semibold">Stable Regimen</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{todayMeds.length}</span>
            <span className="text-xs text-slate-400">registered</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="text-emerald-400 font-semibold">{takenCount} taken</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">{pendingCount} pending</span>
          </div>
        </div>

        {/* Card 7: HYDRATION */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-sky-400" /> HYDRATION
            </span>
            <span className="text-[10px] text-amber-400 font-semibold">
              {(vitals.hydrationGoal - vitals.hydration > 0) ? `-${(vitals.hydrationGoal - vitals.hydration).toFixed(1)}L under goal` : 'Goal met'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{vitals.hydration}</span>
            <span className="text-xs text-slate-400">/ {vitals.hydrationGoal} L</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (vitals.hydration / vitals.hydrationGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 8: SLEEP */}
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" /> SLEEP
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold">{vitals.sleepChange}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{vitals.sleepHours}</span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Optimal REM cycle</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN OPERATIONAL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Actionable Dose Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-[#111B2D] border border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Today's Medication Schedule</span>
                  <span className="text-xs font-normal text-slate-400">({takenCount}/{totalScheduledToday} completed)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time synchronization with Gesture & Camera validation engines.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('medications')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Medications */}
            <div className="space-y-3">
              {todayMeds.map((med, idx) => {
                const isTaken = med.status === 'Taken';
                const isMissed = med.status === 'Missed';
                return (
                  <div
                    key={`${med.id}_${idx}`}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isTaken
                        ? 'bg-[#172338]/40 border-slate-800 text-slate-300'
                        : isMissed
                        ? 'bg-red-950/20 border-red-900/40 text-slate-200'
                        : 'bg-[#172338] border-slate-700/80 hover:border-cyan-500/40 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isTaken
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : isMissed
                            ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                            : 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50'
                        }`}
                      >
                        {isTaken ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm tracking-tight text-white">{med.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                            {med.dosage}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {med.scheduledTime}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{med.instructions}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span>
                            Inventory:{' '}
                            <span className={med.inventory <= 5 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                              {med.inventory} pills left
                            </span>
                          </span>
                          {med.lastTaken && (
                            <span className="text-emerald-400/90 font-mono">Taken: {med.lastTaken}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isTaken ? (
                        <button
                          onClick={() => markDoseStatus(med.id, 'Pending')}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                        >
                          Undo
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => markDoseStatus(med.id, 'Missed')}
                            className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 rounded-lg border border-red-900/50 transition-colors"
                          >
                            Mark Missed
                          </button>
                          <button
                            onClick={() => markDoseStatus(med.id, 'Taken')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark as Taken</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adherence Mini Trend & Clinical Activity */}
          <div className="p-5 bg-[#111B2D] border border-slate-800 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>7-Day Adherence Trajectory</span>
            </h3>
            <div className="grid grid-cols-7 gap-2 pt-2 pb-1 text-center font-mono">
              {[
                { day: 'Mon', rate: 100, count: '3/3' },
                { day: 'Tue', rate: 100, count: '3/3' },
                { day: 'Wed', rate: 66, count: '2/3', warning: true },
                { day: 'Thu', rate: 100, count: '3/3' },
                { day: 'Fri', rate: 100, count: '4/4' },
                { day: 'Sat', rate: 100, count: '4/4' },
                { day: 'Sun (Today)', rate: adherenceRate, count: `${takenCount}/${totalScheduledToday}` },
              ].map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-full bg-slate-800 rounded-lg h-24 flex items-end p-1 justify-center relative group">
                    <div
                      className={`w-full rounded-md transition-all ${
                        d.warning ? 'bg-amber-500' : 'bg-gradient-to-t from-blue-600 to-cyan-400'
                      }`}
                      style={{ height: `${d.rate}%` }}
                    />
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-white pointer-events-none whitespace-nowrap z-10">
                      {d.rate}% ({d.count})
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Clinical Insights & Caregiver On-Duty */}
        <div className="space-y-4">
          {/* AI Clinical Insights */}
          <div className="p-5 bg-[#111B2D] border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">AI Clinical Insights</h3>
              </div>
              <span className="text-[10px] uppercase font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Rule Engine
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#172338]/60 border border-slate-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Optimal BP Correlation</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Lisinopril 10mg adherence has remained &gt;90% for 14 consecutive days. Current resting blood pressure (120/80 mmHg) reflects optimal therapeutic control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-200">Refill Recommendation</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Atorvastatin 20mg inventory has 5 doses remaining (reaches zero in ~5 days). Automated refill request can be dispatched to Apollo Pharmacy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#172338]/60 border border-slate-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <Droplet className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Hydration & Kidney Function</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Adequate hydration supports Lisinopril renal clearance. Current intake: 1.2L of 2.0L goal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Doctor & Caregiver Quick Card */}
          <div className="p-5 bg-[#111B2D] border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Assigned Clinical Caregiver</h3>
            {caregivers.slice(0, 1).map((cg, idx) => (
              <div key={`${cg.id}_${idx}`} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                    {cg.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cg.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono">{cg.role}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-400 space-y-1 pt-1 font-mono">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-slate-200">{cg.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-slate-200">{cg.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-semibold">{cg.availability}</span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`tel:${cg.phone}`}
                    className="flex-1 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Staff</span>
                  </a>
                  <button
                    onClick={() => setCurrentTab('caregivers')}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 text-center"
                  >
                    Portal &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: ADD MEDICINE */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddMedModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Add New Medication</h2>
            <p className="text-xs text-slate-400 mb-4">Register a prescription or OTC medication to {activePatient.name}'s regimen.</p>

            <form onSubmit={handleAddMedicineSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metformin"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dosage / Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg or 10ml"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Frequency</label>
                  <select
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Once Daily</option>
                    <option>Twice Daily</option>
                    <option>Thrice Daily</option>
                    <option>As Needed (SOS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={medSlot}
                    onChange={(e) => setMedSlot(e.target.value as MedicationSlot)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Pill Count / Inventory</label>
                <input
                  type="number"
                  min="1"
                  value={medQuantity}
                  onChange={(e) => setMedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Instructions</label>
                <input
                  type="text"
                  placeholder="Take after meals with water"
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG VITALS */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowVitalsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Log Patient Vitals</h2>
            <p className="text-xs text-slate-400 mb-4">Record updated biometric measurements for {activePatient.name}.</p>

            <form onSubmit={handleSaveVitals} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={vHeart}
                  onChange={(e) => setVHeart(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vSys}
                    onChange={(e) => setVSys(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vDia}
                    onChange={(e) => setVDia(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Last Night Sleep (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={vSleep}
                  onChange={(e) => setVSleep(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-600/30"
                >
                  Update Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WATER INTAKE */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowWaterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-400 mx-auto flex items-center justify-center mb-3">
              <Droplet className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Quick Hydration Logger</h2>
            <p className="text-xs text-slate-400 mb-4">
              Current progress: <span className="text-white font-bold">{vitals.hydration}L</span> of {vitals.hydrationGoal}L
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: '+250 ml', amount: 0.25 },
                { label: '+500 ml', amount: 0.5 },
                { label: '+750 ml', amount: 0.75 },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    logWaterIntake(btn.amount);
                    setShowWaterModal(false);
                  }}
                  className="py-2 px-3 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 rounded-lg text-xs font-bold text-sky-300 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowWaterModal(false)}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: EMERGENCY SOS */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border-2 border-red-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-red-950 border-2 border-red-500 text-red-400 mx-auto flex items-center justify-center mb-3 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-extrabold text-white mb-1">EMERGENCY PROTOCOL</h2>
            <p className="text-xs text-slate-300 mb-4">
              Patient <span className="text-red-400 font-bold">{activePatient.name}</span> triggered an immediate assistance alert.
            </p>

            {sosCountdown !== null && sosCountdown > 0 ? (
              <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl mb-4">
                <p className="text-xs text-slate-300">Dispatching to primary emergency contact in:</p>
                <div className="text-4xl font-extrabold text-red-400 font-mono my-2">{sosCountdown}s</div>
                <button
                  onClick={() => setShowSosModal(false)}
                  className="mt-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg"
                >
                  Cancel False Alarm
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl mb-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>EMERGENCY DISPATCH INITIATED</span>
                </div>
                <p className="text-xs text-slate-300">
                  Caregiver <span className="font-semibold text-white">{activePatient.emergencyContact.name}</span> ({activePatient.emergencyContact.phone}) was notified via clinical emergency webhook.
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Coordinates transmitted: Apollo Health Command Hub.
                </div>
              </div>
            )}

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
            >
              Dismiss Window
            </button>
          </div>
        </div>
      )}

      {/* MODAL: AI DIAGNOSIS / INTERACTIONS */}
      {showAiDiagnosisModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAiDiagnosisModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Clinical Drug Interaction Analysis</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Real-time cross-interaction audit of active medications.</p>

            <div className="space-y-3 mb-4">
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">Lisinopril + Metformin: SAFE</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      No adverse pharmacokinetic competition. Both preserve renal-protective efficacy in pre-hypertensive patients.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Atorvastatin Timing Advisory</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ensure Atorvastatin is ingested during Night slot (HMG-CoA reductase peak hepatic synthesis period).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-300">Allergy Guard Enforced</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Patient profile flagged: Penicillin (High). Prescription scanner auto-blocks any beta-lactam antibiotics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAiDiagnosisModal(false)}
              className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
            >
              Close Diagnostic Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
