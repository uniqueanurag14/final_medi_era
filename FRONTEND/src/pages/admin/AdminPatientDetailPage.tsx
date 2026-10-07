import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { communicationService } from '../../services/communicationProviders';
import { Patient, Prescription, Invoice, LabOrder, Vitals, MedicalCertificate, CommunicationChannel } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  HeartPulse,
  Pill,
  FlaskConical,
  Receipt,
  FolderOpen,
  AlertTriangle,
  Printer,
  Plus,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  Shield,
  Activity,
  Award,
  History,
  FileCheck,
  Stethoscope,
  XCircle,
  Tag,
  MessageSquare,
  Send,
  Sparkles,
  Gift,
  Zap,
  Sliders,
  ChevronRight,
  Building2,
  Archive,
  RotateCcw,
  Lock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AdminPatientDetailPageProps {
  patientId: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const AdminPatientDetailPage: React.FC<AdminPatientDetailPageProps> = ({
  patientId,
  onNavigate,
  onOpenBookingModal,
  onOpenPrintModal,
  onOpenPaymentModal,
}) => {
  const { currentUser, hasPermission } = useAuth();
  const patient = dbService.patients.find((p) => p.id === patientId) || dbService.patients[0];
  const [patientStatus, setPatientStatus] = useState(patient.status || 'Active');
  const patientBranch = dbService.branches.find((b) => b.id === patient.branchId);

  const canView = hasPermission('patient.view') || hasPermission('customer.view');
  const canUpdate = hasPermission('patient.update') || hasPermission('customer.update');

  // Privacy protection: patients can only see their own file
  const isPatientSelf = currentUser.role === 'PATIENT' || currentUser.role === 'CUSTOMER'
    ? (currentUser.patientId === patient.id || currentUser.email === patient.email)
    : true;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'crm360' | 'timeline' | 'appointments' | 'prescriptions' | 'labs' | 'billing' | 'documents' | 'certificates'
  >('overview');

  // Related patient records
  const patientAppointments = dbService.appointments.filter((a) => a.patientId === patient.id);
  const patientPrescriptions = dbService.prescriptions.filter((p) => p.patientId === patient.id);
  const patientInvoices = dbService.invoices.filter((i) => i.patientId === patient.id);
  const patientLabOrders = dbService.labOrders.filter((l) => l.patientId === patient.id);
  const patientDocuments = dbService.documents.filter((d) => d.patientId === patient.id);
  const patientCertificates = dbService.medicalCertificates.filter((c) => c.patientId === patient.id);
  const patientFollowups = dbService.followups.filter((f) => f.patientId === patient.id);
  const patientActivities = dbService.getCrmActivities({ entityId: patient.id });
  const patientComms = dbService.getCommunicationLogs({ patientId: patient.id });
  const patientPrefs = dbService.getPatientPreferences(patient.id);

  // Timeline
  const timelineEvents = dbService.getPatientClinicalTimeline(patient.id);

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certType, setCertType] = useState<'Sick Leave' | 'Fitness' | 'Medical Exemption' | 'Referral'>('Sick Leave');
  const [certDoctorId, setCertDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [certDiagnosis, setCertDiagnosis] = useState('Acute Upper Respiratory Tract Infection');
  const [certStartDate, setCertStartDate] = useState('2026-09-01');
  const [certEndDate, setCertEndDate] = useState('2026-09-04');
  const [certRemarks, setCertRemarks] = useState('Patient is advised complete bed rest and medication adherence.');

  // Document Upload State
  const [isDocUploadOpen, setIsDocUploadOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'Lab Report' | 'Radiology' | 'Discharge Summary' | 'Insurance' | 'Other'>('Lab Report');

  // CRM Modals
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [selectedNewTag, setSelectedNewTag] = useState('');

  // Activity Form State
  const [actType, setActType] = useState<'Call' | 'WhatsApp' | 'Email' | 'Note' | 'Meeting'>('Call');
  const [actTitle, setActTitle] = useState('');
  const [actDesc, setActDesc] = useState('');

  // Send Message State
  const [msgChannel, setMsgChannel] = useState<CommunicationChannel>('whatsapp');
  const [msgBody, setMsgBody] = useState('Hello {{patientName}}, your next appointment at NovaCare is coming up.');

  // Consent Toggles
  const [allowSms, setAllowSms] = useState(patientPrefs?.allowSms ?? true);
  const [allowWhatsApp, setAllowWhatsApp] = useState(patientPrefs?.allowWhatsApp ?? true);
  const [allowEmail, setAllowEmail] = useState(patientPrefs?.allowEmail ?? true);
  const [allowPromo, setAllowPromo] = useState(patientPrefs?.allowPromotional ?? false);

  // Vitals Chart data
  const vitalsChartData = [...patient.vitals].reverse().map((v) => {
    const bpParts = v.bloodPressure.split('/');
    return {
      date: v.recordedAt.split('T')[0],
      systolic: parseInt(bpParts[0]) || 120,
      diastolic: parseInt(bpParts[1]) || 80,
      pulse: v.pulseRate,
      spO2: v.spO2,
    };
  });

  const handleCreateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = dbService.doctors.find((d) => d.id === certDoctorId) || dbService.doctors[0];
    dbService.createMedicalCertificate({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doc?.id || 'doc-general',
      doctorName: doc?.name || 'Attending Physician',
      type: certType as any,
      diagnosis: certDiagnosis,
      startDate: certStartDate,
      endDate: certEndDate,
      content: certRemarks,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Issued',
    });
    setIsCertModalOpen(false);
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;
    dbService.addPatientDocument({
      patientId: patient.id,
      title: docTitle.trim(),
      category: docCategory,
      fileName: `${docTitle.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'Reception / Medical Records',
      visibility: 'Clinic Staff',
    });
    setDocTitle('');
    setIsDocUploadOpen(false);
  };

  // CRM 360 Handlers
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim()) return;
    dbService.logCrmActivity({
      entityType: 'Patient',
      entityId: patient.id,
      entityName: `${patient.firstName} ${patient.lastName}`,
      type: actType,
      title: actTitle.trim(),
      description: actDesc.trim(),
      performedBy: 'Staff Coordinator',
    });
    setActTitle('');
    setActDesc('');
    setIsAddActivityOpen(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim()) return;

    communicationService.dispatchDirectMessage({
      patientId: patient.id,
      recipientName: `${patient.firstName} ${patient.lastName}`,
      recipientContact: msgChannel === 'email' ? patient.email : patient.phone,
      channel: msgChannel,
      content: msgBody.replace('{{patientName}}', `${patient.firstName} ${patient.lastName}`),
      templateName: 'Custom Dispatch',
    });

    setIsSendMessageOpen(false);
    alert(`Message queued and dispatched via ${msgChannel.toUpperCase()}!`);
  };

  const handleAddTag = (tag: string) => {
    if (!tag) return;
    dbService.addPatientTagToPatient(patient.id, tag);
    setSelectedNewTag('');
    setIsAddTagOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    dbService.removePatientTagFromPatient(patient.id, tag);
  };

  const handleSavePreferences = () => {
    dbService.updatePatientPreferences(patient.id, {
      allowSms,
      allowWhatsApp,
      allowEmail,
      allowPromotional: allowPromo,
    });
    alert('Patient communication consent preferences saved.');
  };

  const handleUpdateStatus = (newStatus: 'Active' | 'Inactive' | 'Archived') => {
    dbService.updatePatient(patient.id, { status: newStatus });
    setPatientStatus(newStatus);
  };

  if (!canView || !isPatientSelf) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Access Restricted: Confidential Medical File</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not have authorization to view this patient's medical file under MediEra data governance and patient privacy policies.
        </p>
        <button
          onClick={() => onNavigate('admin-patients')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
        >
          Return to Patient Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('admin-patients')}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenBookingModal()}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Consultation
          </button>
        </div>
      </div>

      {/* Patient 360 Header Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
              {patient.firstName[0]}{patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-950">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {patient.patientId}
                </span>
                <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded border border-teal-200">
                  {patient.category}
                </span>

                {/* Status Badge & Inline Switcher */}
                <div className="inline-flex items-center gap-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                      patientStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : patientStatus === 'Inactive'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        patientStatus === 'Active'
                          ? 'bg-emerald-500'
                          : patientStatus === 'Inactive'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                    ></span>
                    {patientStatus}
                  </span>

                  {canUpdate && (
                    <select
                      value={patientStatus}
                      onChange={(e) => handleUpdateStatus(e.target.value as any)}
                      className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 cursor-pointer"
                      title="Update Patient Status"
                    >
                      <option value="Active">Set Active</option>
                      <option value="Inactive">Set Inactive</option>
                      <option value="Archived">Set Archived</option>
                    </select>
                  )}
                </div>

                {/* Branch Badge */}
                {patientBranch && (
                  <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    {patientBranch.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span>DOB: <strong>{patient.dateOfBirth}</strong> ({2026 - parseInt(patient.dateOfBirth.split('-')[0])} yrs)</span>
                <span>•</span>
                <span>Gender: <strong>{patient.gender}</strong></span>
                <span>•</span>
                <span className="bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded">
                  Blood Group: {patient.bloodGroup}
                </span>
                <span>•</span>
                <span>Insurance: <strong>{patient.insuranceProvider || 'Self-Pay'}</strong> ({patient.insurancePolicyNumber || 'N/A'})</span>
              </div>
            </div>
          </div>

          <div className="text-right text-xs space-y-1 text-slate-600">
            <div className="flex items-center justify-end gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold text-slate-900">{patient.phone}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>{patient.address}, {patient.city}</span>
            </div>
          </div>
        </div>

        {/* Allergy & Clinical Risk Alert Banner */}
        {patient.allergies.length > 0 && !patient.allergies.includes('None Known') && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>CRITICAL ALLERGY ALERT: {patient.allergies.join(', ')}</span>
          </div>
        )}
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          EHR Overview & Vitals
        </button>

        <button
          onClick={() => setActiveTab('crm360')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'crm360' ? 'bg-purple-900 text-white' : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          CRM 360° & Engagement ({patientActivities.length + patientComms.length})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'timeline' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Clinical Timeline ({timelineEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'appointments' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Appointments ({patientAppointments.length})
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'prescriptions' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          Prescriptions ({patientPrescriptions.length})
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'labs' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Lab Diagnostic Orders ({patientLabOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'billing' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Billing & Invoices ({patientInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'certificates' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Medical Certificates ({patientCertificates.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'documents' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Files & Scans ({patientDocuments.length})
        </button>
      </div>

      {/* TAB CONTENT: CRM 360 & Engagement */}
      {activeTab === 'crm360' && (
        <div className="space-y-6">
          {/* Top Row: Tags & Preferences & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tags & Cohorts */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  Patient Cohorts & Tags
                </span>
                <button
                  onClick={() => setIsAddTagOpen(true)}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[48px] items-center">
                {(patient.tags && patient.tags.length > 0) ? (
                  patient.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-purple-400 hover:text-purple-700 ml-0.5 text-xs font-black"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No tags assigned yet</span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Acquisition Source:</span>
                <span className="font-bold text-slate-800">{patient.source || 'Direct Walk-in'}</span>
              </div>
            </div>

            {/* Communication Preferences / Consents */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  Communication Consents
                </span>
                <button
                  onClick={handleSavePreferences}
                  className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded"
                >
                  Save
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <span className="font-medium text-slate-700">SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={allowSms}
                    onChange={(e) => setAllowSms(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <span className="font-medium text-slate-700">WhatsApp Updates</span>
                  <input
                    type="checkbox"
                    checked={allowWhatsApp}
                    onChange={(e) => setAllowWhatsApp(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <span className="font-medium text-slate-700">Email Newsletters & Bills</span>
                  <input
                    type="checkbox"
                    checked={allowEmail}
                    onChange={(e) => setAllowEmail(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <span className="font-medium text-slate-700">Promotional Recalls</span>
                  <input
                    type="checkbox"
                    checked={allowPromo}
                    onChange={(e) => setAllowPromo(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                </label>
              </div>
            </div>

            {/* Quick Outreach Actions */}
            <div className="bg-gradient-to-br from-slate-900 to-teal-950 p-5 rounded-2xl text-white shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">Direct Patient Touchpoint</span>
                <h4 className="text-sm font-black mt-0.5">Quick Outreach Actions</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Send personalized WhatsApp/SMS or schedule a care recall follow-up.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setIsSendMessageOpen(true)}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Direct Message
                </button>
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Call / Note
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Grid: CRM Activity Timeline + Communication Logs + Follow-ups */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Outreach & Call Activities (Col 6) */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  CRM Interactions & Calls ({patientActivities.length})
                </h3>
                <button
                  onClick={() => setIsAddActivityOpen(true)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Activity
                </button>
              </div>

              <div className="space-y-3">
                {patientActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No interaction logs found.</p>
                ) : (
                  patientActivities.map((act) => (
                    <div key={act.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xs">
                        {act.type === 'Call' ? '📞' : act.type === 'WhatsApp' ? '💬' : act.type === 'Email' ? '✉️' : '📝'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">{act.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{act.createdAt.split('T')[0]}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Logged by: {act.performedBy}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dispatched Communication Logs (Col 6) */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Communication Logs ({patientComms.length})
                </h3>
                <button
                  onClick={() => setIsSendMessageOpen(true)}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch Message
                </button>
              </div>

              <div className="space-y-3">
                {patientComms.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No automated or direct messages sent yet.</p>
                ) : (
                  patientComms.map((comm) => (
                    <div key={comm.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="uppercase text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                            {comm.channel}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{comm.templateName || 'Direct Message'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{comm.sentAt.split('T')[0]}</span>
                      </div>
                      <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100 line-clamp-2">
                        {comm.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Recipient: {comm.recipientContact}</span>
                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {comm.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Overview & Vitals */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                Vitals Trends (Systolic vs Diastolic Blood Pressure)
              </h3>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Target: &lt;130/80 mmHg
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2.5} name="Systolic BP" />
                  <Line type="monotone" dataKey="diastolic" stroke="#0d9488" strokeWidth={2.5} name="Diastolic BP" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Vitals Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Vitals Log History</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2.5">Date & Time</th>
                      <th className="p-2.5">BP (mmHg)</th>
                      <th className="p-2.5">Pulse</th>
                      <th className="p-2.5">SpO2</th>
                      <th className="p-2.5">Weight / BMI</th>
                      <th className="p-2.5">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.vitals.map((v) => (
                      <tr key={v.id}>
                        <td className="p-2.5 text-slate-500">{new Date(v.recordedAt).toLocaleString()}</td>
                        <td className="p-2.5 font-extrabold text-slate-900">{v.bloodPressure}</td>
                        <td className="p-2.5 text-slate-700">{v.pulseRate} bpm</td>
                        <td className="p-2.5 text-slate-700">{v.spO2}%</td>
                        <td className="p-2.5 text-slate-700">{v.weightKg} kg (BMI: {v.bmi})</td>
                        <td className="p-2.5 text-slate-500">{v.recordedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Chronic Medical Conditions
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {patient.medicalConditions.map((c, i) => (
                  <span key={i} className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Current Active Medications
              </h3>
              <div className="space-y-1.5">
                {patient.currentMedications.map((m, i) => (
                  <div key={i} className="p-2 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-900 flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Clinical Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Unified Clinical History & EHR Timeline</h3>
              <p className="text-xs text-slate-500">Chronological feed of outpatient visits, prescriptions, diagnostics & certs.</p>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            {timelineEvents.map((ev, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{ev.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{ev.date}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{ev.description}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 uppercase">
                    {ev.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Token / No.</th>
                <th className="py-3 px-4">Consultant Physician</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Complaint</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientAppointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold">#{a.tokenNumber} ({a.appointmentNumber})</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{a.doctorName} ({a.doctorSpecialty})</td>
                  <td className="py-3 px-4">{a.date} at {a.timeSlot}</td>
                  <td className="py-3 px-4 text-slate-600">{a.chiefComplaint}</td>
                  <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {patientPrescriptions.map((rx) => (
            <div key={rx.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{rx.prescriptionNumber}</h4>
                  <p className="text-slate-500 text-[11px]">Prescribed by {rx.doctorName} on {rx.date}</p>
                </div>
                <button
                  onClick={() => onOpenPrintModal('prescription', { prescription: rx })}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Rx
                </button>
              </div>

              <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl">
                <span className="font-bold text-teal-900">Diagnosis: </span>
                <span className="text-teal-800">{rx.diagnosis}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2">Medicine</th>
                      <th className="p-2">Dosage</th>
                      <th className="p-2">Frequency</th>
                      <th className="p-2">Duration</th>
                      <th className="p-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rx.items.map((it) => (
                      <tr key={it.id}>
                        <td className="p-2 font-bold text-slate-900">{it.medicineName}</td>
                        <td className="p-2">{it.dosage}</td>
                        <td className="p-2">{it.frequency}</td>
                        <td className="p-2">{it.duration}</td>
                        <td className="p-2 text-slate-500">{it.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Lab Orders */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {patientLabOrders.map((lab) => (
            <div key={lab.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{lab.orderNumber}</h4>
                  <p className="text-slate-500 text-[11px]">Ordered by {lab.doctorName} on {lab.date || 'Today'}</p>
                </div>
                <StatusBadge status={lab.status || 'Ordered'} />
              </div>

              <div className="divide-y divide-slate-100">
                {lab.tests.map((t, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{t.testName}</span>
                      <span className="text-[11px] text-slate-500">{t.category || 'Clinical Pathology'}</span>
                    </div>
                    <div className="text-right">
                      {t.resultValue && t.resultValue !== 'Pending' ? (
                        <span className="font-bold text-teal-800">{t.resultValue} {t.units} (Ref: {t.normalRange})</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending Lab Analysis</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Billing */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{inv.createdAt.split('T')[0]}</td>
                  <td className="py-3 px-4 font-black">${inv.grandTotal.toFixed(2)}</td>
                  <td className="py-3 px-4 text-emerald-700 font-bold">${inv.paidAmount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-rose-700 font-bold">${inv.balanceAmount.toFixed(2)}</td>
                  <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => onOpenPaymentModal(inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => onOpenPrintModal('invoice', { invoice: inv })}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Medical Certificates */}
      {activeTab === 'certificates' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Medical Fitness & Leave Certificates</h3>
              <p className="text-xs text-slate-500">Official doctor-certified leave slips with digital signatures.</p>
            </div>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Issue Certificate
            </button>
          </div>

          <div className="space-y-3">
            {patientCertificates.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs italic">No medical certificates issued yet for this patient.</p>
            ) : (
              patientCertificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{cert.certificateNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        {cert.type}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 mt-1">Diagnosis: {cert.diagnosis}</p>
                    <p className="text-[11px] text-slate-500">
                      Period: <strong>{cert.startDate}</strong> to <strong>{cert.endDate}</strong> • Certified by <strong>{cert.doctorName}</strong>
                    </p>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">"{cert.content}"</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-2 border border-slate-200 bg-white rounded-xl text-slate-700 hover:bg-slate-100"
                    title="Print Certificate"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Uploaded Medical Documents & Scans</h3>
            <button
              onClick={() => setIsDocUploadOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> + Upload Medical File
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {patientDocuments.map((doc) => (
              <div key={doc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-900 truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-400">{doc.category} • {doc.fileSize}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                  <span>{doc.uploadedAt}</span>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-teal-700 font-bold hover:underline">
                    View / Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-base text-slate-900">Issue Medical Certificate</h3>
              <button onClick={() => setIsCertModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCertificate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Sick Leave">Sick Leave Certificate</option>
                  <option value="Fitness">Medical Fitness Certificate</option>
                  <option value="Medical Exemption">Medical Exemption</option>
                  <option value="Referral">Specialist Referral Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Physician</label>
                <select
                  value={certDoctorId}
                  onChange={(e) => setCertDoctorId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {dbService.doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={certDiagnosis}
                  onChange={(e) => setCertDiagnosis(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={certStartDate}
                    onChange={(e) => setCertStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={certEndDate}
                    onChange={(e) => setCertEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physician Advice & Remarks</label>
                <textarea
                  rows={2}
                  value={certRemarks}
                  onChange={(e) => setCertRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Issue & Sign Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isDocUploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Upload Patient Document</h3>
            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chest X-Ray PA View"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Lab Report">Lab Diagnostic Report</option>
                  <option value="Radiology">Radiology / MRI / Scan</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Insurance">Insurance Pre-Auth / Claim</option>
                  <option value="Other">Other Medical Record</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDocUploadOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Log Patient Interaction</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Type</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="Call">📞 Outbound Phone Call</option>
                  <option value="WhatsApp">💬 WhatsApp Chat</option>
                  <option value="Email">✉️ Email Exchange</option>
                  <option value="Note">📝 Internal Clinical/Coordinator Note</option>
                  <option value="Meeting">🤝 In-Person Front Desk Discussion</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Medication compliance follow-up call"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Notes</label>
                <textarea
                  rows={3}
                  placeholder="Patient stated symptoms have resolved; advised to complete 7-day course..."
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH DIRECT MESSAGE MODAL */}
      {isSendMessageOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Direct Message Outreach</h3>
              <button onClick={() => setIsSendMessageOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['whatsapp', 'sms', 'email'] as CommunicationChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setMsgChannel(ch)}
                      className={`p-2 rounded-xl font-bold uppercase text-[11px] border transition-all ${
                        msgChannel === ch
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  disabled
                  value={msgChannel === 'email' ? patient.email : patient.phone}
                  className="w-full px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-sans focus:outline-purple-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Variables available: {'{{patientName}}'}, {'{{clinicName}}'}</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSendMessageOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TAG MODAL */}
      {isAddTagOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xs w-full p-5 border border-slate-100 space-y-3 text-xs">
            <h3 className="font-black text-sm text-slate-900">Add Cohort / Clinical Tag</h3>
            <div className="space-y-1.5">
              {['VIP', 'Chronic-Care', 'Diabetic', 'Hypertension', 'Post-Op', 'Recall-Due', 'Pediatric-Care', 'Immunization'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddTag(t)}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-800 border border-slate-100 flex items-center justify-between"
                >
                  <span>{t}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsAddTagOpen(false)}
                className="px-3 py-1.5 text-slate-500 font-bold hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
