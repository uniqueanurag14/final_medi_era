import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { LabOrder } from '../../types';
import {
  FlaskConical,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';

interface AdminLabsPageProps {
  onNavigate: (view: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
}

export const AdminLabsPage: React.FC<AdminLabsPageProps> = ({
  onNavigate,
  onOpenPrintModal,
}) => {
  const labOrders = dbService.labOrders;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = labOrders.filter((lab) => {
    if (statusFilter !== 'all' && lab.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lab.orderNumber.toLowerCase().includes(q) ||
        lab.patientName.toLowerCase().includes(q) ||
        lab.doctorName.toLowerCase().includes(q) ||
        lab.tests.some((t) => t.testName.toLowerCase().includes(q))
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
            Diagnostic Pathology & Radiology Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic Workflow, Specimen Sample Processing & Abnormal Flag Verification
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lab order number, patient, or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
          >
            <option value="all">All Lab Orders ({labOrders.length})</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Sample">Pending Sample</option>
          </select>
        </div>
      </div>

      {/* Lab Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((lab) => (
          <div
            key={lab.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-slate-900 text-sm">{lab.orderNumber}</span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-slate-900">{lab.patientName}</span>
                <span className="text-[10px] text-slate-500 font-mono">({lab.patientId})</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">Referred by: <strong>{lab.doctorName}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  lab.status === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {lab.status.toUpperCase()}
                </span>
                <button
                  onClick={() => onOpenPrintModal('lab_report', { labOrder: lab })}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  Print Official Lab Report
                </button>
              </div>
            </div>

            {/* Test Investigation Results Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <th className="p-2.5">Test Investigation</th>
                    <th className="p-2.5">Observed Test Value</th>
                    <th className="p-2.5">Reference Bio-Interval</th>
                    <th className="p-2.5 text-center">Diagnostic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lab.tests.map((test, idx) => (
                    <tr key={idx} className={test.isAbnormal ? 'bg-rose-50/40' : ''}>
                      <td className="p-2.5 font-bold text-slate-900">{test.testName}</td>
                      <td className={`p-2.5 font-extrabold ${test.isAbnormal ? 'text-rose-700' : 'text-slate-800'}`}>
                        {test.resultValue} {test.units}
                      </td>
                      <td className="p-2.5 text-slate-500">{test.normalRange}</td>
                      <td className="p-2.5 text-center">
                        {test.isAbnormal ? (
                          <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                            ABNORMAL
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded">
                            NORMAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {lab.doctorRemarks && (
              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong>Doctor Clinical Notes:</strong> {lab.doctorRemarks}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
