import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Medication,
  Patient,
  Caregiver,
  MedicationLogEntry,
  GestureDetectionEvent,
  ScanResult,
  AppNotification,
  UserVitals,
  AppSettings,
  MedicationSlot,
  StockAdjustment,
  CaregiverMessage,
  VoiceAssistantExchange,
  YoloModelInfo,
} from '../types';
import { validateAndNormalizeIndianPhone } from '../utils/phone';

interface AppContextType {
  // Auth & Roles
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; role: string } | null;
  activeRole: 'Patient' | 'Caregiver' | 'Nurse';
  setActiveRole: (role: 'Patient' | 'Caregiver' | 'Nurse') => void;
  activeCaregiverId: string;
  setActiveCaregiverId: (id: string) => void;
  loginDemo: (role?: 'Patient' | 'Caregiver' | 'Nurse') => void;
  logout: () => void;

  // Active navigation
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Patient
  patients: Patient[];
  activePatient: Patient;
  setActivePatientId: (id: string) => void;
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (patient: Patient) => void;

  // Caregivers
  caregivers: Caregiver[];
  addCaregiver: (caregiver: Omit<Caregiver, 'id'>) => { success: boolean; error?: string };
  updateCaregiver: (caregiver: Caregiver) => { success: boolean; error?: string };
  deleteCaregiver: (id: string) => { success: boolean; error?: string };

  // Two-way messaging
  caregiverMessages: CaregiverMessage[];
  sendCaregiverMessage: (recipientId: string, text: string) => Promise<CaregiverMessage>;
  markMessagesRead: (conversationId: string) => void;

  // Medications
  medications: Medication[];
  addMedication: (med: Omit<Medication, 'id' | 'status'>) => void;
  updateMedication: (med: Medication) => void;
  deleteMedication: (id: string) => void;
  markDoseStatus: (id: string, status: 'Taken' | 'Pending' | 'Missed', note?: string) => void;

  // Inventory & Stock Refill Tracking
  stockAdjustments: StockAdjustment[];
  adjustStock: (medicationId: string, change: number, reason: StockAdjustment['reason'], notes?: string) => void;

  // Vitals
  vitals: UserVitals;
  updateVitals: (updates: Partial<UserVitals>) => void;
  logWaterIntake: (amountLiters: number) => void;

  // Logs & History
  medicationLogs: MedicationLogEntry[];
  addMedicationLog: (entry: Omit<MedicationLogEntry, 'id'>) => void;

  gestureLogs: GestureDetectionEvent[];
  addGestureEvent: (gesture: 'OPEN PALM' | 'CLOSED FIST' | 'THUMBS UP' | 'PINCH / OK', action: string, confidence: number) => void;

  scanHistory: ScanResult[];
  addScanResult: (scan: Omit<ScanResult, 'id' | 'timestamp'>) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;

  // Voice Assistant in Settings
  voiceHistory: VoiceAssistantExchange[];
  askVoiceAssistant: (query: string, source?: 'Speech' | 'Text') => Promise<string>;
  clearVoiceHistory: () => void;

  // YOLO ML Pipeline Info
  yoloModel: YoloModelInfo;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Utilities
  resetDemoData: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  exportCsvData: () => void;
}

