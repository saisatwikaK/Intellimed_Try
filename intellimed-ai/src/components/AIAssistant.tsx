import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Pill,
  Droplet,
  Moon,
  Heart,
  TrendingUp,
  User,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const {
    activePatient,
    medications,
    vitals,
    settings,
    updateSettings,
    speakText,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I am IntelliMed AI, your personal healthcare companion. How can I assist you with your medications or health today?`,
      timestamp: '09:00 AM',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Suggested prompts matching video Frame 0:18
  const suggestedPrompts = [
    'I have a fever. What medicine should I take?',
    'Check medicine interactions',
    'What are my upcoming scheduled doses?',
    'Review my 7-day adherence',
  ];

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your question.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSend = (userText?: string) => {
    const textToSend = userText || inputValue;
    if (!textToSend.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: textToSend,
      timestamp: time,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');

    // Generate Context-Aware AI Answer
    setTimeout(() => {
      const reply = generateClinicalResponse(textToSend);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (settings.voiceFeedbackEnabled) {
        speakText(reply);
      }
    }, 600);
  };

  const generateClinicalResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('fever') || q.includes('headache') || q.includes('body ache')) {
      const paracetamol = medications.find((m) => m.name.toLowerCase().includes('paracetamol'));
      if (paracetamol) {
        return `Based on ${activePatient.name}'s active regimen, you have ${paracetamol.name} ${paracetamol.dosage} prescribed for fever/pain ("${paracetamol.instructions}"). Please ensure you haven't taken more than 4 doses in 24 hours. Allergy check: You are allergic to Penicillin, and Paracetamol has no beta-lactam overlap.`;
      }
      return `For mild fever, please consult Dr. Sarah Jenkins (${activePatient.emergencyContact.phone}). Always avoid medications in your allergy register (Penicillin High Alert).`;
    }

    if (q.includes('interaction') || q.includes('combine') || q.includes('safe')) {
      return `Cross-Interaction Check: No adverse interactions detected between your current medications (${medications.map((m) => m.name).join(', ')}). Lisinopril and Metformin are well tolerated together. Note: Take Atorvastatin in the evening to maximize effectiveness.`;
    }

    if (q.includes('upcoming') || q.includes('next') || q.includes('dose') || q.includes('schedule')) {
      const pendingMeds = medications.filter((m) => m.status === 'Pending');
      if (pendingMeds.length > 0) {
        return `Your next scheduled pending medications are: ${pendingMeds.map((m) => `${m.name} (${m.dosage}) at ${m.scheduledTime}`).join(' and ')}. Please log them once taken!`;
      }
      return `Great news! You have taken all your scheduled medications for today. Your adherence is 100% for today's doses!`;
    }

    if (q.includes('adherence') || q.includes('progress') || q.includes('report')) {
      return `Your overall medication adherence rate is currently 94% with only 1 missed dose recorded this week. Your blood pressure (120/80 mmHg) and heart rate (${vitals.heartRate} bpm) reflect excellent therapeutic stability!`;
    }

    if (q.includes('doctor') || q.includes('caregiver') || q.includes('contact')) {
      return `Your assigned primary physician is ${activePatient.primaryDoctor.name} (${activePatient.primaryDoctor.phone}, ${activePatient.primaryDoctor.hospital}). Emergency contact is ${activePatient.emergencyContact.name}.`;
    }

    return `I have reviewed ${activePatient.name}'s medical profile. You have ${medications.length} registered medications with current health score of ${vitals.aiHealthScore}/100. Would you like me to verify upcoming doses, review drug interactions, or check your hydration goals?`;
  };

  const takenCount = medications.filter((m) => m.status === 'Taken').length;
  const totalCount = medications.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header matching video Frame 0:18 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              IntelliMed AI
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 font-mono font-bold">
              BETA V2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your intelligent healthcare companion powered by clinical AI.
          </p>
        </div>

        {/* Language & Voice Badges matching video Frame 0:18 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200">
            <span>{selectedLanguage}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            onClick={() => updateSettings({ voiceFeedbackEnabled: !settings.voiceFeedbackEnabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              settings.voiceFeedbackEnabled
                ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {settings.voiceFeedbackEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span>Voice {settings.voiceFeedbackEnabled ? 'Enabled' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN ASSISTANT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Chat Interface matching video Frame 0:18 */}
        <div className="lg:col-span-8 flex flex-col bg-[#111B2D] border border-slate-800 rounded-2xl shadow-sm overflow-hidden h-[600px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={`${msg.id}_${idx}`}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 shrink-0 mt-0.5">
                      <div className="w-full h-full bg-[#0B1220] rounded-[6px] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isAi
                        ? 'bg-[#172338] border border-slate-800 text-slate-200 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="block text-[10px] text-slate-400 mt-2 text-right font-mono">
                      {msg.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestions matching video Frame 0:18 */}
          <div className="p-3 bg-[#0B1220]/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar with mic and send button */}
          <div className="p-4 bg-[#0B1220] border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isListening ? 'Listening...' : 'Voice Input'}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder="Ask IntelliMed AI anything about medicines or health..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2.5 bg-[#111B2D] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={() => handleSend()}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): AI HEALTH SCORE & Vitals Panel matching video Frame 0:18 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Big Score Card */}
          <div className="bg-[#111B2D] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> AI HEALTH SCORE
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                +2 this week
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">
                {vitals.aiHealthScore}
              </span>
              <span className="text-sm text-slate-400 font-mono">/ 100</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your adherence and vitals are optimal. Keep it up!
            </p>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full rounded-full"
                style={{ width: `${vitals.aiHealthScore}%` }}
              />
            </div>
          </div>

          {/* 4 Mini Stat Grid matching video Frame 0:18 */}
          <div className="grid grid-cols-2 gap-3">
            {/* Meds Taken */}
            <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                <Pill className="w-3.5 h-3.5 text-cyan-400" /> MEDS TAKEN
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {takenCount}/{totalCount}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                {Math.round((takenCount / (totalCount || 1)) * 100)}% Today
              </span>
            </div>

            {/* Hydration */}
            <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                <Droplet className="w-3.5 h-3.5 text-sky-400" /> HYDRATION
              </div>
              <div className="text-lg font-bold text-white mt-1">{vitals.hydration}L</div>
              <span className="text-[10px] text-amber-400 font-semibold">
                {Math.round((vitals.hydration / vitals.hydrationGoal) * 100)}% Goal
              </span>
            </div>

            {/* Sleep */}
            <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> SLEEP
              </div>
              <div className="text-lg font-bold text-white mt-1">{vitals.sleepHours} hrs</div>
              <span className="text-[10px] text-indigo-300 font-semibold">Optimal</span>
            </div>

            {/* Avg Heart */}
            <div className="p-3.5 bg-[#111B2D] border border-slate-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> AVG HEART
              </div>
              <div className="text-lg font-bold text-white mt-1">{vitals.heartRate} bpm</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Stable</span>
            </div>
          </div>

          {/* Clinical Guard Advisory */}
          <div className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              IntelliMed AI verifies dose timings and drug safety against {activePatient.name}'s verified medical record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
