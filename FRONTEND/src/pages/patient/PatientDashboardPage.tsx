import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { Invoice, Appointment, ServiceItem, PatientReferral } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  User,
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  Printer,
  CreditCard,
  Plus,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  HeartPulse,
  Home,
  Share2,
  Gift,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Stethoscope,
  Activity,
  DollarSign,
  Send,
  ShieldCheck,
  X,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

interface PatientDashboardPageProps {
  onOpenBookingModal: (doctorId?: string, specialtyId?: string, serviceName?: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onNavigate: (view: string) => void;
  initialTab?: 'overview' | 'book-appointment' | 'book-home-visit' | 'appointments' | 'invoices' | 'history' | 'profile' | 'referrals';
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({
  onOpenBookingModal,
  onOpenPrintModal,
  onOpenPaymentModal,
  onNavigate,
  initialTab = 'overview',
}) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'book-appointment' | 'book-home-visit' | 'appointments' | 'invoices' | 'history' | 'profile' | 'referrals'
  >(initialTab);

  // 5-second Toast notification system
  const [toast, setToast] = useState<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = String(Date.now());
    setToast({ id, type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5000);
  };

  // Safe patient resolution matching authenticated user
  const matchedPatient = dbService.patients.find(
    (p) =>
      Boolean(p.email && currentUser?.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      Boolean(currentUser?.patientId && (p.id === currentUser.patientId || p.patientId === currentUser.patientId))
  );

  const fallbackPatient = {
    id: currentUser?.patientId || currentUser?.id || 'pat-0001',
    patientId: currentUser?.patientId || 'PAT-0001',
    firstName: currentUser?.name ? currentUser.name.split(' ')[0] : 'Valued',
    lastName: currentUser?.name && currentUser.name.split(' ').length > 1 ? currentUser.name.split(' ').slice(1).join(' ') : 'Patient',
    email: currentUser?.email || 'patient@apexhealth.com',
    phone: currentUser?.phone || '+1 (555) 987-1000',
    dateOfBirth: '1990-05-15',
    gender: 'Other' as const,
    bloodGroup: 'O+',
    address: '742 Evergreen Terrace, Medical District',
    registeredAt: new Date().toISOString(),
    totalVisits: 0,
    outstandingBalance: 0,
    medicalHistory: ['Routine wellness monitoring'],
    allergies: ['Penicillin (mild)'],
    vitals: [],
    status: 'Active' as const,
  };

  const patient = matchedPatient || fallbackPatient;

  // Real Appointments from dbService and backend
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [invoicesState, setInvoicesState] = useState<Invoice[]>(() => {
    return dbService.invoices.filter((i) => i.patientId === patient.id || i.patientId === patient.patientId);
  });

  const [appointmentsState, setAppointmentsState] = useState<Appointment[]>(() => {
    const local = dbService.appointments.filter((a) => a.patientId === patient.id || a.patientId === patient.patientId);
    return local;
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: patient.firstName || '',
    lastName: patient.lastName || '',
    phone: patient.phone || '',
    email: patient.email || '',
    dateOfBirth: patient.dateOfBirth || '1990-05-15',
    gender: (patient.gender || 'Other') as 'Male' | 'Female' | 'Other',
    bloodGroup: patient.bloodGroup || 'O+',
    address: patient.address || '',
    emergencyContactName: (patient as any).emergencyContactName || 'Family Member',
    emergencyContactPhone: (patient as any).emergencyContactPhone || '+1 (555) 987-1001',
    allergies: (patient.allergies || []).join(', '),
  });

  // Booking Form State (In-Clinic)
  const [bookingDept, setBookingDept] = useState(dbService.specialties[0]?.id || '');
  const [bookingDoctorId, setBookingDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [bookingDate, setBookingDate] = useState('2026-09-02');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('10:00 AM');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // Home Visit Booking Form State
  const homeVisitServices = dbService.services.filter((s) => s.supportsHomeVisit);
  const [homeVisitServiceId, setHomeVisitServiceId] = useState(homeVisitServices[0]?.id || 'srv-02');
  const [homeVisitDate, setHomeVisitDate] = useState('2026-09-03');
  const [homeVisitTimeWindow, setHomeVisitTimeWindow] = useState('Morning (09:00 AM - 12:00 PM)');
  const [homeVisitAddress, setHomeVisitAddress] = useState(patient.address || '');
  const [homeVisitInstructions, setHomeVisitInstructions] = useState('');
  const [homeVisitContactPhone, setHomeVisitContactPhone] = useState(patient.phone || '');

  // Online Payment State
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [upiId, setUpiId] = useState(`${patient.firstName.toLowerCase()}@okhdfcbank`);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Referrals State
  const [referralsList, setReferralsList] = useState<PatientReferral[]>(() => {
    return dbService.getReferrals({ referringPatientId: String(patient.id) });
  });
  const [referralFriendName, setReferralFriendName] = useState('');
  const [referralFriendPhone, setReferralFriendPhone] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = `MEDIERA-${(patient.patientId || 'PAT-0001').replace('-', '')}`;
  const referralShareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://mediera.health'}/register?ref=${referralCode}`;

  // Fetch real appointments & invoices on mount
  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setApiAppointments(json.data);
        }
      })
      .catch(() => {});

