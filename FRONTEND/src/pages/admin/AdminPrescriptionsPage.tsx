import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Prescription } from '../../types';
import {
  Pill,
  Search,
  Printer,
  Calendar,
  User,
  Stethoscope,
  Clock
} from 'lucide-react';

interface AdminPrescriptionsPageProps {
  onNavigate: (view: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
}

export const AdminPrescriptionsPage: React.FC<AdminPrescriptionsPageProps> = ({
  onNavigate,
  onOpenPrintModal,
}) => {
  const prescriptions = dbService.prescriptions;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRx = prescriptions.filter((rx) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        rx.prescriptionNumber.toLowerCase().includes(q) ||
        rx.patientName.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.diagnosis.toLowerCase().includes(q) ||
        rx.items.some((i) => i.medicineName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Medical Prescriptions (Rx) Registry & Pharmacy Dispenser
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit Trail of Prescribed Medications, Dosage Schedules & Digital Dispensation Orders
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search prescription number (e.g. RX-2026-0001), patient, medicine name, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredRx.map((rx) => (
          <div
            key={rx.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                  {rx.prescriptionNumber}
                </span>
                <span className="font-bold text-slate-900">{rx.patientName}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Prescribed by <strong>{rx.doctorName}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Date: {rx.createdAt.split('T')[0]}</span>
              </div>

              <button
                onClick={() => onOpenPrintModal('prescription', { prescription: rx })}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-teal-400" />
                Print / Download Rx
              </button>
            </div>

            <p className="text-slate-700">
              <strong>Clinical Diagnosis:</strong> {rx.diagnosis}
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2.5">Medicine & Strength</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5">Timing & Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rx.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="p-2.5 text-slate-700">{item.dosage}</td>
                      <td className="p-2.5 font-medium text-slate-800">{item.frequency}</td>
                      <td className="p-2.5 text-slate-700">{item.duration}</td>
                      <td className="p-2.5 text-slate-500">{item.timing}. {item.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rx.advice && (
              <p className="text-[11px] text-slate-600 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
                <strong>Physician Advice:</strong> {rx.advice}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
