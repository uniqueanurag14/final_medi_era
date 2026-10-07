import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  X,
  CheckCircle2,
  Shield,
  Heart,
  AlertCircle,
  AlertTriangle,
  Search,
  ExternalLink
} from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patient: Patient) => void;
  onPatientCreated?: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onPatientCreated,
}) => {
  const { currentBranch } = useAuth();
  const branches = dbService.branches;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1990-05-15');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [branchId, setBranchId] = useState(currentBranch?.id || 'branch-01');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Archived'>('Active');
  const [notes, setNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');
  const [insurance, setInsurance] = useState('Self-Pay / Cash');
  const [policyNum, setPolicyNum] = useState('');
  const [allergiesText, setAllergiesText] = useState('None Known');
  const [conditionsText, setConditionsText] = useState('None');
  const [medicationsText, setMedicationsText] = useState('None');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live duplicate detection
  const duplicateMatch = useMemo(() => {
    if (!phone && !email) return undefined;
    return dbService.checkDuplicatePatient(phone, email);
  }, [phone, email]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation rules
    if (!firstName.trim() || !lastName.trim()) {
      setValidationError('First and last names are strictly required.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) {
      setValidationError('Please enter a valid phone number (at least 7 digits).');
      return;
    }
    if (duplicateMatch) {
      const confirmDup = window.confirm(
        `A patient with this contact already exists (${duplicateMatch.firstName} ${duplicateMatch.lastName} - ${duplicateMatch.patientId}). Do you still wish to register a separate record?`
      );
      if (!confirmDup) return;
    }

    try {
      const selectedBranch = branches.find((b) => b.id === branchId) || currentBranch;
      const patient = dbService.createPatient({
        organizationId: 'org-01',
        branchId: branchId || currentBranch?.id || 'branch-01',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob,
        gender,
        bloodGroup,
        phone: phone.trim(),
        email: email.trim() || `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}@example.com`,
        address: address.trim() || '123 Medical Way',
        city: selectedBranch?.city || 'Metro City',
        emergencyContactName: emergencyName.trim() || 'Emergency Contact',
        emergencyContactPhone: emergencyPhone.trim() || phone.trim(),
        emergencyRelationship: emergencyRel,
        status,
        notes: notes.trim() || undefined,
        insuranceProvider: insurance.trim() || 'Self-Pay / Cash',
        insurancePolicyNumber: policyNum.trim() || `POL-${Math.floor(10000 + Math.random() * 90000)}`,
        allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
        medicalConditions: conditionsText.split(',').map((s) => s.trim()).filter(Boolean),
        currentMedications: medicationsText.split(',').map((s) => s.trim()).filter(Boolean),
        category: 'New',
      });

      if (onSuccess) onSuccess(patient);
      if (onPatientCreated) onPatientCreated(patient);
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to create patient profile.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">New Patient Registration</h3>
              <p className="text-xs text-slate-400">Intake & Clinical EHR Profile • Automatic Duplicate Screening</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning banner */}
        {duplicateMatch && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Possible Duplicate Patient Detected: </strong>
              <span>
                "{duplicateMatch.firstName} {duplicateMatch.lastName}" ({duplicateMatch.patientId}) matches this phone or email.
              </span>
            </div>
          </div>
        )}

        {/* Validation error banner */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center gap-2 text-xs text-rose-800 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 border-b border-slate-200 pb-1">
              1. Personal & Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                >
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. 742 Evergreen Terrace"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Clinic Branch *</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Account Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="Active">Active (Bookings & Consultations Allowed)</option>
                  <option value="Inactive">Inactive (Suspended / Dormant)</option>
                  <option value="Archived">Archived (Cold Records)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Profile */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 border-b border-slate-200 pb-1">
              2. Medical History & Allergies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Known Allergies (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Chronic Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Current Medications</label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg"
                  value={medicationsText}
                  onChange={(e) => setMedicationsText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact & Insurance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 border-b border-slate-200 pb-1">
              3. Emergency Contact & Insurance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 111-2222"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Insurance Provider</label>
                <input
                  type="text"
                  placeholder="e.g. BlueCross / Self-Pay"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-600 font-semibold mb-1">Administrative / Intake Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes regarding patient preferences, mobility assistance, VIP handling..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Register Patient & Generate ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