    fetch(`/api/invoices?patientId=${patient.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Normalize if backend returned invoices
        }
      })
      .catch(() => {});
  }, [patient.id]);

  // Combine and sort appointments
  const allAppointments = appointmentsState.length > 0
    ? appointmentsState
    : apiAppointments.filter((a) => a.patientId === patient.id || a.patientId === patient.patientId);

  const upcomingAppointments = allAppointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Waiting' || a.status === 'Checked In'
  );

  const pastAppointments = allAppointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled'
  );

  const nextUpcoming = upcomingAppointments[0] || null;

  // Invoices & balance calculation
  const unpaidInvoices = invoicesState.filter(
    (i) => i.status !== 'Paid' && (i.balanceAmount > 0 || (i.grandTotal - (i.paidAmount || 0)) > 0)
  );
  const paidInvoices = invoicesState.filter((i) => i.status === 'Paid');
  const outstandingTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.balanceAmount || inv.grandTotal || 0), 0);
  const mostUrgentInvoice = unpaidInvoices[0] || null;

  // Prescriptions & Labs
  const prescriptions = dbService.prescriptions.filter((p) => p.patientId === patient.id);
  const labOrders = dbService.labOrders.filter((l) => l.patientId === patient.id);
  const recentVisit = pastAppointments[0] || null;

  // Handle Logout
  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully. Redirecting to home...');
    setTimeout(() => {
      onNavigate('/');
    }, 800);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update backend if endpoint available
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          email: profileForm.email,
          dateOfBirth: profileForm.dateOfBirth,
          gender: profileForm.gender,
          bloodGroup: profileForm.bloodGroup,
          address: profileForm.address,
        }),
      }).catch(() => {});

      // 2. Update dbService
      dbService.updatePatient(String(patient.id), {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        email: profileForm.email,
        dateOfBirth: profileForm.dateOfBirth,
        gender: profileForm.gender,
        bloodGroup: profileForm.bloodGroup as any,
        address: profileForm.address,
      });

      setIsEditingProfile(false);
      showToast('success', 'Profile updated successfully.');
    } catch {
      showToast('error', 'Could not save profile changes. Please try again.');
    }
  };

  // Handle Book Clinic Appointment
  const handleCreateClinicAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = dbService.doctors.find((d) => d.id === bookingDoctorId) || dbService.doctors[0];
    if (!doc) {
      showToast('error', 'Please select a valid doctor.');
      return;
    }

    const newAppt = dbService.createAppointment({
      patientId: String(patient.id),
      doctorId: doc.id,
      date: bookingDate,
      timeSlot: bookingTimeSlot,
      visitType: 'In Clinic',
      chiefComplaint: bookingReason || 'General Clinic Consultation',
      notes: bookingNotes,
    });

    setAppointmentsState((prev) => [newAppt, ...prev]);
    showToast('success', `Appointment booked successfully with Dr. ${doc.name} (Token #${newAppt.tokenNumber}).`);
    setActiveTab('appointments');
  };

  // Handle Book Home Visit
  const handleCreateHomeVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSrv = homeVisitServices.find((s) => s.id === homeVisitServiceId) || homeVisitServices[0];
    const assignedDoc = dbService.doctors[0];

    const newAppt = dbService.createAppointment({
      patientId: String(patient.id),
      doctorId: assignedDoc.id,
      date: homeVisitDate,
      timeSlot: homeVisitTimeWindow,
      visitType: 'Home Visit',
      chiefComplaint: selectedSrv ? `Home Visit: ${selectedSrv.name}` : 'Home Clinical Care Visit',
      notes: `Home Address: ${homeVisitAddress}. Contact: ${homeVisitContactPhone}. Instructions: ${homeVisitInstructions || 'None'}`,
    });

    (newAppt as any).homeVisitAddress = homeVisitAddress;
    (newAppt as any).homeVisitNotes = homeVisitInstructions;

    setAppointmentsState((prev) => [newAppt, ...prev]);
    showToast('success', `Home Visit confirmed for ${homeVisitDate}! A clinical provider has been assigned.`);
    setActiveTab('appointments');
  };

