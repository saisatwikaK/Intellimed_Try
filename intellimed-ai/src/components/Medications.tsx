import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  History,
  RotateCw,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medication, MedicationSlot, StockAdjustment } from '../types';

export const Medications: React.FC = () => {
  const {
    medications,
    markDoseStatus,
    addMedication,
    updateMedication,
    deleteMedication,
    activePatient,
    stockAdjustments,
    adjustStock,
  } = useApp();

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [adjustStockMed, setAdjustStockMed] = useState<Medication | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState('Once Daily');
  const [formTime, setFormTime] = useState('08:00 AM');
  const [formSlots, setFormSlots] = useState<MedicationSlot[]>(['Morning']);
  const [formInventory, setFormInventory] = useState(30);
  const [formUnit, setFormUnit] = useState('tablets');
  const [formBatch, setFormBatch] = useState('');
  const [formExpiry, setFormExpiry] = useState('12/2027');
  const [formThreshold, setFormThreshold] = useState(7);
  const [formInstructions, setFormInstructions] = useState('');

  // Adjust Stock Form State
  const [stockDelta, setStockDelta] = useState<number>(30);
  const [stockReason, setStockReason] = useState<StockAdjustment['reason']>('Restock');
  const [stockNotes, setStockNotes] = useState('Monthly pharmacy refill received');

  // Filter tabs
  const filterTabs = ['All', 'Morning', 'Afternoon', 'Night', 'Emergency', 'Low Stock'];

  // Filter logic
  const filteredMeds = medications.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.instructions.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Low Stock') return m.inventory <= (m.refillWarningThreshold || 7);
    return m.slots.includes(activeFilter as MedicationSlot);
  });

  const openAddModal = () => {
    setFormName('');
    setFormDosage('');
    setFormFrequency('Once Daily');
    setFormTime('08:00 AM');
    setFormSlots(['Morning']);
    setFormInventory(30);
    setFormUnit('tablets');
    setFormBatch(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormExpiry('12/2027');
    setFormThreshold(7);
    setFormInstructions('');
    setEditingMed(null);
    setShowAddModal(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setFormName(med.name);
    setFormDosage(med.dosage);
    setFormFrequency(med.frequency);
    setFormTime(med.scheduledTime);
    setFormSlots(med.slots);
    setFormInventory(med.inventory);
    setFormUnit(med.unit || 'tablets');
    setFormBatch(med.batchNumber || '');
    setFormExpiry(med.expiryDate || '12/2027');
    setFormThreshold(med.refillWarningThreshold || 7);
    setFormInstructions(med.instructions);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDosage) return;

    if (editingMed) {
      updateMedication({
        ...editingMed,
        name: formName,
        dosage: formDosage,
        frequency: formFrequency,
        scheduledTime: formTime,
        slots: formSlots,
        inventory: Number(formInventory),
        unit: formUnit,
        batchNumber: formBatch,
        expiryDate: formExpiry,
        refillWarningThreshold: Number(formThreshold),
        instructions: formInstructions,
      });
    } else {
      addMedication({
        name: formName,
        dosage: formDosage,
        frequency: formFrequency,
        scheduledTime: formTime,
        slots: formSlots,
        inventory: Number(formInventory),
        totalQuantity: Number(formInventory),
        unit: formUnit,
        batchNumber: formBatch,
        expiryDate: formExpiry,
        refillWarningThreshold: Number(formThreshold),
        instructions: formInstructions || 'Take with water as directed',
        patientId: activePatient.id,
        category: 'Prescription',
      });
    }

    setShowAddModal(false);
    setEditingMed(null);
  };

  const handleStockAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustStockMed) return;
    adjustStock(adjustStockMed.id, Number(stockDelta), stockReason, stockNotes);
    setAdjustStockMed(null);
  };

  const toggleSlot = (slot: MedicationSlot) => {
    if (formSlots.includes(slot)) {
      if (formSlots.length > 1) {
        setFormSlots(formSlots.filter((s) => s !== slot));
      }
    } else {
      setFormSlots([...formSlots, slot]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header matching video Frame 0:02 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Medicine Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track inventory, audit refills, adjust schedules, and monitor adherence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>Refill Audit Log</span>
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR matching video */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111B2D] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            const isLowStock = tab === 'Low Stock';
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? isLowStock
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab}
                {isLowStock && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-200">
                    {medications.filter((m) => m.inventory <= (m.refillWarningThreshold || 7)).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search medicine or dosage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0B1220] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* MEDICATIONS GRID matching video cards */}
      {filteredMeds.length === 0 ? (
        <div className="p-12 text-center bg-[#111B2D] border border-slate-800 rounded-2xl">
          <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Medications Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No medicines matched your current filter "{activeFilter}". Try resetting filters or add a new medicine.
          </p>
          <button
            onClick={() => {
              setActiveFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeds.map((med, idx) => {
            const isTaken = med.status === 'Taken';
            const threshold = med.refillWarningThreshold || 7;
            const isLowStock = med.inventory <= threshold;

            return (
              <div
                key={`${med.id}_${idx}`}
                className="bg-[#111B2D] hover:bg-[#142137] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between group relative"
              >
                <div>
                  {/* Card Header: Title, Strength, and Slots */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white tracking-tight">{med.name}</h3>
                        <span className="text-xs text-slate-400">{med.dosage}</span>
                      </div>
                    </div>

                    {isLowStock ? (
                      <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Refill Needed
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {med.slots.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Schedule & Inventory Row */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-[#0B1220]/70 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-cyan-400" /> Schedule
                      </div>
                      <p className="text-xs font-bold text-white mt-0.5">{med.scheduledTime}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-slate-400">
                        <Package className="w-3 h-3 text-indigo-400" /> Stock Level
                      </div>
                      <p className={`text-xs font-bold mt-0.5 ${isLowStock ? 'text-amber-400 font-mono' : 'text-slate-200 font-mono'}`}>
                        {med.inventory} {med.unit || 'tablets'} left
                      </p>
                    </div>
                  </div>

                  {/* Expiry & Batch info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-2">
                    <span>Batch: {med.batchNumber || 'USP-GEN'}</span>
                    <span className="text-emerald-400/90">Expires: {med.expiryDate || '12/2027'}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed min-h-[32px] line-clamp-2">
                    {med.instructions}
                  </p>
                </div>

                {/* Footer Buttons: Edit, Restock, Mark as Taken */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(med)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-slate-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        setAdjustStockMed(med);
                        setStockDelta(30);
                        setStockReason('Restock');
                        setStockNotes('Pharmacy refill');
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 rounded-lg border border-cyan-800/60 transition-colors flex items-center gap-1"
                      title="Adjust or restock inventory"
                    >
                      <Package className="w-3 h-3 text-cyan-400" />
                      <span>Restock</span>
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isTaken ? (
                    <button
                      onClick={() => markDoseStatus(med.id, 'Pending')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-lg transition-all flex items-center gap-1.5 hover:bg-emerald-900/60"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Taken</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markDoseStatus(med.id, 'Taken')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-600/30 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Taken</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT MEDICINE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">
              {editingMed ? 'Edit Medication' : 'Add Medication'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure medication schedules, inventory stock thresholds, and batch tracking.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lisinopril"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dosage / Strength *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10mg"
                    value={formDosage}
                    onChange={(e) => setFormDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Frequency</label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option>Once Daily</option>
                    <option>Twice Daily</option>
                    <option>Thrice Daily</option>
                    <option>As Needed (SOS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Schedule Slots</label>
                <div className="flex flex-wrap gap-2">
                  {(['Morning', 'Afternoon', 'Evening', 'Night', 'Emergency'] as MedicationSlot[]).map((slot) => {
                    const selected = formSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(slot)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formInventory}
                    onChange={(e) => setFormInventory(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tablets">tablets</option>
                    <option value="capsules">capsules</option>
                    <option value="ml">ml</option>
                    <option value="pills">pills</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Refill Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    placeholder="LSP-2026-08"
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expiry Date (MM/YYYY)</label>
                  <input
                    type="text"
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    placeholder="12/2027"
                    className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Clinical Instructions</label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="Take after breakfast with water..."
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30"
                >
                  {editingMed ? 'Update Medication' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADJUST / RESTOCK INVENTORY (PHASE 6) */}
      {adjustStockMed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAdjustStockMed(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-1">Adjust Inventory Stock</h2>
            <p className="text-xs text-slate-400 mb-4">
              {adjustStockMed.name} ({adjustStockMed.dosage}) — Current: <strong>{adjustStockMed.inventory} {adjustStockMed.unit || 'tablets'}</strong>
            </p>

            <form onSubmit={handleStockAdjustmentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Quantity (+ to add, - to deduct)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={stockDelta}
                    onChange={(e) => setStockDelta(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white font-mono"
                  />
                  <div className="flex gap-1">
                    {[10, 30, 60].map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setStockDelta(quick)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded"
                      >
                        +{quick}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Adjustment</label>
                <select
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Restock">Prescription Restock / Pharmacy Delivery</option>
                  <option value="Manual Correction">Inventory Audit / Manual Correction</option>
                  <option value="Expired Removal">Expired or Damaged Pack Discard</option>
                  <option value="Dose Taken">Manual Intake Override</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  placeholder="e.g. Apollo Pharmacy Invoice #8841"
                  className="w-full px-3 py-2 bg-[#0B1220] border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="p-3 bg-[#0B1220] rounded-xl text-xs font-mono text-slate-300 flex justify-between">
                <span>New Predicted Balance:</span>
                <span className="text-emerald-400 font-bold">
                  {Math.max(0, adjustStockMed.inventory + Number(stockDelta))} {adjustStockMed.unit || 'tablets'}
                </span>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAdjustStockMed(null)}
                  className="px-4 py-2 bg-slate-800 text-xs font-semibold text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded-lg shadow-md"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REFILL AUDIT LOG (PHASE 6) */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setShowAuditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Stock & Refill Audit Trail</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Immutable ledger of all dose reductions, manual corrections, and pharmacy restocks.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2">
              {stockAdjustments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No stock adjustments logged.</div>
              ) : (
                stockAdjustments.map((adj, idx) => (
                  <div
                    key={`${adj.id}_${idx}`}
                    className="p-3 bg-[#0B1220] border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{adj.medicineName}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                          {adj.reason}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{adj.notes}</p>
                      <span className="text-[10px] text-slate-500">{adj.date}</span>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold text-sm ${adj.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {adj.change >= 0 ? `+${adj.change}` : adj.change}
                      </div>
                      <span className="text-[10px] text-slate-400">Balance: {adj.balanceAfter}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111B2D] border border-red-800/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-950 border border-red-700 text-red-400 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Remove Medication?</h3>
            <p className="text-xs text-slate-400 mb-4">
              This medication will be removed from active dose tracking and reporting.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMedication(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
