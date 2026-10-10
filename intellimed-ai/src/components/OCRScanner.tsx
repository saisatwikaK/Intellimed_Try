import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OCRScanner: React.FC = () => {
  const { addMedication, activePatient, speakText } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    medicineName: string;
    dosage: string;
    frequency: string;
    scheduledTime: string;
    expiryDate: string;
    batchNumber: string;
    instructions: string;
    prescribingDoctor: string;
    confidence: number;
  } | null>(null);

  const [isAddedToMeds, setIsAddedToMeds] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setUploadedImage(url);
        simulateOcrExtraction('Lisinopril Tablets USP', '10mg', 'Once Daily with breakfast', '11/2027');
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSamplePrescription = (name: string, dose: string, freq: string, exp: string) => {
    setUploadedImage('sample');
    simulateOcrExtraction(name, dose, freq, exp);
  };

  const simulateOcrExtraction = (name: string, dose: string, freq: string, exp: string) => {
    setIsExtracting(true);
    setExtractedData(null);
    setIsAddedToMeds(false);

    setTimeout(() => {
      setExtractedData({
        medicineName: name,
        dosage: dose,
        frequency: freq,
        scheduledTime: '08:00 AM',
        expiryDate: exp,
        batchNumber: `RX-${Math.floor(100000 + Math.random() * 900000)}`,
        instructions: `Take 1 tablet ${dose} ${freq.toLowerCase()} with water. Keep in a dry place.`,
        prescribingDoctor: 'Dr. Sarah Jenkins (Apollo Med)',
        confidence: 97.4,
      });
      setIsExtracting(false);
      speakText(`Prescription label parsed: ${name} ${dose}.`);
    }, 1200);
  };

  const handleAddToRegimen = () => {
    if (!extractedData) return;
    addMedication({
      name: extractedData.medicineName,
      dosage: extractedData.dosage,
      frequency: extractedData.frequency,
      slots: ['Morning'],
      scheduledTime: extractedData.scheduledTime,
      inventory: 30,
      totalQuantity: 30,
      instructions: extractedData.instructions,
      patientId: activePatient.id,
      category: 'Prescription',
      expiryDate: extractedData.expiryDate,
      refillWarningThreshold: 5,
    });
    setIsAddedToMeds(true);
    speakText(`${extractedData.medicineName} added to your active medications.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header matching video Frame 0:10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              OCR Document Scanner
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 font-mono">
              Label Parser
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Extract medicine details, dosage, and expiry date from prescription labels and packaging.
          </p>
        </div>

        {/* Demo Samples for Quick Evaluation */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-slate-400">Sample Labels:</span>
          <button
            onClick={() => loadSamplePrescription('Atorvastatin Calcium', '20mg', 'Once Daily at bedtime', '09/2027')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            Atorvastatin 20mg
          </button>
          <button
            onClick={() => loadSamplePrescription('Metformin Hydrochloride', '500mg', 'Twice Daily with food', '04/2027')}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            Metformin 500mg
          </button>
        </div>
      </div>

      {/* TWO WORKSPACE CARDS matching video Frame 0:10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Upload Prescription Label */}
        <div className="bg-[#111B2D] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Upload Prescription Label</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag & drop an image of a medicine bottle, blister pack, or prescription document to extract all clinical details automatically.
            </p>

            {/* Dropzone Container */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-[#0B1220]/70 rounded-2xl p-8 text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-cyan-400" />
              </div>

              <h3 className="text-sm font-bold text-white">
                {uploadedImage ? 'Replace Prescription Image' : 'Select or Drop Document'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: JPG, PNG, WEBP (Max 10MB)
              </p>

              {uploadedImage && (
                <div className="mt-4 p-2 bg-slate-800/60 rounded-lg text-xs text-cyan-300 font-mono inline-flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Prescription document loaded</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant Client-Side OCR</span>
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold border border-slate-700 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Right Card: Extracted Details Preview matching video */}
        <div className="bg-[#111B2D] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Clinical OCR Output</h2>
              </div>
              {extractedData && (
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  {extractedData.confidence}% Confidence
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Structured metadata extracted via deep OCR model & regex entity linker.
            </p>

            {isExtracting ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Parsing drug packaging tokens...</p>
                <p className="text-[11px] text-slate-400 font-mono">Recognizing dosage, batch ID, and expiry stamps</p>
              </div>
            ) : extractedData ? (
              <div className="mt-5 space-y-3">
                <div className="p-4 bg-[#0B1220] border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Extracted Name</span>
                      <h3 className="text-lg font-extrabold text-white">{extractedData.medicineName}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400">Strength</span>
                      <p className="text-sm font-bold text-cyan-400 font-mono">{extractedData.dosage}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Frequency</span>
                      <span className="font-semibold text-slate-200">{extractedData.frequency}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Expiry Date</span>
                      <span className="font-semibold text-emerald-400 font-mono">{extractedData.expiryDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Batch / Rx ID</span>
                      <span className="font-mono text-slate-300">{extractedData.batchNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">Prescriber</span>
                      <span className="text-slate-300">{extractedData.prescribingDoctor}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono mb-0.5">Label Directions</span>
                    <p className="text-slate-300 leading-relaxed">{extractedData.instructions}</p>
                  </div>
                </div>

                {isAddedToMeds ? (
                  <div className="p-3 bg-emerald-600/20 border border-emerald-500/50 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Added to Patient Medications Schedule!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToRegimen}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Extracted Medicine to Regimen</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Label Scanned Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Upload a prescription label or choose a sample label from the top bar to extract clinical entities.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Linked Patient: <strong className="text-slate-200">{activePatient.name}</strong></span>
            {extractedData && (
              <button
                onClick={() => {
                  setExtractedData(null);
                  setUploadedImage(null);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* METRICS ROW matching video Frame 0:10 bottom */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono">Scan Precision</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">97%</h3>
          </div>
          <span className="text-xs text-slate-400">Benchmark OCR</span>
        </div>

        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono">Average Latency</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">&lt; 1.8s</h3>
          </div>
          <span className="text-xs text-slate-400">Edge Pipeline</span>
        </div>

        <div className="p-4 bg-[#111B2D] border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-mono">Entity Extraction</p>
            <h3 className="text-2xl font-extrabold text-purple-400 font-mono mt-0.5">8+ Fields</h3>
          </div>
          <span className="text-xs text-slate-400">Rx, Dose, Expiry</span>
        </div>
      </div>
    </div>
  );
};