// Unique ID Generator preventing duplicate React keys
let idCounter = 0;
export const generateUniqueId = (prefix: string = 'id'): string => {
  idCounter = (idCounter + 1) % 1000000;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random().toString(36).substring(2, 7)}`;
};

export const deduplicateById = <T extends { id: string }>(items: T[], prefix: string): T[] => {
  const seen = new Set<string>();
  return items.map((item, index) => {
    if (!item.id || seen.has(item.id)) {
      const uniqueId = generateUniqueId(`${prefix}_${index}`);
      seen.add(uniqueId);
      return { ...item, id: uniqueId };
    }
    seen.add(item.id);
    return item;
  });
};

const STORAGE_KEY = 'intellimed_ai_store_v2';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Kavya TS',
    age: 24,
    gender: 'Female',
    bloodGroup: 'O+',
    height: '165 cm',
    weight: '55 kg',
    allergies: ['Penicillin (High)'],
    medicalConditions: ['Hypertension (Stage 1)', 'Mild Asthma'],
    emergencyContact: {
      name: 'Dr. Sarah Jenkins',
      phone: '+919845012345',
      relation: 'Primary Cardiologist',
    },
    primaryDoctor: {
      name: 'Dr. Sarah Jenkins',
      specialty: 'Cardiologist',
      phone: '+919845012345',
      hospital: 'Apollo Med Clinic, Bangalore',
    },
  },
  {
    id: 'p2',
    name: 'Robert Vance',
    age: 68,
    gender: 'Male',
    bloodGroup: 'A+',
    height: '178 cm',
    weight: '82 kg',
    allergies: ['Sulfa Drugs'],
    medicalConditions: ['Type 2 Diabetes', 'Coronary Artery Disease'],
    emergencyContact: {
      name: 'Linda Vance',
      phone: '+919845199999',
      relation: 'Spouse',
    },
    primaryDoctor: {
      name: 'Dr. Sarah Jenkins',
      specialty: 'Cardiologist',
      phone: '+919845012345',
      hospital: 'Apollo Med Clinic, Bangalore',
    },
  },
];

const INITIAL_CAREGIVERS: Caregiver[] = [
  {
    id: 'cg1',
    name: 'Dr. Sarah Jenkins',
    role: 'Caregiver',
    phone: '+919845012345',
    email: 's.jenkins@apollo.med',
    relationship: 'Consulting Cardiologist',
    notes: 'Primary physician. Available for urgent teleconsultations 8am-8pm.',
    preferredContactMethod: 'In-App',
    availability: 'Flexible',
    patientId: 'p1',
    isVerified: true,
  },
  {
    id: 'cg2',
    name: 'Nurse Priya Nair',
    role: 'Nurse',
    phone: '+919845123456',
    email: 'p.nair@apollo.med',
    relationship: 'Clinical Nurse Specialist',
    notes: 'Home care visit and vitals monitoring specialist.',
    preferredContactMethod: 'In-App',
    availability: 'On Duty',
    patientId: 'p1',
    isVerified: true,
  },
  {
    id: 'cg3',
    name: 'Rajesh TS',
    role: 'Caregiver',
    phone: '+919845234567',
    email: 'rajesh.ts@mail.com',
    relationship: 'Father / Guardian',
    notes: 'Primary emergency contact. Resides locally.',
    preferredContactMethod: 'Phone',
    availability: 'Emergency Only',
    patientId: 'p1',
    isVerified: true,
  },
];

const INITIAL_MESSAGES: CaregiverMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_p1_cg1',
    senderId: 'cg1',
    senderName: 'Dr. Sarah Jenkins',
    senderRole: 'Caregiver',
    recipientId: 'p1',
    recipientName: 'Kavya TS',
    text: 'Good morning Kavya, I reviewed your 7-day adherence report. Your blood pressure has stabilized at 120/80 mmHg. Continue Lisinopril 10mg with breakfast.',
    timestamp: '15 May 2026, 08:30 AM',
    status: 'delivered',
  },
  {
    id: 'msg_2',
    conversationId: 'conv_p1_cg1',
    senderId: 'p1',
    senderName: 'Kavya TS',
    senderRole: 'Patient',
    recipientId: 'cg1',
    recipientName: 'Dr. Sarah Jenkins',
    text: 'Thank you Dr. Jenkins. I took my morning dose at 08:05 AM and logged it through the gesture confirmation system.',
    timestamp: '15 May 2026, 08:35 AM',
    status: 'read',
  },
  {
    id: 'msg_3',
    conversationId: 'conv_p1_cg2',
    senderId: 'cg2',
    senderName: 'Nurse Priya Nair',
    senderRole: 'Nurse',
    recipientId: 'p1',
    recipientName: 'Kavya TS',
    text: 'Hello Kavya, please remember to keep hydrated today with your evening medications. Let me know if you need any assistance.',
    timestamp: '15 May 2026, 09:15 AM',
    status: 'delivered',
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'm1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once Daily',
    slots: ['Morning'],
    scheduledTime: '08:00 AM',
    inventory: 14,
    totalQuantity: 30,
    unit: 'tablets',
    batchNumber: 'LSP-2026-08',
    instructions: 'Take with full glass of water after breakfast',
    patientId: 'p1',
    status: 'Taken',
    lastTaken: 'Today, 08:05 AM',
    category: 'Prescription',
    expiryDate: '12/2027',
    refillWarningThreshold: 7,
  },
  {
    id: 'm2',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once Daily',
    slots: ['Night'],
    scheduledTime: '08:00 PM',
    inventory: 5,
    totalQuantity: 30,
    unit: 'tablets',
    batchNumber: 'ATV-2025-11',
    instructions: 'Take at bedtime with water',
    patientId: 'p1',
    status: 'Pending',
    category: 'Prescription',
    expiryDate: '09/2027',
    refillWarningThreshold: 7,
  },
  {
    id: 'm3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice Daily',
    slots: ['Afternoon', 'Night'],
    scheduledTime: '01:00 PM',
    inventory: 20,
    totalQuantity: 60,
    unit: 'tablets',
    batchNumber: 'MET-2026-03',
    instructions: 'Take during or immediately after meals',
    patientId: 'p1',
    status: 'Taken',
    lastTaken: 'Today, 01:10 PM',
    category: 'Prescription',
    expiryDate: '04/2027',
    refillWarningThreshold: 10,
  },
  {
    id: 'm4',
    name: 'Paracetamol',
    dosage: '650mg',
    frequency: 'As Needed (SOS)',
    slots: ['Morning'],
    scheduledTime: '09:00 AM',
    inventory: 18,
    totalQuantity: 20,
    unit: 'tablets',
    batchNumber: 'PCM-2027-01',
    instructions: 'Take for fever / headache after light food',
    patientId: 'p1',
    status: 'Taken',
    lastTaken: 'Today, 09:00 AM',
    category: 'OTC',
    expiryDate: '11/2028',
    refillWarningThreshold: 5,
  },
  {
    id: 'm5',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once Daily',
    slots: ['Night'],
    scheduledTime: '09:00 PM',
    inventory: 24,
    totalQuantity: 30,
    unit: 'tablets',
    batchNumber: 'AML-2026-05',
    instructions: 'Take in the evening. Avoid grapefruit juice',
    patientId: 'p1',
    status: 'Pending',
    category: 'Prescription',
    expiryDate: '06/2027',
    refillWarningThreshold: 7,
  },
];

const INITIAL_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: 'adj_1',
    medicationId: 'm1',
    medicineName: 'Lisinopril 10mg',
    date: '15 May 2026',
    change: -1,
    reason: 'Dose Taken',
    notes: 'Morning dose logged at 08:05 AM',
    balanceAfter: 14,
  },
  {
    id: 'adj_2',
    medicationId: 'm3',
    medicineName: 'Metformin 500mg',
    date: '15 May 2026',
    change: -1,
    reason: 'Dose Taken',
    notes: 'Afternoon dose logged at 01:10 PM',
    balanceAfter: 20,
  },
  {
    id: 'adj_3',
    medicationId: 'm2',
    medicineName: 'Atorvastatin 20mg',
    date: '10 May 2026',
    change: 30,
    reason: 'Restock',
    notes: 'Monthly prescription refill received from Apollo Pharmacy',
    balanceAfter: 10,
  },
];

const INITIAL_MEDICATION_LOGS: MedicationLogEntry[] = [
  {
    id: 'l1',
    date: '15 May 2026',
    medicine: 'Paracetamol',
    dosage: '650mg',
    scheduledTime: '09:00 AM',
    status: 'Taken',
    notes: 'Taken with water',
    timestamp: '09:00 AM',
  },
  {
    id: 'l2',
    date: '15 May 2026',
    medicine: 'Metformin',
    dosage: '500mg',
    scheduledTime: '01:00 PM',
    status: 'Taken',
    notes: 'Taken after lunch',
    timestamp: '01:10 PM',
  },
  {
    id: 'l3',
    date: '15 May 2026',
    medicine: 'Lisinopril',
    dosage: '10mg',
    scheduledTime: '08:00 AM',
    status: 'Taken',
    notes: 'Taken on schedule',
    timestamp: '08:05 AM',
  },
  {
    id: 'l4',
    date: '15 May 2026',
    medicine: 'Amlodipine',
    dosage: '5mg',
    scheduledTime: '09:00 PM',
    status: 'Pending',
    notes: 'Pending evening schedule',
    timestamp: 'Upcoming',
  },
  {
    id: 'l5',
    date: '15 May 2026',
    medicine: 'Atorvastatin',
    dosage: '20mg',
    scheduledTime: '08:00 PM',
    status: 'Pending',
    notes: 'Scheduled for tonight',
    timestamp: 'Upcoming',
  },
];

const INITIAL_GESTURE_LOGS: GestureDetectionEvent[] = [
  {
    id: 'g1',
    timestamp: '15 May 2026, 09:00:14',
    gesture: 'PINCH / OK',
    actionRoutine: 'CONFIRM: Logged Paracetamol 650mg intake via OK sign',
    confidence: 96.4,
    systemStatus: 'EXECUTED',
  },
  {
    id: 'g2',
    timestamp: '15 May 2026, 08:59:45',
    gesture: 'THUMBS UP',
    actionRoutine: 'NEXT: Highlighted Paracetamol on medicine deck',
    confidence: 94.1,
    systemStatus: 'SUCCESS',
  },
];

const INITIAL_SCAN_HISTORY: ScanResult[] = [
  {
    id: 's1',
    timestamp: '15 May 2026, 08:58 AM',
    medicineName: 'Paracetamol',
    dosage: '650mg',
    confidence: 98.2,
    matchingPrescription: true,
    notes: 'Verified against current profile medication list',
    source: 'Camera',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Low Stock Alert',
    message: 'Atorvastatin 20mg inventory has only 5 pills left. Below threshold (7). Request refill.',
    time: '10 mins ago',
    type: 'urgent',
    read: false,
  },
  {
    id: 'n2',
    title: 'Dose Completed',
    message: 'Paracetamol 650mg was logged via Gesture Recognition at 09:00 AM.',
    time: '25 mins ago',
    type: 'success',
    read: false,
  },
];

const INITIAL_VITALS: UserVitals = {
  heartRate: 72,
  heartRateChange: '+2% normal',
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  hydration: 1.2,
  hydrationGoal: 2.0,
  sleepHours: 7.5,
  sleepChange: '+1.2h vs avg',
  aiHealthScore: 98,
};

const INITIAL_SETTINGS: AppSettings = {
  voiceFeedbackEnabled: true,
  voiceLanguage: 'en-US',
  soundAlerts: true,
  cameraDeviceId: 'default',
  autoLogDoseOnGesture: false,
  gestureSensitivity: 'High',
  whatsAppNotifications: true,
  whatsAppNumber: '+919845012345',
  emailAlerts: true,
  emailAddress: 'patient@hospital.med',
  pushNotifications: true,
  alertTone: 'Chime Pulse (Medical)',
  emergencySosCountdown: 5,
};

const INITIAL_VOICE_HISTORY: VoiceAssistantExchange[] = [
  {
    id: 'vh_1',
    transcript: 'What is my next scheduled dose?',
    response: 'Your next scheduled dose is Atorvastatin 20mg at 08:00 PM tonight. Lisinopril 10mg was taken at 08:05 AM.',
    timestamp: '15 May 2026, 09:05 AM',
    source: 'Speech',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Active Session Role
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auth`);
    return saved ? JSON.parse(saved) : true;
  });

  const [activeRole, setActiveRole] = useState<'Patient' | 'Caregiver' | 'Nurse'>('Patient');
  const [activeCaregiverId, setActiveCaregiverId] = useState<string>('cg1');

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(() => {
    return {
      name: 'Kavya TS',
      email: 'kavya.ts@apollo.med',
      role: 'Patient (Demo Access)',
    };
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Patients
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'p');
      }
    } catch {}
    return deduplicateById(INITIAL_PATIENTS, 'p');
  });
  const [activePatientId, setActivePatientId] = useState<string>('p1');

  // Caregivers
  const [caregivers, setCaregivers] = useState<Caregiver[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_caregivers`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'cg');
      }
    } catch {}
    return deduplicateById(INITIAL_CAREGIVERS, 'cg');
  });

  // Two-way messages
  const [caregiverMessages, setCaregiverMessages] = useState<CaregiverMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'msg');
      }
    } catch {}
    return deduplicateById(INITIAL_MESSAGES, 'msg');
  });

  // Medications
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_medications`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'm');
      }
    } catch {}
    return deduplicateById(INITIAL_MEDICATIONS, 'm');
  });

  // Stock Adjustments
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stock_adj`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'adj');
      }
    } catch {}
    return deduplicateById(INITIAL_STOCK_ADJUSTMENTS, 'adj');
  });

  // Vitals
  const [vitals, setVitals] = useState<UserVitals>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vitals`);
    return saved ? JSON.parse(saved) : INITIAL_VITALS;
  });

  // Logs
  const [medicationLogs, setMedicationLogs] = useState<MedicationLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'l');
      }
    } catch {}
    return deduplicateById(INITIAL_MEDICATION_LOGS, 'l');
  });

  const [gestureLogs, setGestureLogs] = useState<GestureDetectionEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gestures`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'g');
      }
    } catch {}
    return deduplicateById(INITIAL_GESTURE_LOGS, 'g');
  });

  const [scanHistory, setScanHistory] = useState<ScanResult[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_scans`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 's');
      }
    } catch {}
    return deduplicateById(INITIAL_SCAN_HISTORY, 's');
  });

  // Notifications (Sanitized against duplicate keys from prior sessions)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'n');
      }
    } catch {
      // Fallback to default
    }
    return deduplicateById(INITIAL_NOTIFICATIONS, 'n');
  });

  // Voice Assistant history in Settings
  const [voiceHistory, setVoiceHistory] = useState<VoiceAssistantExchange[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_voice_history`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateById(parsed, 'vh');
      }
    } catch {}
    return deduplicateById(INITIAL_VOICE_HISTORY, 'vh');
  });

  // YOLO ML Info
  const [yoloModel] = useState<YoloModelInfo>({
    status: 'AWAITING_WEIGHTS',
    classes: {
      0: 'Dolo_650',
      1: 'Cetirizine',
    },
    expectedWeights: 'best.pt',
    architecture: 'Ultralytics YOLOv8n (PyTorch)',
    datasetYaml: 'pill_dataset/data.yaml',
    trainingScriptReady: true,
    colabNotebookReady: true,
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auth`, JSON.stringify(isAuthenticated));
    localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
    localStorage.setItem(`${STORAGE_KEY}_caregivers`, JSON.stringify(caregivers));
    localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(caregiverMessages));
    localStorage.setItem(`${STORAGE_KEY}_medications`, JSON.stringify(medications));
    localStorage.setItem(`${STORAGE_KEY}_stock_adj`, JSON.stringify(stockAdjustments));
    localStorage.setItem(`${STORAGE_KEY}_vitals`, JSON.stringify(vitals));
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(medicationLogs));
    localStorage.setItem(`${STORAGE_KEY}_gestures`, JSON.stringify(gestureLogs));
    localStorage.setItem(`${STORAGE_KEY}_scans`, JSON.stringify(scanHistory));
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_voice_history`, JSON.stringify(voiceHistory));
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [
    isAuthenticated,
    patients,
    caregivers,
    caregiverMessages,
    medications,
    stockAdjustments,
    vitals,
    medicationLogs,
    gestureLogs,
    scanHistory,
    notifications,
    voiceHistory,
    settings,
  ]);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Auth methods
  const loginDemo = (role: 'Patient' | 'Caregiver' | 'Nurse' = 'Patient') => {
    setIsAuthenticated(true);
    setActiveRole(role);
    if (role === 'Patient') {
      setCurrentUser({
        name: activePatient.name,
        email: 'patient@apollo.med',
        role: 'Patient',
      });
    } else if (role === 'Caregiver') {
      const cg = caregivers.find((c) => c.role === 'Caregiver') || caregivers[0];
      setCurrentUser({
        name: cg.name,
        email: cg.email || 'caregiver@apollo.med',
        role: 'Primary Caregiver',
      });
    } else {
      const nurse = caregivers.find((c) => c.role === 'Nurse') || caregivers[1] || caregivers[0];
      setCurrentUser({
        name: nurse.name,
        email: nurse.email || 'nurse@apollo.med',
        role: 'Clinical Nurse',
      });
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Patient methods
  const addPatient = (newP: Omit<Patient, 'id'>) => {
    const id = generateUniqueId('p');
    const patient: Patient = { ...newP, id };
    setPatients((prev) => [...prev, patient]);
    setActivePatientId(id);
    addNotification('Patient Created', `Added patient profile for ${patient.name}.`, 'info');
  };

  const updatePatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addNotification('Patient Updated', `Updated profile for ${updated.name}.`, 'info');
  };

  // Caregiver CRUD methods with Indian Phone validation
  const addCaregiver = (newC: Omit<Caregiver, 'id'>): { success: boolean; error?: string } => {
    const phoneVal = validateAndNormalizeIndianPhone(newC.phone);
    if (!phoneVal.isValid) {
      return { success: false, error: phoneVal.error };
    }

    const caregiver: Caregiver = {
      ...newC,
      id: generateUniqueId('cg'),
      phone: phoneVal.normalized,
      isVerified: true,
    };
    setCaregivers((prev) => [...prev, caregiver]);
    addNotification('Caregiver Added', `${caregiver.name} (${caregiver.role}) registered with ${phoneVal.formatted}.`, 'info');

    // Async server persistence sync
    fetch('/api/caregivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caregiver),
    }).catch(() => {});

    return { success: true };
  };

  const updateCaregiver = (updated: Caregiver): { success: boolean; error?: string } => {
    const phoneVal = validateAndNormalizeIndianPhone(updated.phone);
    if (!phoneVal.isValid) {
      return { success: false, error: phoneVal.error };
    }

    const normalizedCaregiver: Caregiver = {
      ...updated,
      phone: phoneVal.normalized,
    };

    setCaregivers((prev) => prev.map((c) => (c.id === updated.id ? normalizedCaregiver : c)));
    addNotification('Caregiver Updated', `Updated contact details for ${updated.name}.`, 'info');

    // Async server persistence sync
    fetch(`/api/caregivers/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedCaregiver),
    }).catch(() => {});

    return { success: true };
  };

  const deleteCaregiver = (id: string): { success: boolean; error?: string } => {
    const target = caregivers.find((c) => c.id === id);
    setCaregivers((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      addNotification('Caregiver Removed', `${target.name} removed from active contact registry.`, 'info');
    }

    // Async server persistence sync
    fetch(`/api/caregivers/${id}`, {
      method: 'DELETE',
    }).catch(() => {});

    return { success: true };
  };

  // Two-Way Caregiver Messaging
  const sendCaregiverMessage = async (recipientId: string, text: string): Promise<CaregiverMessage> => {
    const now = new Date();
    const timeStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let senderId = 'p1';
    let senderName = activePatient.name;
    let senderRole: 'Patient' | 'Caregiver' | 'Nurse' = activeRole;
    let recipientName = 'Caregiver';

    if (activeRole === 'Patient') {
      senderId = activePatient.id;
      senderName = activePatient.name;
      const rc = caregivers.find((c) => c.id === recipientId);
      if (rc) recipientName = rc.name;
    } else {
      const cg = caregivers.find((c) => c.id === activeCaregiverId) || caregivers[0];
      senderId = cg.id;
      senderName = cg.name;
      recipientId = activePatient.id;
      recipientName = activePatient.name;
    }

    const conversationId = `conv_${activePatient.id}_${activeRole === 'Patient' ? recipientId : senderId}`;

    const newMsg: CaregiverMessage = {
      id: generateUniqueId('msg'),
      conversationId,
      senderId,
      senderName,
      senderRole,
      recipientId,
      recipientName,
      text: text.trim(),
      timestamp: timeStr,
      status: 'delivered',
    };

    // Attempt backend persistence
    try {
      await fetch('/api/caregiver/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch (e) {
      // Offline fallback: handled gracefully in state
    }

    setCaregiverMessages((prev) => [...prev, newMsg]);

    addNotification(
      'Message Sent',
      `Message to ${recipientName}: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`,
      'info'
    );

    return newMsg;
  };

  const markMessagesRead = (conversationId: string) => {
    setCaregiverMessages((prev) =>
      prev.map((m) => (m.conversationId === conversationId ? { ...m, status: 'read' } : m))
    );
  };

  // Medication CRUD
  const addMedication = (med: Omit<Medication, 'id' | 'status'>) => {
    const newMed: Medication = {
      ...med,
      id: generateUniqueId('m'),
      status: 'Pending',
      unit: med.unit || 'tablets',
      refillWarningThreshold: med.refillWarningThreshold || 7,
    };
    setMedications((prev) => [newMed, ...prev]);

    // Record initial stock creation in audit history
    const initialAdj: StockAdjustment = {
      id: generateUniqueId('adj'),
      medicationId: newMed.id,
      medicineName: `${newMed.name} ${newMed.dosage}`,
      date: new Date().toLocaleDateString(),
      change: newMed.inventory,
      reason: 'Restock',
      notes: 'Initial medication registration inventory',
      balanceAfter: newMed.inventory,
    };
    setStockAdjustments((prev) => [initialAdj, ...prev]);

    addNotification(
      'Medication Added',
      `${newMed.name} (${newMed.dosage}) scheduled for ${newMed.scheduledTime}. Inventory: ${newMed.inventory} ${newMed.unit}.`,
      'info'
    );
  };

  const updateMedication = (med: Medication) => {
    setMedications((prev) => prev.map((m) => (m.id === med.id ? med : m)));
    addNotification('Medication Updated', `${med.name} updated successfully.`, 'info');
  };

  const deleteMedication = (id: string) => {
    const med = medications.find((m) => m.id === id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (med) {
      addNotification('Medication Removed', `${med.name} removed from regimen.`, 'info');
    }
  };

  // Inventory Stock Adjustment & Refill Tracking
  const adjustStock = (
    medicationId: string,
    change: number,
    reason: StockAdjustment['reason'],
    notes?: string
  ) => {
    const now = new Date();
    const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    let resultingInventory = 0;
    let medName = '';

    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medicationId) {
          medName = `${m.name} ${m.dosage}`;
          resultingInventory = Math.max(0, m.inventory + change);
          return {
            ...m,
            inventory: resultingInventory,
          };
        }
        return m;
      })
    );

    const adjustment: StockAdjustment = {
      id: generateUniqueId('adj'),
      medicationId,
      medicineName: medName || 'Medication',
      date: dateStr,
      change,
      reason,
      notes: notes || `Stock updated: ${change > 0 ? `+${change}` : change}`,
      balanceAfter: resultingInventory,
    };

    setStockAdjustments((prev) => [adjustment, ...prev]);

    // Check refill threshold
    const med = medications.find((m) => m.id === medicationId);
    const threshold = med?.refillWarningThreshold || 7;
    if (resultingInventory <= threshold) {
      addNotification(
        'Refill Needed (Low Stock)',
        `${med?.name} inventory is ${resultingInventory} ${med?.unit || 'tablets'} (threshold: ${threshold}). Restock required soon.`,
        'urgent'
      );
    } else {
      addNotification(
        'Inventory Updated',
        `${med?.name} stock adjusted by ${change > 0 ? `+${change}` : change}. Current: ${resultingInventory} ${med?.unit || 'tablets'}.`,
        'info'
      );
    }
  };

  // Marking Dose as Taken: decrements inventory and logs stock adjustment
  const markDoseStatus = (id: string, status: 'Taken' | 'Pending' | 'Missed', note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

    const med = medications.find((m) => m.id === id);
    if (!med) return;

    let newInventory = med.inventory;
    if (status === 'Taken' && med.status !== 'Taken') {
      newInventory = Math.max(0, med.inventory - 1);
    } else if (status === 'Pending' && med.status === 'Taken') {
      newInventory = med.inventory + 1; // undo taken
    }

    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status,
            inventory: newInventory,
            lastTaken: status === 'Taken' ? `Today, ${timeStr}` : m.lastTaken,
          };
        }
        return m;
      })
    );

    // Record Stock Adjustment
    if (status === 'Taken' && med.status !== 'Taken') {
      const stockAdj: StockAdjustment = {
        id: generateUniqueId('adj'),
        medicationId: med.id,
        medicineName: `${med.name} ${med.dosage}`,
        date: dateStr,
        change: -1,
        reason: 'Dose Taken',
        notes: `Dose logged at ${timeStr}`,
        balanceAfter: newInventory,
      };
      setStockAdjustments((prev) => [stockAdj, ...prev]);

      // Check if newly triggered low stock
      if (newInventory <= (med.refillWarningThreshold || 7)) {
        addNotification(
          'Low Stock Warning',
          `${med.name} inventory is now ${newInventory} pills left. Please request a refill.`,
          'urgent'
        );
      }
    }

    // Record in Medication Log
    const logEntry: MedicationLogEntry = {
      id: generateUniqueId('l'),
      date: dateStr,
      medicine: med.name,
      dosage: med.dosage,
      scheduledTime: med.scheduledTime,
      status,
      notes: note || (status === 'Taken' ? 'Taken with water' : status === 'Missed' ? 'Dose missed' : 'Status reset'),
      timestamp: timeStr,
    };
    setMedicationLogs((prev) => [logEntry, ...prev]);

    if (status === 'Taken') {
      addNotification('Dose Recorded', `Logged ${med.name} ${med.dosage} as taken at ${timeStr}.`, 'success');
      if (settings.voiceFeedbackEnabled) {
        speakText(`${med.name} recorded as taken.`);
      }
    }
  };

  // Vitals
  const updateVitals = (updates: Partial<UserVitals>) => {
    setVitals((prev) => ({ ...prev, ...updates }));
  };

  const logWaterIntake = (amountLiters: number) => {
    setVitals((prev) => {
      const newHydration = Math.min(prev.hydrationGoal + 1.0, +(prev.hydration + amountLiters).toFixed(2));
      return { ...prev, hydration: newHydration };
    });
    addNotification('Hydration Logged', `Added ${(amountLiters * 1000).toFixed(0)}ml of water.`, 'info');
  };

  // Log helpers
  const addMedicationLog = (entry: Omit<MedicationLogEntry, 'id'>) => {
    setMedicationLogs((prev) => [{ ...entry, id: generateUniqueId('l') }, ...prev]);
  };

  const addGestureEvent = (
    gesture: 'OPEN PALM' | 'CLOSED FIST' | 'THUMBS UP' | 'PINCH / OK',
    action: string,
    confidence: number
  ) => {
    const now = new Date();
    const timestamp = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString()}`;
    const newEvent: GestureDetectionEvent = {
      id: generateUniqueId('g'),
      timestamp,
      gesture,
      actionRoutine: action,
      confidence,
      systemStatus: 'EXECUTED',
    };
    setGestureLogs((prev) => [newEvent, ...prev.slice(0, 49)]);

    if (gesture === 'OPEN PALM') {
      addNotification('SOS Triggered', 'Emergency gesture recognized. Caregiver alert active.', 'urgent');
    }
  };

  const addScanResult = (scan: Omit<ScanResult, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newScan: ScanResult = {
      ...scan,
      id: generateUniqueId('s'),
      timestamp,
    };
    setScanHistory((prev) => [newScan, ...prev]);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const now = 'Just now';
    const notif: AppNotification = {
      id: generateUniqueId('n'),
      title,
      message,
      time: now,
      type,
      read: false,
    };
    setNotifications((prev) => [notif, ...prev.slice(0, 19)]);
  };

  // AI Voice Assistant in Settings
  const askVoiceAssistant = async (query: string, source: 'Speech' | 'Text' = 'Speech'): Promise<string> => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let responseText = '';

    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: query,
          patientContext: {
            name: activePatient.name,
            age: activePatient.age,
            gender: activePatient.gender,
            allergies: activePatient.allergies,
            medications: medications.map((m) => ({
              name: m.name,
              dose: m.dosage,
              time: m.scheduledTime,
              status: m.status,
              instructions: m.instructions,
            })),
          },
          vitalsContext: {
            heartRate: vitals.heartRate,
            bp: `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`,
            hydration: vitals.hydration,
          },
          language: settings.voiceLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        responseText = data.response;
      } else {
        throw new Error('API response error');
      }
    } catch (e) {
      // Local clinical rule engine fallback
      const q = query.toLowerCase();
      if (q.includes('fever') || q.includes('headache')) {
        responseText = `For fever, Paracetamol 650mg is available on your SOS list. Note your allergy to Penicillin. Contact Dr. Sarah Jenkins (${activePatient.emergencyContact.phone}) if fever exceeds 101°F.`;
      } else if (q.includes('next') || q.includes('upcoming') || q.includes('dose')) {
        const pending = medications.filter((m) => m.status === 'Pending');
        responseText = pending.length > 0
          ? `Your next scheduled dose is ${pending[0].name} ${pending[0].dosage} at ${pending[0].scheduledTime}.`
          : 'All scheduled doses for today have been completed.';
      } else {
        responseText = `I reviewed your record, ${activePatient.name}. You have ${medications.length} active medications with 94% compliance. How else may I assist with your schedule?`;
      }
    }

    const exchange: VoiceAssistantExchange = {
      id: generateUniqueId('vh'),
      transcript: query,
      response: responseText,
      timestamp: timeStr,
      source,
    };

    setVoiceHistory((prev) => [exchange, ...prev.slice(0, 29)]);

    if (settings.voiceFeedbackEnabled) {
      speakText(responseText);
    }

    return responseText;
  };

  const clearVoiceHistory = () => {
    setVoiceHistory([]);
  };

  // Settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addNotification('Settings Saved', 'System preferences have been updated.', 'info');
  };

  // Text to speech helpers
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = settings.voiceLanguage || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Export CSV
  const exportCsvData = () => {
    const headers = ['Date', 'Time', 'Medicine', 'Dosage', 'Status', 'Notes'];
    const rows = medicationLogs.map((log) => [
      `"${log.date}"`,
      `"${log.scheduledTime}"`,
      `"${log.medicine}"`,
      `"${log.dosage}"`,
      `"${log.status}"`,
      `"${log.notes.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IntelliMed_Adherence_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Report Downloaded', 'Medication history exported to CSV.', 'success');
  };

  // Reset to original mock data
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_patients`);
    localStorage.removeItem(`${STORAGE_KEY}_caregivers`);
    localStorage.removeItem(`${STORAGE_KEY}_messages`);
    localStorage.removeItem(`${STORAGE_KEY}_medications`);
    localStorage.removeItem(`${STORAGE_KEY}_stock_adj`);
    localStorage.removeItem(`${STORAGE_KEY}_vitals`);
    localStorage.removeItem(`${STORAGE_KEY}_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_gestures`);
    localStorage.removeItem(`${STORAGE_KEY}_scans`);
    localStorage.removeItem(`${STORAGE_KEY}_notifications`);
    localStorage.removeItem(`${STORAGE_KEY}_voice_history`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);

    setPatients(INITIAL_PATIENTS);
    setActivePatientId('p1');
    setCaregivers(INITIAL_CAREGIVERS);
    setCaregiverMessages(INITIAL_MESSAGES);
    setMedications(INITIAL_MEDICATIONS);
    setStockAdjustments(INITIAL_STOCK_ADJUSTMENTS);
    setVitals(INITIAL_VITALS);
    setMedicationLogs(INITIAL_MEDICATION_LOGS);
    setGestureLogs(INITIAL_GESTURE_LOGS);
    setScanHistory(INITIAL_SCAN_HISTORY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setVoiceHistory(INITIAL_VOICE_HISTORY);
    setSettings(INITIAL_SETTINGS);
    setActiveRole('Patient');
    addNotification('Data Reset', 'Demo database restored to default state.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        activeRole,
        setActiveRole,
        activeCaregiverId,
        setActiveCaregiverId,
        loginDemo,
        logout,
        currentTab,
        setCurrentTab,
        patients,
        activePatient,
        setActivePatientId,
        addPatient,
        updatePatient,
        caregivers,
        addCaregiver,
        updateCaregiver,
        deleteCaregiver,
        caregiverMessages,
        sendCaregiverMessage,
        markMessagesRead,
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        markDoseStatus,
        stockAdjustments,
        adjustStock,
        vitals,
        updateVitals,
        logWaterIntake,
        medicationLogs,
        addMedicationLog,
        gestureLogs,
        addGestureEvent,
        scanHistory,
        addScanResult,
        notifications,
        markNotificationRead,
        clearNotifications,
        addNotification,
        voiceHistory,
        askVoiceAssistant,
        clearVoiceHistory,
        yoloModel,
        settings,
        updateSettings,
        resetDemoData,
        speakText,
        stopSpeaking,
        exportCsvData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
