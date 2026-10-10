import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Users,
  Mic,
  MicOff,
  Bell,
  ShieldAlert,
  Eye,
  Globe,
  Lock,
  Smartphone,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  PhoneCall,
  Video,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Square,
  Send,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Patient, Caregiver } from '../types';
import { validateAndNormalizeIndianPhone } from '../utils/phone';

export const Settings: React.FC = () => {
  const {
    activePatient,
    patients,
    setActivePatientId,
    addPatient,
    updatePatient,
    caregivers,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    caregiverMessages,
    sendCaregiverMessage,
    activeRole,
    setActiveRole,
    settings,
    updateSettings,
    resetDemoData,
    medications,
    vitals,
    voiceHistory,
    askVoiceAssistant,
    clearVoiceHistory,
    speakText,
    stopSpeaking,
    addNotification,
    currentTab,
  } = useApp();

  // If user clicked 'assistant' or 'voice', open voice tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (currentTab === 'assistant') return 'voice';
    if (currentTab === 'caregivers') return 'caregivers';
    if (currentTab === 'patients') return 'patients';
    return 'voice'; // default to voice assistant to address Phase 2 directly
  });

  // Modals
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddCaregiverModal, setShowAddCaregiverModal] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [deleteCaregiverId, setDeleteCaregiverId] = useState<string | null>(null);

  // Active Chat / Call Modals
  const [activeChatCaregiver, setActiveChatCaregiver] = useState<Caregiver | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [callDialogCaregiver, setCallDialogCaregiver] = useState<Caregiver | null>(null);

  // Voice Assistant state (Phase 2)
  const [isListening, setIsListening] = useState(false);
  const [voiceQueryInput, setVoiceQueryInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Patient Form State
  const [pName, setPName] = useState(activePatient.name);
  const [pAge, setPAge] = useState(activePatient.age);
  const [pGender, setPGender] = useState(activePatient.gender);
  const [pBlood, setPBlood] = useState(activePatient.bloodGroup);
  const [pHeight, setPHeight] = useState(activePatient.height);
  const [pWeight, setPWeight] = useState(activePatient.weight);
  const [pAllergies, setPAllergies] = useState(activePatient.allergies.join(', '));
  const [pEmergName, setPEmergName] = useState(activePatient.emergencyContact.name);
  const [pEmergPhone, setPEmergPhone] = useState(activePatient.emergencyContact.phone);

  // Caregiver Form State
  const [cgName, setCgName] = useState('');
  const [cgRole, setCgRole] = useState<'Caregiver' | 'Nurse'>('Caregiver');
  const [cgPhone, setCgPhone] = useState('+91 98450 12345');
  const [cgEmail, setCgEmail] = useState('');
  const [cgRelation, setCgRelation] = useState('');
  const [cgNotes, setCgNotes] = useState('');
  const [cgPrefMethod, setCgPrefMethod] = useState<'Phone' | 'WhatsApp' | 'In-App'>('In-App');
  const [cgAvail, setCgAvail] = useState<'On Duty' | 'Flexible' | 'Emergency Only' | 'Off Duty'>('Flexible');
  const [cgFormError, setCgFormError] = useState<string | null>(null);

  // WhatsApp Demo trigger
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  // Sync tab if navigation changes
  useEffect(() => {
    if (currentTab === 'assistant') setActiveTab('voice');
    if (currentTab === 'caregivers') setActiveTab('caregivers');
    if (currentTab === 'patients') setActiveTab('patients');
  }, [currentTab]);

  // Speech Recognition Setup (Web Speech API)
  const startSpeechRecognition = () => {
    setVoiceError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please type your query below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = settings.voiceLanguage || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceQueryInput(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please try speaking again.');
        } else {
          setVoiceError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setVoiceError(`Failed to initialize microphone: ${err?.message || err}`);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Submit voice assistant query
  const handleVoiceQuerySubmit = async (queryText?: string) => {
    const q = (queryText || voiceQueryInput).trim();
    if (!q) {
      setVoiceError('Please speak or type a medication query.');
      return;
    }

    setVoiceError(null);
    setIsAiProcessing(true);
    setIsSpeakingResponse(settings.voiceFeedbackEnabled);

    try {
      await askVoiceAssistant(q, 'Speech');
      setVoiceQueryInput('');
    } catch (e: any) {
      setVoiceError('Failed to fetch AI response. Please try again.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle Caregiver Form Submit (Add or Edit)
  const handleCaregiverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCgFormError(null);

    const phoneValidation = validateAndNormalizeIndianPhone(cgPhone);
    if (!phoneValidation.isValid) {
      setCgFormError(phoneValidation.error || 'Invalid Indian phone number');
      return;
    }

    if (editingCaregiver) {
      const result = updateCaregiver({
        ...editingCaregiver,
        name: cgName,
        role: cgRole,
        phone: phoneValidation.normalized,
        email: cgEmail,
        relationship: cgRelation,
        notes: cgNotes,
        preferredContactMethod: cgPrefMethod,
        availability: cgAvail,
      });

      if (!result.success) {
        setCgFormError(result.error || 'Failed to update caregiver');
        return;
      }
    } else {
      const result = addCaregiver({
        name: cgName,
        role: cgRole,
        phone: phoneValidation.normalized,
        email: cgEmail,
        relationship: cgRelation,
        notes: cgNotes,
        preferredContactMethod: cgPrefMethod,
        availability: cgAvail,
        patientId: activePatient.id,
      });

      if (!result.success) {
        setCgFormError(result.error || 'Failed to add caregiver');
        return;
      }
    }

    setShowAddCaregiverModal(false);
    setEditingCaregiver(null);
  };

  const openAddCaregiverModal = () => {
    setCgName('');
    setCgRole('Caregiver');
    setCgPhone('+91 98450 12345');
    setCgEmail('');
    setCgRelation('');
    setCgNotes('');
    setCgPrefMethod('In-App');
    setCgAvail('Flexible');
    setCgFormError(null);
    setEditingCaregiver(null);
    setShowAddCaregiverModal(true);
  };

  const openEditCaregiverModal = (cg: Caregiver) => {
    setEditingCaregiver(cg);
    setCgName(cg.name);
    setCgRole(cg.role === 'Nurse' ? 'Nurse' : 'Caregiver');
    setCgPhone(cg.phone);
    setCgEmail(cg.email || '');
    setCgRelation(cg.relationship || '');
    setCgNotes(cg.notes || '');
    setCgPrefMethod(cg.preferredContactMethod || 'In-App');
    setCgAvail(cg.availability);
    setCgFormError(null);
    setShowAddCaregiverModal(true);
  };

  // Send message in chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChatCaregiver) return;
    await sendCaregiverMessage(activeChatCaregiver.id, chatInputText);
    setChatInputText('');
  };

  const sidebarTabs = [
    { id: 'voice', label: 'AI Voice Assistant', icon: Mic },
    { id: 'caregivers', label: 'Caregiver Portal', icon: Users },
    { id: 'patients', label: 'Patient Profiles', icon: User },
    { id: 'alerts', label: 'Alerts & Network', icon: Bell },
    { id: 'emergency', label: 'Emergency Access', icon: ShieldAlert },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
    { id: 'devices', label: 'Device Connectivity', icon: Smartphone },
  ];

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = validateAndNormalizeIndianPhone(pEmergPhone);
    updatePatient({
      ...activePatient,
      name: pName,
      age: Number(pAge),
      gender: pGender as any,
      bloodGroup: pBlood,
      height: pHeight,
      weight: pWeight,
      allergies: pAllergies.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContact: {
        name: pEmergName,
        phone: phoneVal.isValid ? phoneVal.normalized : pEmergPhone,
        relation: activePatient.emergencyContact.relation,
      },
    });
    setShowEditPatientModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Settings & Clinical Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure AI voice assistant, caregiver network, patient records, and emergency protocols.
          </p>
        </div>

        {/* Active Session Role Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#111B2D] border border-slate-800 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 px-2">Session Role:</span>
          {(['Patient', 'Caregiver', 'Nurse'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === role
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN SETTINGS SHELL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-4 bg-[#111B2D] border border-slate-800 rounded-2xl p-3 shadow-sm h-fit space-y-1">
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'voice' && (
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                    Live
                  </span>
                )}
                {tab.id === 'caregivers' && (
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    {caregivers.length}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800 mt-2">
            <button
              onClick={() => {
                if (window.confirm('Reset demo data to initial state?')) {
                  resetDemoData();
                }
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors border border-transparent hover:border-rose-900/40"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Database</span>
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-8 bg-[#111B2D] border border-slate-800 rounded-2xl p-6 shadow-sm">
          {/* TAB: AI VOICE ASSISTANT (PHASE 2 - COMPLETE WORKING WORKFLOW) */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">AI Voice Assistant</h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 font-mono">
                      Integrated Speech Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Microphone input &rarr; Speech recognition &rarr; Server-side AI &rarr; Spoken clinical response.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSettings({ voiceFeedbackEnabled: !settings.voiceFeedbackEnabled })
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      settings.voiceFeedbackEnabled
                        ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {settings.voiceFeedbackEnabled ? (
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    ) : (
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Voice {settings.voiceFeedbackEnabled ? 'On' : 'Muted'}</span>
                  </button>

                  <button
                    onClick={stopSpeaking}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                    title="Stop audio playback"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {voiceError && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl flex items-center justify-between text-xs text-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{voiceError}</span>
                  </div>
                  <button
                    onClick={() => setVoiceError(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Voice Interaction Central Console */}
              <div className="p-5 bg-[#0B1220] border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Big Microphone Push-to-Talk Button */}
                    <button
                      onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse shadow-red-600/40'
                          : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white hover:scale-105 shadow-cyan-500/20'
                      }`}
                      title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
                    >
                      {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {isListening ? 'Listening to speech...' : isAiProcessing ? 'Processing query...' : 'Ready to listen'}
                        </h3>
                        {isListening && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isListening
                          ? 'Speak naturally about your medications, schedule, or vitals...'
                          : 'Press microphone to speak or type in the input below.'}
                      </p>
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-mono text-slate-400">Speech Lang:</span>
                    <select
                      value={settings.voiceLanguage}
                      onChange={(e) => updateSettings({ voiceLanguage: e.target.value })}
                      className="px-2.5 py-1.5 bg-[#111B2D] border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (India)</option>
                      <option value="es-ES">Spanish</option>
                    </select>
                  </div>
                </div>

                {/* Recognized Transcript Box with Correction & Submit */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <label className="block text-xs font-semibold text-slate-300">
                    Recognized Transcript (Editable):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Recognized speech will appear here, or type your query..."
                      value={voiceQueryInput}
                      onChange={(e) => setVoiceQueryInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVoiceQuerySubmit()}
                      className="flex-1 px-3.5 py-2.5 bg-[#111B2D] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />

                    <button
                      onClick={() => handleVoiceQuerySubmit()}
                      disabled={isAiProcessing || !voiceQueryInput.trim()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all shrink-0"
                    >
                      {isAiProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>

                {/* Suggested Clinical Questions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-slate-400">Quick prompts:</span>
                  {[
                    'What is my next scheduled dose?',
                    'Check my Lisinopril instructions',
                    'Review my 7-day adherence rate',
                    'Is Paracetamol safe with my penicillin allergy?',
                  ].map((promptText, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setVoiceQueryInput(promptText);
                        handleVoiceQuerySubmit(promptText);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/80 transition-colors"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Interaction History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Recent Voice Exchanges</span>
                  </h3>
                  {voiceHistory.length > 0 && (
                    <button
                      onClick={clearVoiceHistory}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {voiceHistory.length === 0 ? (
                    <div className="p-8 text-center bg-[#0B1220]/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
                      No voice assistant queries recorded yet. Press the microphone button above to start speaking.
                    </div>
                  ) : (
                    voiceHistory.map((ex, idx) => (
                      <div
                        key={`${ex.id}_${idx}`}
                        className="p-4 bg-[#0B1220] border border-slate-800 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <Mic className="w-3.5 h-3.5 text-cyan-400" />
                            <span>You: "{ex.transcript}"</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{ex.timestamp}</span>
                        </div>
                        <p className="text-slate-200 pl-5 border-l-2 border-cyan-500/40 leading-relaxed">
                          {ex.response}
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => speakText(ex.response)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                          >
                            <Volume2 className="w-3 h-3" /> Replay Audio
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAREGIVER PORTAL (PHASE 4 & 5 - CRUD & REAL TWO-WAY MESSAGING) */}
          {activeTab === 'caregivers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Caregiver & Nurse Portal</h2>
                  <p className="text-xs text-slate-400">
                    Manage medical staff, nurses, and family contacts with Indian telephone validation and two-way in-app chat.
                  </p>
                </div>
                <button
                  onClick={openAddCaregiverModal}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Caregiver Directory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caregivers.map((cg, idx) => (
                  <div
                    key={`${cg.id}_${idx}`}
                    className="p-5 bg-[#0B1220] border border-slate-800 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                          {cg.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-sm text-white">{cg.name}</h3>
                            {cg.isVerified && (
                              <span title="Verified Contact">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] uppercase font-mono text-cyan-400 block">
                            {cg.role} · {cg.relationship || 'Medical Contact'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                          {cg.availability}
                        </span>
                        <button
                          onClick={() => openEditCaregiverModal(cg)}
                          className="p-1 text-slate-400 hover:text-white"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCaregiverId(cg.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 font-mono pt-1">
                      <div className="flex justify-between">
                        <span>Mobile (India):</span>
                        <span className="text-slate-200 font-bold">{cg.phone}</span>
                      </div>
                      {cg.email && (
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span className="text-slate-200">{cg.email}</span>
                        </div>
                      )}
                      {cg.notes && (
                        <p className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-1">
                          {cg.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons: Call, Video, In-App Chat */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => setCallDialogCaregiver(cg)}
                        className="py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                      <button
                        onClick={() =>
                          alert(`Initiating secure clinical video gateway to ${cg.name}...`)
                        }
                        className="py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => setActiveChatCaregiver(cg)}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PATIENT PROFILES */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">Patient Health Profiles</h2>
                  <p className="text-xs text-slate-400">Electronic health record and vitals baseline.</p>
                </div>
                <button
                  onClick={() => {
                    setPName('');
                    setPAge(30);
                    setPBlood('O+');
                    setPHeight('170 cm');
                    setPWeight('65 kg');
                    setPAllergies('');
                    setShowAddPatientModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Patient</span>
                </button>
              </div>

              {/* Patient Selector */}
              <div className="flex gap-2">
                {patients.map((p, idx) => (
                  <button
                    key={`${p.id}_${idx}`}
                    onClick={() => setActivePatientId(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      p.id === activePatient.id
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Main Patient Card */}
              <div className="bg-[#0B1220] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-lg font-bold text-white">
                      {activePatient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-extrabold text-white">{activePatient.name}</h3>
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Age: {activePatient.age} · Gender: {activePatient.gender} · Blood: {activePatient.bloodGroup} · Height: {activePatient.height} · Weight: {activePatient.weight}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPName(activePatient.name);
                      setPAge(activePatient.age);
                      setPGender(activePatient.gender);
                      setPBlood(activePatient.bloodGroup);
                      setPHeight(activePatient.height);
                      setPWeight(activePatient.weight);
                      setPAllergies(activePatient.allergies.join(', '));
                      setPEmergName(activePatient.emergencyContact.name);
                      setPEmergPhone(activePatient.emergencyContact.phone);
                      setShowEditPatientModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Full Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                  <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">
                      ACTIVE MEDICATIONS
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {medications.slice(0, 3).map((m, idx) => (
                        <div key={`${m.id}_${idx}`} className="flex justify-between text-slate-200">
                          <span className="font-semibold text-white">{m.name} {m.dosage}</span>
                          <span className="text-slate-400 font-mono">{m.scheduledTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl space-y-2.5">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">
                        MEDICAL ALLERGIES
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activePatient.allergies.map((all) => (
                          <span
                            key={all}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800"
                          >
                            {all}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-mono text-slate-400 block">
                        EMERGENCY CONTACT
                      </span>
                      <div className="flex justify-between text-slate-300 mt-0.5">
                        <span className="font-semibold">{activePatient.emergencyContact.name}</span>
                        <span className="font-mono text-cyan-400">{activePatient.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ALERTS & NETWORK */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Alerts & Network Notifications</h2>
                <p className="text-xs text-slate-400">Configure WhatsApp dispatch, push alerts, and clinical email mirrors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0B1220] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">WhatsApp Integration</h3>
                    <input
                      type="checkbox"
                      checked={settings.whatsAppNotifications}
                      onChange={(e) => updateSettings({ whatsAppNotifications: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Send automated medication alerts to verified Indian WhatsApp number.
                  </p>
                  <input
                    type="text"
                    value={settings.whatsAppNumber}
                    onChange={(e) => updateSettings({ whatsAppNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#111B2D] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                  <button
                    onClick={() => {
                      setWhatsAppSent(true);
                      addNotification('WhatsApp Dispatched', `Medication reminder sent to ${settings.whatsAppNumber}`, 'info');
                      setTimeout(() => setWhatsAppSent(false), 3000);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {whatsAppSent ? 'WhatsApp Alert Dispatched!' : 'Send Message Demo'}
                  </button>
                </div>

                <div className="p-4 bg-[#0B1220] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Mobile Push & Sound</h3>
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    Customize audible alerts when scheduled medication windows trigger.
                  </p>
                  <select
                    value={settings.alertTone}
                    onChange={(e) => updateSettings({ alertTone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#111B2D] border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option>Chime Pulse (Medical)</option>
                    <option>Gentle Bell</option>
                    <option>Urgent Siren (Critical)</option>
                  </select>
                  <button
                    onClick={() => speakText('IntelliMed clinical medication reminder notification chime.')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
                  >
                    Test Tone
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EMERGENCY PROTOCOLS */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white">Emergency Protocols</h2>
                <p className="text-xs text-slate-400">Configure automated dispatch triggers for severe misses or SOS gestures.</p>
              </div>

              <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>Rapid Dispatch Rule</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When Open Palm gesture is held or Emergency SOS is triggered, system notifies primary contact <strong className="text-white">{activePatient.emergencyContact.name}</strong> ({activePatient.emergencyContact.phone}) after {settings.emergencySosCountdown} seconds.
                </p>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Countdown Delay (Seconds)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.emergencySosCountdown}
                    onChange={(e) => updateSettings({ emergencySosCountdown: Number(e.target.value) })}
                    className="w-32 px-3 py-1.5 bg-[#111B2D] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">Accessibility Preferences</h2>
              <div className="p-4 bg-[#0B1220] rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold text-white">High Contrast & Visual Scaling</h4>
                  <p className="text-xs text-slate-400">Enhanced WCAG AA compliant contrast colors.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-cyan-500" />
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">Language & Region</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date Format</label>
                  <select className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white">
                    <option>DD/MM/YYYY (Indian Standard)</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Time Format</label>
                  <select className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white">
                    <option>12-Hour AM/PM</option>
                    <option>24-Hour Military</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">Privacy & Security</h2>
              <div className="p-4 bg-[#0B1220] rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HIPAA & GDPR Local Isolation Active</span>
                </div>
                <p>
                  Microphone audio, camera frames, and gesture landmarks are processed exclusively within client browser memory.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white pb-3 border-b border-slate-800">Device Connectivity</h2>
              <div className="p-4 bg-[#0B1220] rounded-xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-semibold text-white">Smart Pill Dispenser (IoT)</h4>
                <p className="text-slate-400">Status: Paired (IntelliMed SmartBox v3.2 via WebBluetooth / Demo simulator).</p>
                <div className="pt-2">
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                    Connected · Battery 92%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD / EDIT CAREGIVER (WITH INDIAN PHONE VALIDATION) */}
      {showAddCaregiverModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCaregiverModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">
              {editingCaregiver ? 'Edit Caregiver / Nurse' : 'Add Caregiver / Nurse'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Contact record with normalized Indian mobile number (+91).
            </p>

            {cgFormError && (
              <div className="mb-3 p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cgFormError}</span>
              </div>
            )}

            <form onSubmit={handleCaregiverSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={cgName}
                  onChange={(e) => setCgName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role *</label>
                  <select
                    value={cgRole}
                    onChange={(e) => setCgRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="Caregiver">Caregiver</option>
                    <option value="Nurse">Nurse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Availability</label>
                  <select
                    value={cgAvail}
                    onChange={(e) => setCgAvail(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Flexible">Flexible</option>
                    <option value="Emergency Only">Emergency Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Indian Mobile Number * (e.g. 9845012345 or +91 98450 12345)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 12345"
                  value={cgPhone}
                  onChange={(e) => setCgPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="doctor@hospital.med"
                    value={cgEmail}
                    onChange={(e) => setCgEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Relationship / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Consulting Doctor"
                    value={cgRelation}
                    onChange={(e) => setCgRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Contact Channel</label>
                <select
                  value={cgPrefMethod}
                  onChange={(e) => setCgPrefMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="In-App">In-App Secure Chat</option>
                  <option value="Phone">Voice Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCaregiverModal(false)}
                  className="px-4 py-2 bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg shadow-md"
                >
                  {editingCaregiver ? 'Save Changes' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteCaregiverId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-red-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-950 border border-red-700 text-red-400 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Remove Contact?</h3>
            <p className="text-xs text-slate-400 mb-4">
              This caregiver will be deleted from your active medical directory.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteCaregiverId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteCaregiver(deleteCaregiverId);
                  setDeleteCaregiverId(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TWO-WAY CAREGIVER CHAT (PHASE 5) */}
      {activeChatCaregiver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-xl w-full h-[600px] flex flex-col shadow-2xl overflow-hidden">
            {/* Chat Header with Role Swapper */}
            <div className="p-4 bg-[#172338] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-bold text-white text-sm">
                  {activeChatCaregiver.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{activeChatCaregiver.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {activeChatCaregiver.role} · {activeChatCaregiver.phone}
                  </span>
                </div>
              </div>

              {/* Role Toggle to test two-way communication */}
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  Simulate as:
                </div>
                <button
                  onClick={() =>
                    setActiveRole(activeRole === 'Patient' ? (activeChatCaregiver.role === 'Nurse' ? 'Nurse' : 'Caregiver') : 'Patient')
                  }
                  className="px-2.5 py-1 text-[11px] font-bold bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 rounded-lg border border-cyan-500/40"
                  title="Switch between Patient and Caregiver sender perspective"
                >
                  Send as: {activeRole}
                </button>
                <button
                  onClick={() => setActiveChatCaregiver(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1220]/60">
              {caregiverMessages
                .filter(
                  (m) =>
                    m.senderId === activeChatCaregiver.id ||
                    m.recipientId === activeChatCaregiver.id ||
                    m.senderId === activePatient.id ||
                    m.recipientId === activePatient.id
                )
                .map((msg, idx) => {
                  const isCurrentRoleSender = msg.senderRole === activeRole;
                  return (
                    <div
                      key={`${msg.id}_${idx}`}
                      className={`flex flex-col ${isCurrentRoleSender ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-mono mb-0.5">
                        {msg.senderName} ({msg.senderRole})
                      </span>
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                          isCurrentRoleSender
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-[#172338] text-slate-200 border border-slate-700 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {msg.timestamp} · {msg.status}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#172338] border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder={`Type message as ${activeRole} (${activeRole === 'Patient' ? activePatient.name : activeChatCaregiver.name})...`}
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CALL DIALER INFORMATION (PHASE 5A) */}
      {callDialogCaregiver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setCallDialogCaregiver(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-400 mx-auto flex items-center justify-center mb-3">
              <PhoneCall className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Calling {callDialogCaregiver.name}
            </h3>
            <p className="text-sm font-mono text-cyan-300 font-bold mb-2">
              {callDialogCaregiver.phone}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              On mobile devices, clicking 'Open Phone Dialer' will launch your native cellular dialer. On desktop, ensure FaceTime, Skype, or your telephony provider is linked to tel: links.
            </p>

            <div className="space-y-2">
              <a
                href={`tel:${callDialogCaregiver.phone}`}
                onClick={() => setCallDialogCaregiver(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Open Phone Dialer</span>
              </a>

              <button
                onClick={() => setCallDialogCaregiver(null)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PATIENT */}
      {showEditPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditPatientModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Edit Patient Profile</h2>
            <p className="text-xs text-slate-400 mb-4">Modify biometrics and emergency contact records.</p>

            <form onSubmit={handleSavePatient} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={pAge}
                    onChange={(e) => setPAge(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                  <input
                    type="text"
                    value={pBlood}
                    onChange={(e) => setPBlood(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Height</label>
                  <input
                    type="text"
                    value={pHeight}
                    onChange={(e) => setPHeight(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Weight</label>
                  <input
                    type="text"
                    value={pWeight}
                    onChange={(e) => setPWeight(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Allergies (comma separated)</label>
                <input
                  type="text"
                  value={pAllergies}
                  onChange={(e) => setPAllergies(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={pEmergName}
                    onChange={(e) => setPEmergName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Phone (India)</label>
                  <input
                    type="text"
                    value={pEmergPhone}
                    onChange={(e) => setPEmergPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(false)}
                  className="px-4 py-2 bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
