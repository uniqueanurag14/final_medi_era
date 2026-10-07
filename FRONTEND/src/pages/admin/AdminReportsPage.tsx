import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Download,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface AdminReportsPageProps {
  onNavigate: (view: string) => void;
}

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ onNavigate }) => {
  const [timeRange, setTimeRange] = useState('month');

  const monthlyRevenueData = [
    { month: 'Apr', consultations: 8400, diagnostics: 3200, pharmacy: 4100, total: 15700 },
    { month: 'May', consultations: 9200, diagnostics: 3800, pharmacy: 4600, total: 17600 },
    { month: 'Jun', consultations: 10500, diagnostics: 4100, pharmacy: 5200, total: 19800 },
    { month: 'Jul', consultations: 11800, diagnostics: 4900, pharmacy: 5800, total: 22500 },
    { month: 'Aug', consultations: 13200, diagnostics: 5400, pharmacy: 6400, total: 25000 },
    { month: 'Sep (Proj)', consultations: 14500, diagnostics: 6100, pharmacy: 7200, total: 27800 },
  ];

  const doctorPerformance = [
    { doctor: 'Dr. Sarah Jenkins', specialty: 'Cardiology', visits: 142, revenue: 17040, rating: 4.9 },
    { doctor: 'Dr. James Watson', specialty: 'Dermatology', visits: 128, revenue: 12800, rating: 4.8 },
    { doctor: 'Dr. Priya Patel', specialty: 'Pediatrics', visits: 110, revenue: 9900, rating: 4.9 },
    { doctor: 'Dr. Marcus Vance', specialty: 'Orthopedics', visits: 95, revenue: 12350, rating: 4.7 },
    { doctor: 'Dr. Elena Rostova', specialty: 'Neurology', visits: 68, revenue: 10200, rating: 4.9 },
    { doctor: 'Dr. Rahul Sharma', specialty: 'Internal Medicine', visits: 155, revenue: 13950, rating: 4.8 },
  ];

  const paymentChannelBreakdown = [
    { name: 'UPI / QR Scan', value: 48, color: '#0d9488' },
    { name: 'Debit / Credit Card', value: 32, color: '#6366f1' },
    { name: 'Cash', value: 14, color: '#f59e0b' },
    { name: 'Insurance Direct', value: 6, color: '#10b981' },
  ];

  const handleExportCSV = () => {
    alert('Exporting clinical financial ledger as CSV (HIPAA formatted).');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinical Financial & Operational Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department Performance, Doctor Revenue, Payment Channel Analysis & Patient Retention Metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Revenue Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Revenue Trends by Stream ($)</h3>
              <p className="text-[11px] text-slate-400">Consultation OPD vs Pathology Diagnostics vs In-house Pharmacy</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="consultations" stackId="a" fill="#0d9488" name="Doctor Consultations" />
                <Bar dataKey="diagnostics" stackId="a" fill="#6366f1" name="Pathology Labs" />
                <Bar dataKey="pharmacy" stackId="a" fill="#f59e0b" name="Pharmacy Dispensed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Payment Channel Share</h3>
            <p className="text-[11px] text-slate-400">Percentage distribution of collection methods</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentChannelBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentChannelBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {paymentChannelBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Physician Clinical Productivity & Revenue Ledger</h3>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3.5">Consultant Name</th>
              <th className="p-3.5">Speciality Department</th>
              <th className="p-3.5 text-center">Consultations Completed</th>
              <th className="p-3.5 text-center">Avg Rating</th>
              <th className="p-3.5 text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {doctorPerformance.map((doc, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">{doc.doctor}</td>
                <td className="p-3.5 text-teal-800 font-medium">{doc.specialty}</td>
                <td className="p-3.5 text-center font-bold text-slate-800">{doc.visits}</td>
                <td className="p-3.5 text-center font-bold text-amber-500">★ {doc.rating}</td>
                <td className="p-3.5 text-right font-extrabold text-slate-950">${doc.revenue.toLocaleString()}.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
