import React from 'react';
import { dbService } from '../../services/mockDatabase';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  HeartPulse,
  Pill,
  FlaskConical,
  AlertTriangle,
  Clock,
  ArrowRight,
  Stethoscope,
  Plus,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
  onOpenNewPatientModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigate,
  onOpenBookingModal,
  onOpenNewPatientModal,
}) => {
  const stats = dbService.getSystemStats();
  const appointments = dbService.appointments;
  const todayAppts = appointments.filter((a) => a.date === '2026-09-01');
  const inventoryAlerts = dbService.inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Expiring Soon');
  const doctors = dbService.doctors;
  const consultations = dbService.consultations;

  // Chart data: Revenue by department
  const specialtyRevenueData = [
    { name: 'Cardiology', revenue: 14200, appointments: 85 },
    { name: 'Dermatology', revenue: 9800, appointments: 92 },
    { name: 'Orthopedics', revenue: 11500, appointments: 68 },
    { name: 'Pediatrics', revenue: 7400, appointments: 75 },
    { name: 'General Med', revenue: 12100, appointments: 130 },
    { name: 'Neurology', revenue: 8900, appointments: 45 },
  ];

  // Chart data: Weekly Patient Inflow
  const weeklyInflowData = [
    { day: 'Mon', newPatients: 18, returningPatients: 34, total: 52 },
    { day: 'Tue', newPatients: 24, returningPatients: 41, total: 65 },
    { day: 'Wed', newPatients: 15, returningPatients: 38, total: 53 },
    { day: 'Thu', newPatients: 22, returningPatients: 45, total: 67 },
    { day: 'Fri', newPatients: 28, returningPatients: 52, total: 80 },
    { day: 'Sat', newPatients: 35, returningPatients: 60, total: 95 },
  ];

  // Chart data: Appointment Statuses
  const apptStatusData = [
    { name: 'Completed', value: 45, color: '#10b981' },
    { name: 'Waiting / Triage', value: 8, color: '#0d9488' },
    { name: 'In Consultation', value: 4, color: '#0284c7' },
    { name: 'Scheduled Today', value: 18, color: '#6366f1' },
    { name: 'Cancelled / No Show', value: 3, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinic Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Clinical Operations, Revenue Analytics & Patient Workflow Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewPatientModal}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600" />
            + Add Patient
          </button>
          <button
            onClick={onOpenBookingModal}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            + New Appointment
          </button>
          <button
            onClick={() => onNavigate('doctor-queue')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            Live Queue Board
          </button>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={stats.totalPatients.toLocaleString()}
          icon={Users}
          trend={{ value: '+14% this month', isPositive: true }}
          description="100+ active clinical files"
          color="teal"
          onClick={() => onNavigate('admin-patients')}
        />
        <StatCard
          title="Today's Appointments"
          value={todayAppts.length}
          icon={Calendar}
          trend={{ value: `${stats.waitingInQueue} in queue`, isPositive: true }}
          description={`${stats.completedToday} completed consultations`}
          color="blue"
          onClick={() => onNavigate('admin-appointments')}
        />
        <StatCard
          title="Total Billed Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: '+9.2% vs last week', isPositive: true }}
          description={`$${stats.pendingPayments.toLocaleString()} pending claims`}
          color="emerald"
          onClick={() => onNavigate('admin-billing')}
        />
        <StatCard
          title="Diagnostic Labs & Rx"
          value={stats.pendingLabOrders}
          icon={FlaskConical}
          trend={{ value: '18 ready for review', isPositive: true }}
          description="In-house lab queue"
          color="amber"
          onClick={() => onNavigate('admin-labs')}
        />
      </div>

      {/* Critical Stock Alerts Ticker (if any) */}
      {inventoryAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900">Pharmacy Low Stock Alert: </span>
              <span>
                {inventoryAlerts.map((i) => `${i.medicineName} (${i.currentStock} ${i.unit} left)`).join(' • ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-inventory')}
            className="text-amber-800 font-extrabold hover:underline shrink-0 ml-4"
          >
            Reorder in Inventory →
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Inflow Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Weekly Patient Traffic & Intake</h3>
              <p className="text-[11px] text-slate-400">Comparison of New Intake Registrations vs Follow-up Visits</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Avg 68 Patients/Day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyInflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReturning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="returningPatients" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReturning)" name="Returning Visits" />
                <Area type="monotone" dataKey="newPatients" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNew)" name="New Patients" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Today's Appointment Pipeline</h3>
            <p className="text-[11px] text-slate-400">Live breakdown of {todayAppts.length} appointments</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={apptStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {apptStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {apptStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Live OPD Queue vs Active Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live OPD Queue */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 animate-pulse" />
              <h3 className="font-extrabold text-sm text-slate-900">Today's Live Queue & Patient Roster</h3>
            </div>
            <button
              onClick={() => onNavigate('doctor-queue')}
              className="text-xs font-bold text-teal-700 hover:underline"
            >
              Open Full Queue →
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {todayAppts.slice(0, 5).map((appt) => (
              <div
                key={appt.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-teal-50/40 flex items-center justify-between transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-teal-800 bg-teal-100 px-2 py-1 rounded text-xs">
                    #{appt.tokenNumber}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{appt.patientName}</p>
                    <p className="text-[11px] text-slate-500">{appt.doctorName} • {appt.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={appt.status} size="sm" />
                  <button
                    onClick={() => onNavigate('doctor-queue')}
                    className="p-1 text-slate-400 hover:text-teal-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Doctors Roster */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Active Consultants on Duty</h3>
            </div>
            <span className="text-[11px] text-slate-400">{doctors.length} Doctors</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {doctors.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[10px] text-teal-700 font-semibold">{doc.specialtyName}</p>
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Room {doc.roomNumber || '101'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
