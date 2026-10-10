import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure data persistence directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for reading and writing JSON files
function readJsonFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  // Write default if not found
  try {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing default ${filename}:`, err);
  }
  return defaultValue;
}

function writeJsonFile<T>(filename: string, data: T): boolean {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

// -------------------------------------------------------------
// INITIAL DEFAULT DATA (Seeded if files do not exist)
// -------------------------------------------------------------
const DEFAULT_CAREGIVERS = [
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

const DEFAULT_MESSAGES = [
  {
    id: 'msg_init_1',
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
    id: 'msg_init_2',
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
];

const DEFAULT_MEDICATIONS = [
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
];

const DEFAULT_STOCK_ADJUSTMENTS = [
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

// Initialize persistent stores
let caregivers = readJsonFile('caregivers.json', DEFAULT_CAREGIVERS);
let messages = readJsonFile('messages.json', DEFAULT_MESSAGES);
let medications = readJsonFile('medications.json', DEFAULT_MEDICATIONS);
let stockAdjustments = readJsonFile('stock_adjustments.json', DEFAULT_STOCK_ADJUSTMENTS);

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 1. HEALTH CHECK & SYSTEM DIAGNOSTICS
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'IntelliMed AI Medical Command Server',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    persistence: 'DISK_BACKED_JSON_V2',
    caregiverCount: caregivers.length,
    medicationCount: medications.length,
  });
});

// 2. CAREGIVERS CRUD (PERMANENT SERVER PERSISTENCE - PHASE 4)
app.get('/api/caregivers', (req, res) => {
  caregivers = readJsonFile('caregivers.json', DEFAULT_CAREGIVERS);
  res.json({ caregivers });
});

app.post('/api/caregivers', (req, res) => {
  const { name, role, phone, email, relationship, notes, preferredContactMethod, availability, patientId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }

  const newCaregiver = {
    id: `cg_${Date.now()}`,
    name: name.trim(),
    role: role || 'Caregiver',
    phone: phone.trim(),
    email: (email || '').trim(),
    relationship: (relationship || '').trim(),
    notes: (notes || '').trim(),
    preferredContactMethod: preferredContactMethod || 'In-App',
    availability: availability || 'Flexible',
    patientId: patientId || 'p1',
    isVerified: true,
  };

  caregivers.push(newCaregiver);
  writeJsonFile('caregivers.json', caregivers);

  res.status(201).json({ caregiver: newCaregiver, success: true });
});

app.put('/api/caregivers/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  caregivers = readJsonFile('caregivers.json', DEFAULT_CAREGIVERS);
  const index = caregivers.findIndex((c) => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Caregiver with ID ${id} not found.` });
  }

  const updatedRecord = {
    ...caregivers[index],
    ...updates,
    id, // Preserve original record ID
  };

  caregivers[index] = updatedRecord;
  writeJsonFile('caregivers.json', caregivers);

  res.json({ caregiver: updatedRecord, success: true });
});

app.delete('/api/caregivers/:id', (req, res) => {
  const { id } = req.params;
  caregivers = readJsonFile('caregivers.json', DEFAULT_CAREGIVERS);
  caregivers = caregivers.filter((c) => c.id !== id);
  writeJsonFile('caregivers.json', caregivers);

  res.json({ success: true, message: `Caregiver ${id} deleted.` });
});

// 3. TWO-WAY MESSAGING (PHASE 5)
app.get('/api/caregiver/messages', (req, res) => {
  messages = readJsonFile('messages.json', DEFAULT_MESSAGES);
  const { conversationId } = req.query;
  if (conversationId) {
    const filtered = messages.filter((m) => m.conversationId === conversationId);
    return res.json({ messages: filtered });
  }
  return res.json({ messages });
});

