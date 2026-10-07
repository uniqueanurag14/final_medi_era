import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  ConciergeBell,
  HeartPulse,
  FlaskConical,
  Pill,
  Calculator,
  User,
  Globe,
  RefreshCw,
  Building2,
  ChevronDown,
  Layers
} from 'lucide-react';
import { dbService } from '../../services/mockDatabase';

interface RoleSwitcherBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({ currentView, onNavigate }) => {
  const { currentRole, setRole, currentBranch, allBranches, setBranch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  const roles: { role: UserRole; label: string; icon: React.FC<{ className?: string }>; desc: string; defaultRoute: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', icon: ShieldAlert, desc: 'Full system & multi-branch access', defaultRoute: 'admin-dashboard' },
    { role: 'CLINIC_ADMIN', label: 'Clinic Admin', icon: UserCheck, desc: 'Operational & staff management', defaultRoute: 'admin-dashboard' },
    { role: 'DOCTOR', label: 'Doctor', icon: Stethoscope, desc: 'Queue, consultations & prescriptions', defaultRoute: 'doctor-queue' },
    { role: 'RECEPTIONIST', label: 'Receptionist', icon: ConciergeBell, desc: 'Intake, check-in, tokens & walk-ins', defaultRoute: 'reception-dashboard' },
    { role: 'NURSE', label: 'Nurse', icon: HeartPulse, desc: 'Triage & vitals capture station', defaultRoute: 'nurse-dashboard' },
    { role: 'LAB_TECHNICIAN', label: 'Lab Tech', icon: FlaskConical, desc: 'Diagnostic testing & report upload', defaultRoute: 'lab-dashboard' },
    { role: 'PHARMACIST', label: 'Pharmacist', icon: Pill, desc: 'Inventory, batches & dispensing', defaultRoute: 'pharmacy-dashboard' },
    { role: 'ACCOUNTANT', label: 'Accountant', icon: Calculator, desc: 'Invoices, payments & revenue', defaultRoute: 'accountant-dashboard' },
    { role: 'PATIENT', label: 'Patient Portal', icon: User, desc: 'Appointments, records & bills', defaultRoute: 'patient-dashboard' },
  ];

  const handleRoleSelect = (roleItem: typeof roles[0]) => {
    setRole(roleItem.role);
    onNavigate(roleItem.defaultRoute);
    setIsOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all test data back to default initial seed?')) {
      dbService.resetDatabase();
      window.location.reload();
    }
  };

  const activeRoleObj = roles.find((r) => r.role === currentRole) || roles[0];
  const ActiveIcon = activeRoleObj.icon;

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-teal-400">
          <Layers className="w-3.5 h-3.5" />
          <span className="tracking-wide">CLINIC CRM</span>
          <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[10px] px-1.5 py-0.2 rounded font-mono">v2.4 PROD</span>
        </div>

        {/* Public Website / CRM Mode Quick Switch */}
        <div className="hidden sm:flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
          <button
            onClick={() => onNavigate('public-home')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              currentView.startsWith('public-') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            Public Website
          </button>
          <button
            onClick={() => {
              if (currentRole === 'PATIENT') onNavigate('patient-dashboard');
              else if (currentRole === 'DOCTOR') onNavigate('doctor-queue');
              else if (currentRole === 'RECEPTIONIST') onNavigate('reception-dashboard');
              else if (currentRole === 'ACCOUNTANT') onNavigate('accountant-dashboard');
              else if (currentRole === 'LAB_TECHNICIAN') onNavigate('lab-dashboard');
              else if (currentRole === 'PHARMACIST') onNavigate('pharmacy-dashboard');
              else if (currentRole === 'NURSE') onNavigate('nurse-dashboard');
              else onNavigate('admin-dashboard');
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              !currentView.startsWith('public-') ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Clinic Workspaces
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Branch Selector */}
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
          <Building2 className="w-3 h-3 text-teal-400" />
          <select
            value={currentBranch.id}
            onChange={(e) => setBranch(e.target.value)}
            aria-label="Select Clinic Branch"
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
          >
            {allBranches.map((branch) => (
              <option key={branch.id} value={branch.id} className="bg-slate-900 text-slate-200">
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 px-2.5 py-1 rounded font-medium transition-all"
          >
            <ActiveIcon className="w-3.5 h-3.5 text-teal-400" />
            <span>Role: <strong>{activeRoleObj.label}</strong></span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-slate-200">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Role / Persona (Instant RBAC)
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = r.role === currentRole;
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors hover:bg-slate-800 ${
                        isSelected ? 'bg-teal-950/70 text-teal-300 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <div className="p-1 rounded bg-slate-800 text-teal-400 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs">{r.label}</div>
                        <div className="text-[10px] text-slate-400">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Database Button */}
        <button
          onClick={handleResetData}
          title="Reset database to fresh seed data"
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Demo credentials guide modal trigger */}
        <button
          onClick={() => setShowDemoInfo(!showDemoInfo)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1 rounded text-[11px]"
        >
          Demo Guide
        </button>
      </div>

      {/* Demo credentials modal */}
      {showDemoInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Clinic CRM — Demo Persona Credentials
              </h3>
              <button
                onClick={() => setShowDemoInfo(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold px-1"
              >
                &times;
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <p className="text-slate-700 font-medium">
                This system runs a real relational in-memory database pre-seeded with 100+ patients, 10 doctors, 2 branches, active queue items, vitals, prescriptions, lab orders, invoices, and CRM leads.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-900 font-bold">Doctor (Dr. Sarah Jenkins):</span>
                  <span>dr.sarah@apexhealth.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 font-bold">Reception (Rachel Gomez):</span>
                  <span>reception@apexhealth.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 font-bold">Admin (Jennifer Collins):</span>
                  <span>admin@apexhealth.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 font-bold">Accountant (Daniel Weber):</span>
                  <span>billing@apexhealth.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-900 font-bold">Patient (Rahul Sharma):</span>
                  <span>rahul.sharma@gmail.com</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                You can switch between any role instantly using the top <strong>Role Switcher</strong>, book appointments on the public site, take patients in the Doctor queue, generate prescriptions & invoices, and track payments!
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowDemoInfo(false)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs shadow-xs"
              >
                Got It, Start Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
