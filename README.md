# IntelliMed AI — Smart Medication Monitoring & Adherence System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MediaPipe](https://img.shields.io/badge/Vision-MediaPipe%20Hands-0097A7)](https://developers.google.com/mediapipe)
[![YOLOv8](https://img.shields.io/badge/Object%20Detection-YOLOv8-FF6F00)](https://ultralytics.com/)

> **Final-Year Engineering Project & Research Publication System**  
> An intelligent healthcare IoT and vision system combining computer vision, touchless gesture recognition, multimodal clinical reasoning, and real-time caregiver coordination to prevent medication errors and elevate patient adherence.

---

## 📌 Abstract & Overview

Non-adherence to prescribed medication schedules represents one of the leading causes of avoidable hospital readmissions and therapeutic complications globally. **IntelliMed AI** addresses this challenge through a multi-tiered technological framework:

1. **Touchless Gesture Intake Logging**: Uses MediaPipe 21-point hand landmark tracking to detect the **OK / Pinch** gesture, allowing elderly or motion-impaired patients to log doses hands-free without touching shared surfaces.
2. **AI Pill Recognition & Verification**: Implements computer vision pill detection (Ultralytics YOLOv8 pipeline) and OCR for expiration-date extraction and cross-checking against active prescriptions.
3. **Clinical AI Voice Assistant**: A voice-controlled medical assistant allowing patients to query schedule, pending doses, and drug interactions with text-to-speech feedback.
4. **Caregiver & Nurse Portal**: Real-time two-way messaging, patient vital monitoring, refill alerts, and contact management for family members and healthcare providers.
5. **Audit-Grade Compliance Ledger**: Real-time adherence analytics, missed dose tracking, and CSV audit export for physicians.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    IntelliMed AI Frontend                    │
│            React 19 • Vite • Tailwind CSS • Lucide           │
├──────────────────────────────┬───────────────────────────────┤
│    Computer Vision Engine    │    Voice & Multimodal Agent   │
│  - MediaPipe Hand Landmarks  │  - Web Speech API (STT / TTS) │
│  - OK Gesture Detection      │  - Gemini Multimodal Agent    │
│  - Pill Scanner Bounding Box │  - Drug Interaction Analyzer  │
├──────────────────────────────┴───────────────────────────────┤
│                Backend Server (Node.js / Express)            │
│  - REST API Routes (/api/caregivers, /api/medications)       │
│  - Disk-backed Persistent Storage (data/*.json)              │
│  - YOLO Model Status & Training Automation Harness           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. Touchless Gesture Recognition (MediaPipe)
- Tracks 21 3D hand landmarks in real-time at 30+ FPS directly in the browser.
- Normalized Euclidean distance calculation between thumb tip (Landmark 4) and index fingertip (Landmark 8).
- Distinguishes the **OK sign** from open palm, fist, and thumbs-up poses with temporal confidence smoothing to prevent accidental triggering.
- Automatically records taken doses into the patient medication log upon sustained confirmation.

### 2. AI Pill Scanner & Expiration Extraction
- Visual pill detector designed for Ultralytics YOLOv8 inference.
- High-resolution camera feed with bounding-box coordinate tracking and confidence metrics.
- Expiration date extraction pipeline comparing package markings against current calendar dates to prevent consuming expired medicines.

### 3. Settings AI Voice Assistant
- Hands-free bidirectional voice interface:
  - Microphone capture → Speech-to-Text transcript → Clinical analysis → Text-to-Speech audio response.
  - Context-aware answers based strictly on the patient's active prescribed medications, allergies, and daily schedule.

### 4. Caregiver & Telehealth Coordination
- Multi-role support for **Patients**, **Caregivers**, and **Clinical Nurses**.
- Verified Indian phone number normalization and quick-dial actions (`tel:` / `https://wa.me/`).
- Real-time in-app conversation thread between patient and assigned nurses.

### 5. Adherence Analytics & Reports
- Adherence percentage calculation based on scheduled vs. confirmed intake.
- Visual intake heatmaps across 7-day, 30-day, and quarterly intervals.
- One-click CSV export for medical record archiving.

---

## 💻 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### 1. Clone the Repository
```bash
git clone https://github.com/saisatwikaK/Intellimed_Try.git
cd Intellimed_Try
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your optional API key for full clinical reasoning features:
```env
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
```

### 4. Start the Application
```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 📂 Project Structure

```
├── data/                      # Persistent storage database (caregivers, logs, messages)
├── scripts/                   # Model training and dataset generation scripts
│   ├── data.yaml              # YOLO dataset configuration
│   └── train_yolov8.py        # PyTorch YOLOv8 training routine
├── src/
│   ├── components/            # UI Modules
│   │   ├── AIScanner.tsx      # Pill detection & verification camera
│   │   ├── AuthModal.tsx      # Multi-role authentication & session modal
│   │   ├── Dashboard.tsx      # Main patient command center & vitals
│   │   ├── GestureRecognition.tsx # MediaPipe touchless gesture engine
│   │   ├── Medications.tsx    # Schedule, refill tracking, and inventory ledger
│   │   ├── Navbar.tsx         # Responsive navigation & notification panel
│   │   ├── Reports.tsx        # Adherence analytics & CSV export
│   │   └── Settings.tsx       # Caregiver portal, profile, & voice assistant
│   ├── context/
│   │   └── AppContext.tsx     # Centralized medical state management & sync
│   ├── types/
│   │   └── index.ts           # TypeScript clinical data definitions
│   ├── utils/
│   │   └── gesture.ts         # MediaPipe geometric landmark classifier
│   ├── App.tsx                # Primary application container
│   └── main.tsx               # Client entry point
├── server.ts                  # Express.js REST API & Vite middleware server
├── vite.config.ts             # Vite build configuration
└── package.json               # Dependencies and scripts
```

---

## 🔬 Model Training & Evaluation (YOLOv8)

For training the custom pill detection model on custom pharmaceutical blister packs:
```bash
python scripts/train_yolov8.py
```
This trains an Ultralytics YOLOv8n detector with mAP@0.5 evaluation, exporting `best.pt` for deployment.

---

## 📄 License
This project is developed for academic engineering presentation and research. All rights reserved.