  // Handle Online Payment Execution
  const handleProcessOnlinePayment = async () => {
    if (!payingInvoice) return;
    setIsProcessingPayment(true);

    try {
      const amountToPay = payingInvoice.balanceAmount || payingInvoice.grandTotal;

      // 1. Call server-side payment verification
      await fetch(`/api/invoices/${payingInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountToPay,
          paymentMethod: paymentMethod === 'Card' ? 'Card' : paymentMethod === 'UPI' ? 'UPI' : 'Online',
        }),
      }).catch(() => {});

      // 2. Update local dbService
      const result = dbService.payInvoice(
        payingInvoice.id,
        paymentMethod === 'Card' ? 'Card' : paymentMethod === 'UPI' ? 'UPI' : 'Online',
        `TXN-ONLINE-${Date.now().toString().slice(-6)}`,
        'Online Payment Gateway'
      );

      // Update state
      setInvoicesState((prev) =>
        prev.map((i) => (i.id === payingInvoice.id ? { ...result.invoice } : i))
      );

      setIsProcessingPayment(false);
      setPayingInvoice(null);
      showToast('success', `Payment of $${amountToPay.toFixed(2)} completed successfully! Receipt generated.`);
    } catch {
      setIsProcessingPayment(false);
      showToast('error', 'Payment processing failed. Please verify credentials.');
    }
  };

  // Handle Refer Friend
  const handleSendReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralFriendName || !referralFriendPhone) {
      showToast('warning', 'Please enter your friend\'s name and phone number.');
      return;
    }

    if (referralFriendPhone === patient.phone || referralFriendPhone === patient.email) {
      showToast('error', 'Self-referrals are not permitted. Please invite a family member or friend.');
      return;
    }

    const newRef = dbService.createReferral({
      referringPatientId: String(patient.id),
      referringPatientName: `${patient.firstName} ${patient.lastName}`,
      newPatientName: referralFriendName,
      newPatientPhone: referralFriendPhone,
      status: 'Referred',
      rewardStatus: 'Eligible',
      rewardAmount: 25,
      rewardDescription: '$25 credit on your next consultation upon their first visit',
      referralDate: new Date().toISOString().split('T')[0],
      notes: 'Invited via MediEra Patient Portal',
    });

    setReferralsList((prev) => [newRef, ...prev]);
    setReferralFriendName('');
    setReferralFriendPhone('');
    showToast('success', `Referral invitation sent to ${referralFriendName}! You will earn $25 credit on their first visit.`);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralShareUrl);
      setCopiedLink(true);
      showToast('success', 'Referral link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! I use MediEra for my clinic appointments and home medical visits. Use my personal link or code "${referralCode}" to get a 10% discount on your first consultation: ${referralShareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Invitation to MediEra Healthcare Portal');
    const body = encodeURIComponent(
      `Hi,\n\nI recommend using MediEra for quick clinic doctor appointments and certified home medical visits.\n\nSign up using my referral code "${referralCode}" or link below for 10% off your initial visit:\n${referralShareUrl}\n\nBest regards,\n${patient.firstName}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const firstInitial = (patient.firstName?.[0] || 'P').toUpperCase();
  const lastInitial = (patient.lastName?.[0] || 'T').toUpperCase();
  const displayName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" id="patient-dashboard-container">
      {/* 5-SECOND TOAST NOTIFICATION */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in slide-in-from-top-4 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/20'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700 shadow-rose-900/20'
              : toast.type === 'warning'
              ? 'bg-amber-900 text-white border-amber-700 shadow-amber-900/20'
              : 'bg-slate-900 text-white border-slate-700 shadow-slate-900/20'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-teal-300 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP PATIENT HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-teal-800/40 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 font-black text-2xl flex items-center justify-center shadow-inner">
              {firstInitial}{lastInitial}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{displayName}</h1>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg">
                  {patient.patientId || 'PAT-0001'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3 font-medium">
                <span>Blood Group: <strong className="text-white">{patient.bloodGroup || 'O+'}</strong></span>
                <span>•</span>
                <span>DOB: <strong className="text-white">{patient.dateOfBirth || '—'}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="text-white">{patient.phone || '—'}</strong></span>
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('book-appointment')}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>

            <button
              onClick={() => setActiveTab('book-home-visit')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-emerald-400/30"
            >
              <Home className="w-4 h-4" />
              Book Home Visit
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-rose-600/80 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Sign out of patient session"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <p className="text-slate-400 text-[11px] font-medium">Upcoming Visits</p>
            <p className="text-lg font-extrabold text-teal-300 mt-0.5">{upcomingAppointments.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <p className="text-slate-400 text-[11px] font-medium">Outstanding Balance</p>
            <p className={`text-lg font-extrabold mt-0.5 ${outstandingTotal > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
              ${outstandingTotal.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <p className="text-slate-400 text-[11px] font-medium">Past Consultations</p>
            <p className="text-lg font-extrabold text-white mt-0.5">{pastAppointments.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
            <p className="text-slate-400 text-[11px] font-medium">Referral Credits</p>
            <p className="text-lg font-extrabold text-purple-300 mt-0.5">
              ${referralsList.filter((r) => r.rewardStatus === 'Rewarded' || r.status === 'Completed').length * 25}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="pt-2 flex flex-wrap gap-1.5 text-xs font-bold overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Activity },
            { id: 'book-appointment', label: 'Book In-Clinic', icon: Calendar },
            { id: 'book-home-visit', label: 'Book Home Visit', icon: Home },
            { id: 'appointments', label: `Appointments (${allAppointments.length})`, icon: Calendar },
            { id: 'invoices', label: `Invoices & Payments (${invoicesState.length})`, icon: Receipt },
            { id: 'history', label: 'Medical & Visit History', icon: FileText },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'referrals', label: 'Refer a Friend & Family', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-black'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------- TAB: OVERVIEW ----------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* AUTOERA-STYLE FEATURED CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Upcoming Appointment */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-900">
                    Next Appointment
                  </span>
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>

                {nextUpcoming ? (
                  <div className="space-y-2 pt-1">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {nextUpcoming.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {nextUpcoming.doctorSpecialty || 'Clinical Consultation'}
                    </p>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{nextUpcoming.date} at {nextUpcoming.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {nextUpcoming.visitType === 'Home Visit' ? 'Home Visit (At Patient Address)' : 'MediEra Central Hospital'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <StatusBadge status={nextUpcoming.status} size="sm" />
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Token #{nextUpcoming.tokenNumber || '1'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Upcoming Visits</p>
                    <p className="text-[11px] text-slate-400">Book an appointment or doctor home visit when needed.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                {nextUpcoming ? (
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Appointment Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('book-appointment')}
                    className="w-full py-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Schedule Appointment</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Outstanding Invoice / Pay Now */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                    Billing Status
                  </span>
                  <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>

                {mostUrgentInvoice ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount Due</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-950 dark:text-white">
                        ${(mostUrgentInvoice.balanceAmount || mostUrgentInvoice.grandTotal).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                        Unpaid
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Invoice #{mostUrgentInvoice.invoiceNumber}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Due by: {mostUrgentInvoice.dueDate || 'Immediate'}
                    </p>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <Receipt className="w-8 h-8 text-emerald-400 dark:text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All Clear!</p>
                    <p className="text-[11px] text-slate-400">You have no outstanding bills or unpaid invoices.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                {mostUrgentInvoice ? (
                  <button
                    onClick={() => setPayingInvoice(mostUrgentInvoice)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Now (${(mostUrgentInvoice.balanceAmount || mostUrgentInvoice.grandTotal).toFixed(2)})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Invoice Receipts</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Card 3: Recent Visit / Medical History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-900">
                    Recent Visit
                  </span>
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>

                {recentVisit ? (
                  <div className="space-y-2 pt-1">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {recentVisit.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Date: {recentVisit.date} ({recentVisit.visitType})
                    </p>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {recentVisit.chiefComplaint || 'Consultation completed and verified.'}
                    </div>
                    <span className="inline-block bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      Completed Visit
                    </span>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <Stethoscope className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Past Visits</p>
                    <p className="text-[11px] text-slate-400">Completed consultations will appear in your clinical history.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Clinical History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card 4: Refer a Friend & Family */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 rounded-3xl border border-teal-200 dark:border-teal-900/60 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2.5 py-0.5 rounded-md border border-teal-300 dark:border-teal-800">
                    Refer & Earn
                  </span>
                  <Gift className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>

                <div className="space-y-2 pt-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Refer a Friend or Family
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Give friends 10% off their visit. You receive $25 healthcare credit for each completed consultation.
                  </p>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-900/50 flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-teal-800 dark:text-teal-300">
                      {referralCode}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-teal-100 dark:border-slate-700/60">
                <button
                  onClick={() => setActiveTab('referrals')}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Referral Link</span>
                </button>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-wide">
              Quick Patient Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[
                { id: 'book-appointment', label: 'Book Appointment', desc: 'In-clinic specialist', icon: Calendar, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60' },
                { id: 'book-home-visit', label: 'Book Home Visit', desc: 'Doctor/nurse at home', icon: Home, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' },
                { id: 'profile', label: 'My Profile', desc: 'Health info & address', icon: User, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
                { id: 'appointments', label: 'My Appointments', desc: 'Tokens & schedule', icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
                { id: 'invoices', label: 'My Invoices', desc: 'Receipts & payment', icon: Receipt, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60' },
                { id: 'referrals', label: 'Refer a Friend', desc: 'Earn care rewards', icon: Gift, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => setActiveTab(action.id as any)}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/40 hover:shadow-md bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: BOOK APPOINTMENT (IN-CLINIC) ----------------- */}
      {activeTab === 'book-appointment' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>In-Clinic Doctor Consultation</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Schedule Your Hospital or Clinic Appointment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your patient details are automatically linked to your authenticated account ({displayName} • {patient.patientId}).
            </p>
          </div>

          <form onSubmit={handleCreateClinicAppointment} className="space-y-6">
            {/* Auto-populated patient badge info */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-teal-950 dark:text-teal-200">Patient Account: </span>
                <strong className="text-teal-800 dark:text-teal-300 font-extrabold">{displayName}</strong>
                <span className="text-slate-500 dark:text-slate-400 ml-2">({patient.email} • {patient.phone})</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-bold text-teal-700 dark:text-teal-300 underline cursor-pointer"
              >
                Review or Edit Profile Details
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Clinical Department / Specialty *
                </label>
                <select
                  value={bookingDept}
                  onChange={(e) => {
                    setBookingDept(e.target.value);
                    const matchingDoc = dbService.doctors.find((d) => d.specialtyId === e.target.value);
                    if (matchingDoc) setBookingDoctorId(matchingDoc.id);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                >
                  {dbService.specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Consulting Physician / Doctor *
                </label>
                <select
                  value={bookingDoctorId}
                  onChange={(e) => setBookingDoctorId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
                >
                  {dbService.doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialtyName} (${doc.consultationFee || 50})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Appointment Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Available Time Slot *
                </label>
                <select
                  value={bookingTimeSlot}
                  onChange={(e) => setBookingTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                >
                  {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM'].map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for Visit / Chief Health Symptoms
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Persistent headache, routine blood pressure checkup, prescription renewal..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Confirm Appointment Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------- TAB: BOOK HOME VISIT ----------------- */}
      {activeTab === 'book-home-visit' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Home className="w-4 h-4" />
              <span>Dedicated At-Home Care Services</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Book Doctor, Nurse, or Diagnostic Home Visit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Certified healthcare professionals dispatched to your residence. Only services configured with home visit capability are shown.
            </p>
          </div>

          <form onSubmit={handleCreateHomeVisit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Home Care Service *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {homeVisitServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => setHomeVisitServiceId(srv.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                      homeVisitServiceId === srv.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{srv.name}</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">${srv.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Duration: {srv.durationMinutes} mins</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Home Visit Supported</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Visit Date *
                </label>
                <input
                  type="date"
                  value={homeVisitDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setHomeVisitDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Arrival Time Window *
                </label>
                <select
                  value={homeVisitTimeWindow}
                  onChange={(e) => setHomeVisitTimeWindow(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                  <option value="Evening (03:00 PM - 06:00 PM)">Evening (03:00 PM - 06:00 PM)</option>
                  <option value="Late Evening (06:00 PM - 08:00 PM)">Late Evening (06:00 PM - 08:00 PM)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Home Visit Address *
                </label>
                <input
                  type="text"
                  value={homeVisitAddress}
                  onChange={(e) => setHomeVisitAddress(e.target.value)}
                  required
                  placeholder="Street address, building name, apartment/suite number, landmark"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  On-Site Contact Phone *
                </label>
                <input
                  type="tel"
                  value={homeVisitContactPhone}
                  onChange={(e) => setHomeVisitContactPhone(e.target.value)}
                  required
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Access Instructions / Gate Code
                </label>
                <input
                  type="text"
                  value={homeVisitInstructions}
                  onChange={(e) => setHomeVisitInstructions(e.target.value)}
                  placeholder="e.g. Gate code #4012, 3rd floor with elevator, ring front doorbell"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all"
              >
                Schedule Confirmed Home Visit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------- TAB: MY APPOINTMENTS / BOOKING HISTORY ----------------- */}
      {activeTab === 'appointments' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Your Appointments & Bookings</h2>
              <p className="text-xs text-slate-500">Real clinical appointments scheduled for {displayName}.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('book-appointment')}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Clinic</span>
              </button>
              <button
                onClick={() => setActiveTab('book-home-visit')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Book Home Visit</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {allAppointments.length === 0 ? (
              <div className="py-14 text-center text-slate-400 space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Appointments Recorded</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You do not have any active appointments or prior booking history. Schedule a consultation or request a home care visit.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('book-appointment')}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Schedule In-Clinic
                  </button>
                  <button
                    onClick={() => setActiveTab('book-home-visit')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Book Home Visit
                  </button>
                </div>
              </div>
            ) : (
              allAppointments.map((appt: any) => (
                <div
                  key={appt.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4 text-xs transition-all hover:border-teal-500/40"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded text-[11px]">
                        Token #{appt.tokenNumber || appt.token_number || '1'}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {appt.date || appt.dateTime?.split('T')[0]} • {appt.timeSlot || '10:00 AM'}
                      </span>
                      {appt.visitType === 'Home Visit' ? (
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Home className="w-3 h-3" /> Home Visit
                        </span>
                      ) : (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          In-Clinic
                        </span>
                      )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300">
                      Doctor: <strong className="text-slate-900 dark:text-white">{appt.doctorName || 'Assigned Physician'}</strong> {appt.doctorSpecialty ? `(${appt.doctorSpecialty})` : ''}
                    </p>

                    <p className="text-slate-500 text-[11px]">
                      Reason: {appt.chiefComplaint || 'Consultation Request'}
                    </p>

                    {appt.homeVisitAddress && (
                      <p className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Address: {appt.homeVisitAddress}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={appt.status || 'Scheduled'} size="sm" />
                    <button
                      onClick={() => onOpenPrintModal('token', { appointment: appt })}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Token</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: MY INVOICE HISTORY & ONLINE PAYMENT ----------------- */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Your Invoices & Payment Statements</h2>
              <p className="text-xs text-slate-500">Review paid receipts and settle outstanding medical balances online.</p>
            </div>
            {unpaidInvoices.length > 0 && (
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs px-3 py-1 rounded-xl">
                {unpaidInvoices.length} Unpaid Bill{unpaidInvoices.length > 1 ? 's' : ''} (${outstandingTotal.toFixed(2)} due)
              </span>
            )}
          </div>

          <div className="space-y-3">
            {invoicesState.length === 0 ? (
              <div className="py-14 text-center text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Invoices on Record</p>
                <p className="text-xs text-slate-400">All paid receipts and clinic billing invoices will appear here.</p>
              </div>
            ) : (
              invoicesState.map((inv) => {
                const isPaid = inv.status === 'Paid';
                const balance = inv.balanceAmount !== undefined ? inv.balanceAmount : Math.max(0, inv.grandTotal - (inv.paidAmount || 0));

                return (
                  <div
                    key={inv.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Invoice Date: {inv.createdAt?.split('T')[0] || '2026-09-01'} • Due: {inv.dueDate || 'Upon Receipt'}
                      </p>
                      {inv.transactionReference && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Txn Ref: {inv.transactionReference}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-950 dark:text-white">
                          ${(inv.grandTotal || 0).toFixed(2)}
                        </span>
                        {!isPaid && balance > 0 && (
                          <p className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">${balance.toFixed(2)} balance due</p>
                        )}
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenPrintModal('invoice', { invoice: inv })}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                        title="Download / Print Invoice Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: MY MEDICAL & VISIT HISTORY ----------------- */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Clinical Visit & Medical History</h2>
            <p className="text-xs text-slate-500">Access verified digital prescriptions (Rx) and official laboratory reports.</p>
          </div>

          {/* Section A: Digital Prescriptions */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Digital Prescriptions & Medications</span>
            </h3>

            {prescriptions.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-slate-400 text-xs">
                No electronic prescriptions issued yet for this patient account.
              </div>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>
                      <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{rx.prescriptionNumber}</span>
                      <span className="text-slate-500 ml-2">Date: {rx.createdAt?.split('T')[0]}</span>
                    </div>
                    <button
                      onClick={() => onOpenPrintModal('prescription', { prescription: rx })}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" />
                      <span>Print Rx</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300"><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block">Prescribed Medicines:</span>
                    {rx.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Pill className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white">{item.medicineName}</span>
                        <span>— {item.dosage}, {item.frequency} for {item.duration} ({item.timing})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section B: Diagnostic Lab Reports */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-teal-600" />
              <span>Diagnostic Pathology & Radiology Test Results</span>
            </h3>

            {labOrders.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-slate-400 text-xs">
                No diagnostic laboratory test records found.
              </div>
            ) : (
              labOrders.map((lab) => (
                <div key={lab.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{lab.orderNumber}</span>
                      <span className="text-slate-500 ml-2">Ordered by {lab.doctorName}</span>
                    </div>
                    <button
                      onClick={() => onOpenPrintModal('lab_report', { labOrder: lab })}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" />
                      <span>Print Lab Report</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b">
                          <th className="p-2.5">Test</th>
                          <th className="p-2.5">Result</th>
                          <th className="p-2.5">Reference Range</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lab.tests?.map((t, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{t.testName}</td>
                            <td className={`p-2.5 font-extrabold ${t.isAbnormal ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                              {t.resultValue} {t.units}
                            </td>
                            <td className="p-2.5 text-slate-500">{t.normalRange}</td>
                            <td className="p-2.5 text-center">
                              {t.isAbnormal ? (
                                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded text-[10px]">Abnormal</span>
                              ) : (
                                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[10px]">Normal</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: MY PROFILE ----------------- */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">My Patient Health Profile</h2>
              <p className="text-xs text-slate-500">Review and maintain your official medical demographic and emergency contact records.</p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Edit Profile Information
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            /* Profile Read Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Full Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{displayName}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Patient ID</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm font-mono">{patient.patientId || 'PAT-0001'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Email Address</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.email || '—'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Phone Number</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.phone || '—'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Date of Birth</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.dateOfBirth || '—'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Gender & Blood Group</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.gender} • {patient.bloodGroup || 'O+'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1 sm:col-span-2">
                <span className="text-slate-400 font-semibold text-[11px] block">Residential Address</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.address || '—'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-slate-400 font-semibold text-[11px] block">Emergency Contact</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {(patient as any).emergencyContactName || 'Family Contact'} ({(patient as any).emergencyContactPhone || patient.phone})
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1 sm:col-span-3">
                <span className="text-slate-400 font-semibold text-[11px] block">Known Clinical Allergies</span>
                <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {(patient.allergies && patient.allergies.length > 0) ? patient.allergies.join(', ') : 'None documented'}
                </p>
              </div>
            </div>
          ) : (
            /* Profile Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Home Address</label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={profileForm.emergencyContactName}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={profileForm.emergencyContactPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ----------------- TAB: REFER A FRIEND & FAMILY ----------------- */}
      {activeTab === 'referrals' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              <span>Community Care Referral Program</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Refer a Friend & Family
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Share health and wellness with loved ones. They get 10% off their first consultation, and you receive $25 credit on your next appointment or diagnostic test.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Share link & channels card */}
            <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-4 text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white block">Your Unique Referral Code</span>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-mono text-sm font-black text-teal-600 dark:text-teal-400">{referralCode}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Instant Share Channels</span>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Share via WhatsApp</span>
                </button>
                <button
                  onClick={handleShareEmail}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Share via Email</span>
                </button>
              </div>
            </div>

            {/* Direct Friend Invite Form */}
            <div className="lg:col-span-2 space-y-5">
              <form onSubmit={handleSendReferral} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 space-y-4 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Send Direct Care Invitation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Friend / Family Name *</label>
                    <input
                      type="text"
                      value={referralFriendName}
                      onChange={(e) => setReferralFriendName(e.target.value)}
                      required
                      placeholder="e.g. Priya Patel"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={referralFriendPhone}
                      onChange={(e) => setReferralFriendPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                  >
                    Send Referral Invitation
                  </button>
                </div>
              </form>

              {/* Referrals Status Tracking */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                  Your Referral Invitations & Rewards
                </h3>
                {referralsList.length === 0 ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-slate-400 text-xs">
                    No referrals sent yet. Invite friends or family members to begin earning healthcare credits.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referralsList.map((ref) => (
                      <div
                        key={ref.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{ref.newPatientName}</p>
                          <p className="text-[11px] text-slate-400">Date: {ref.referralDate || '2026-09-01'} • {ref.newPatientPhone}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            {ref.status}
                          </span>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                            ${ref.rewardAmount || 25} Reward
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- ONLINE PAYMENT MODAL ----------------- */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">Secure Online Payment</h3>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{payingInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Patient Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{displayName}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Amount Due:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ${(payingInvoice.balanceAmount || payingInvoice.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Card', label: 'Credit Card', icon: CreditCard },
                  { id: 'UPI', label: 'UPI / QR', icon: DollarSign },
                  { id: 'NetBanking', label: 'Net Banking', icon: Home },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'Card' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs">
                <label className="block text-slate-500 mb-1">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleProcessOnlinePayment}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize & Pay ${(payingInvoice.balanceAmount || payingInvoice.grandTotal).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
