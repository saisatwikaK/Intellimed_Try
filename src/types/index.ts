export type MedicationSlot = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Emergency';

export type MedicationStatus = 'Taken' | 'Pending' | 'Missed';

export interface StockAdjustment {
  id: string;
  medicationId: string;
  medicineName: string;
  date: string;
  change: number; // positive for restock, negative for deduction
  reason: 'Restock' | 'Dose Taken' | 'Manual Correction' | 'Expired Removal';
  notes?: string;
  balanceAfter: number;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  slots: MedicationSlot[];
  scheduledTime: string; // e.g. "08:00 AM"
  inventory: number;
  totalQuantity: number;
  unit?: string; // tablets, capsules, ml, pills
  batchNumber?: string;
  instructions: string;
  patientId: string;
  status: MedicationStatus;
  lastTaken?: string;
  category?: 'Prescription' | 'OTC' | 'Emergency' | 'Supplement';
  expiryDate?: string; // MM/YYYY
  refillWarningThreshold?: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  height: string;
  weight: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  primaryDoctor: {
    name: string;
    specialty: string;
    phone: string;
    hospital: string;
  };
}

export interface Caregiver {
  id: string;
  name: string;
  role: 'Caregiver' | 'Nurse' | string;
  phone: string; // Normalized to +91XXXXXXXXXX
  email?: string;
  relationship?: string;
  notes?: string;
  preferredContactMethod?: 'Phone' | 'WhatsApp' | 'In-App';
  availability: 'On Duty' | 'Flexible' | 'Emergency Only' | 'Off Duty';
  patientId: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface CaregiverMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'Patient' | 'Caregiver' | 'Nurse';
  recipientId: string;
  recipientName: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface VoiceAssistantExchange {
  id: string;
  transcript: string;
  response: string;
  timestamp: string;
  source: 'Speech' | 'Text';
}

export interface YoloModelInfo {
  status: 'AWAITING_WEIGHTS' | 'READY' | 'EVALUATION';
  classes: { [key: number]: string };
  expectedWeights: string;
  architecture: string;
  datasetYaml: string;
  trainingScriptReady: boolean;
  colabNotebookReady: boolean;
}

export interface MedicationLogEntry {
  id: string;
  date: string; // e.g. "15 May 2026"
  medicine: string;
  dosage: string;
  scheduledTime: string;
  status: 'Taken' | 'Missed' | 'Pending';
  notes: string;
  timestamp: string;
}

export interface GestureDetectionEvent {
  id: string;
  timestamp: string;
  gesture: 'OPEN PALM' | 'CLOSED FIST' | 'THUMBS UP' | 'PINCH / OK';
  actionRoutine: string;
  confidence: number;
  systemStatus: 'SUCCESS' | 'EXECUTED' | 'WAITING' | 'OVERRIDDEN';
}

export interface ScanResult {
  id: string;
  timestamp: string;
  medicineName: string;
  dosage: string;
  confidence: number;
  matchingPrescription: boolean;
  notes: string;
  source: 'Camera' | 'Upload' | 'OCR';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'urgent' | 'reminder' | 'success' | 'info';
  read: boolean;
}

export interface UserVitals {
  heartRate: number; // bpm
  heartRateChange: string; // "+2% normal"
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  hydration: number; // Liters
  hydrationGoal: number; // Liters
  sleepHours: number;
  sleepChange: string;
  aiHealthScore: number;
}

export interface AppSettings {
  voiceFeedbackEnabled: boolean;
  voiceLanguage: string;
  soundAlerts: boolean;
  cameraDeviceId: string;
  autoLogDoseOnGesture: boolean;
  gestureSensitivity: 'High' | 'Medium' | 'Low';
  whatsAppNotifications: boolean;
  whatsAppNumber: string;
  emailAlerts: boolean;
  emailAddress: string;
  pushNotifications: boolean;
  alertTone: string;
  emergencySosCountdown: number; // seconds
}