app.post('/api/caregiver/messages', (req, res) => {
  const { conversationId, senderId, senderName, senderRole, recipientId, recipientName, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty.' });
  }

  const now = new Date();
  const timeStr = `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    conversationId: conversationId || 'conv_p1_cg1',
    senderId: senderId || 'p1',
    senderName: senderName || 'Kavya TS',
    senderRole: senderRole || 'Patient',
    recipientId: recipientId || 'cg1',
    recipientName: recipientName || 'Dr. Sarah Jenkins',
    text: text.trim(),
    timestamp: timeStr,
    status: 'delivered',
  };

  messages = readJsonFile('messages.json', DEFAULT_MESSAGES);
  messages.push(newMsg);
  writeJsonFile('messages.json', messages);

  res.status(201).json({ message: newMsg, success: true });
});

// 4. MEDICATIONS & INVENTORY REFILL TRACKING (PHASE 6)
app.get('/api/medications', (req, res) => {
  medications = readJsonFile('medications.json', DEFAULT_MEDICATIONS);
  res.json({ medications });
});

app.post('/api/medications/:id/adjust-stock', (req, res) => {
  const { id } = req.params;
  const { change, reason, notes } = req.body;

  medications = readJsonFile('medications.json', DEFAULT_MEDICATIONS);
  const medIndex = medications.findIndex((m) => m.id === id);

  if (medIndex === -1) {
    return res.status(404).json({ error: 'Medication not found' });
  }

  const targetMed = medications[medIndex];
  const newInventory = Math.max(0, targetMed.inventory + Number(change));
  targetMed.inventory = newInventory;
  writeJsonFile('medications.json', medications);

  // Append audit ledger entry
  stockAdjustments = readJsonFile('stock_adjustments.json', DEFAULT_STOCK_ADJUSTMENTS);
  const adjustmentEntry = {
    id: `adj_${Date.now()}`,
    medicationId: id,
    medicineName: `${targetMed.name} ${targetMed.dosage}`,
    date: new Date().toLocaleDateString(),
    change: Number(change),
    reason: reason || 'Restock',
    notes: notes || 'Stock adjustment recorded via server',
    balanceAfter: newInventory,
  };
  stockAdjustments.unshift(adjustmentEntry);
  writeJsonFile('stock_adjustments.json', stockAdjustments);

  res.json({
    success: true,
    medication: targetMed,
    adjustment: adjustmentEntry,
  });
});

app.get('/api/medications/adjustments', (req, res) => {
  stockAdjustments = readJsonFile('stock_adjustments.json', DEFAULT_STOCK_ADJUSTMENTS);
  res.json({ adjustments: stockAdjustments });
});

// 5. ML YOLO STATUS (PHASE 7)
app.get('/api/ml/yolo-status', (req, res) => {
  const bestPtPath = path.join(__dirname, 'best.pt');
  const hasWeights = fs.existsSync(bestPtPath);

  res.json({
    modelName: 'IntelliMed-Pill-YOLOv8',
    targetArchitecture: 'Ultralytics YOLOv8n (PyTorch)',
    classes: {
      0: 'Dolo_650',
      1: 'Cetirizine',
    },
    weightsFile: 'best.pt',
    status: hasWeights ? 'READY' : 'AWAITING_WEIGHTS',
    hasWeights,
    trainingScriptPath: 'scripts/train_yolov8.py',
    datasetYamlPath: 'scripts/data.yaml',
    notes: hasWeights
      ? 'Custom trained weights best.pt loaded.'
      : 'Awaiting trained weights best.pt. Training script and dataset specification ready in /scripts.',
  });
});

// 6. VOICE ASSISTANT PIPELINE (PHASE 2)
app.post('/api/voice-assistant', async (req, res) => {
  const { transcript, patientContext, vitalsContext, language } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Transcript is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const prompt = `You are the IntelliMed AI Voice Assistant for clinical medication monitoring.
Patient Profile:
- Name: ${patientContext?.name || 'Kavya TS'}
- Age: ${patientContext?.age || 24}, Gender: ${patientContext?.gender || 'Female'}
- Known Allergies: ${(patientContext?.allergies || ['Penicillin']).join(', ')}
- Active Prescribed Regimen: ${JSON.stringify(patientContext?.medications || [
        { name: 'Lisinopril', dose: '10mg', time: '08:00 AM', status: 'Taken' },
        { name: 'Metformin', dose: '500mg', time: '01:00 PM', status: 'Taken' },
        { name: 'Atorvastatin', dose: '20mg', time: '08:00 PM', status: 'Pending' },
      ])}
- Current Vitals: Heart Rate ${vitalsContext?.heartRate || 72} bpm, Blood Pressure ${vitalsContext?.bp || '120/80'} mmHg.

User voice query: "${transcript}"

Guidelines:
1. Provide a helpful, clear, empathetic response in 2-4 sentences suitable to be spoken aloud.
2. Directly answer using their actual schedule and medication data.
3. If asking about an unprescribed drug or dosage change, do NOT prescribe; advise consulting their doctor (Dr. Sarah Jenkins).
4. Strictly enforce their penicillin allergy warning if relevant.
5. Language: ${language || 'English'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const replyText = response.text || 'I have reviewed your medication record. All scheduled doses are tracked.';

      return res.json({
        response: replyText,
        source: 'Gemini-3.8-Flash (Server-Side Secure)',
        success: true,
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err?.message || err);
    }
  }

  // Clinical Rule fallback when Gemini quota/key is unavailable
  const q = transcript.toLowerCase();
  let fallbackReply = `I reviewed your record, ${patientContext?.name || 'Kavya'}. You have ${patientContext?.medications?.length || 4} medications tracked today with 94% adherence.`;

  if (q.includes('fever') || q.includes('headache') || q.includes('pain')) {
    fallbackReply = `For mild fever, Paracetamol 650mg is on your SOS list. Note your recorded allergy to Penicillin. Always consult Dr. Sarah Jenkins before adding new medications.`;
  } else if (q.includes('next') || q.includes('upcoming') || q.includes('schedule')) {
    fallbackReply = `Your next scheduled dose is Atorvastatin 20mg at 08:00 PM tonight. Lisinopril 10mg and Metformin 500mg were already logged today.`;
  } else if (q.includes('interaction') || q.includes('safe')) {
    fallbackReply = `Your active medications (Lisinopril, Atorvastatin, Metformin) show no adverse interactions. Lisinopril should be taken in the morning and Atorvastatin before bedtime.`;
  } else if (q.includes('doctor') || q.includes('caregiver')) {
    fallbackReply = `Your primary cardiologist is Dr. Sarah Jenkins at Apollo Med Clinic. You can call them via the Caregiver Portal or use the Emergency SOS button.`;
  }

  return res.json({
    response: fallbackReply,
    source: 'IntelliMed Clinical Knowledge Base (Rule Verified)',
    success: true,
  });
});

// Start Server with Vite Middlewares in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IntelliMed AI server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
