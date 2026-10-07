import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { PatientReferral } from '../../types';
import {
  Gift,
  Plus,
  Users,
  Award,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Sparkles,
  ArrowRight,
  Share2
} from 'lucide-react';

interface AdminReferralsPageProps {
  onNavigate: (view: string) => void;
}

export const AdminReferralsPage: React.FC<AdminReferralsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [referrerId, setReferrerId] = useState(dbService.patients[0]?.id || '');
  const [referredName, setReferredName] = useState('');
  const [referredPhone, setReferredPhone] = useState('');
  const [rewardDiscount, setRewardDiscount] = useState(25);

  const referrals = dbService.patientReferrals;
  const patients = dbService.patients;

  const totalReferrals = referrals.length;
  const convertedCount = referrals.filter((r) => r.status === 'Completed' || r.status === 'Converted').length;
  const totalRewardsIssued = referrals.filter((r) => r.rewardStatus === 'Issued').length * 25;

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    const referrer = dbService.getPatientById(referrerId);
    if (!referrer || !referredName || !referredPhone) return;

    dbService.createReferral({
      referrerPatientId: referrer.id,
      referrerPatientName: `${referrer.firstName} ${referrer.lastName}`,
      referredName,
      referredPhone,
      status: 'Pending Contact',
      rewardStatus: 'Pending',
      rewardAmount: Number(rewardDiscount),
    });

    setIsModalOpen(false);
    setReferredName('');
    setReferredPhone('');
    alert(`Referral logged! Welcome package scheduled for ${referredName}.`);
  };

  const handleIssueReward = (referralId: string) => {
    dbService.issueReferralReward(referralId);
    alert(`$25 Care Voucher issued to referring patient!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Referral & Advocacy Program
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Gift className="w-3 h-3 text-emerald-600" />
              Word of Mouth Growth
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track patient-to-patient recommendations, reward advocates with consultation credits & analyze conversion yields
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log New Referral
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Total Referrals</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalReferrals}</p>
          <span className="text-[10px] text-purple-700 font-semibold">Recommended by patients</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Converted Patients</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{convertedCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{totalReferrals > 0 ? ((convertedCount / totalReferrals) * 100).toFixed(0) : '0'}% Conversion rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Rewards Issued</span>
            <Gift className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">${totalRewardsIssued}</p>
          <span className="text-[10px] text-slate-500 font-semibold">In wellness credits</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Top Advocate</span>
            <Award className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-lg font-black text-teal-800 mt-1 truncate">
            {referrals[0]?.referrerPatientName || 'Jane Smith'}
          </p>
          <span className="text-[10px] text-teal-600 font-semibold">3 Successful Referrals</span>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3.5">Referrer Patient (Advocate)</th>
              <th className="p-3.5">Referred Friend / Family</th>
              <th className="p-3.5">Referral Date</th>
              <th className="p-3.5">Consultation Status</th>
              <th className="p-3.5">Advocate Reward</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {referrals.map((ref) => (
              <tr key={ref.id} className="hover:bg-slate-50">
                <td className="p-3.5">
                  <button
                    onClick={() => onNavigate(`admin-patient-detail-${ref.referrerPatientId}`)}
                    className="font-bold text-slate-900 hover:text-teal-600"
                  >
                    {ref.referrerPatientName}
                  </button>
                  <span className="block text-[10px] text-slate-400">Advocate ID: {ref.referrerPatientId}</span>
                </td>

                <td className="p-3.5">
                  <p className="font-bold text-teal-900">{ref.referredName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{ref.referredPhone}</p>
                </td>

                <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                  {ref.createdAt.split('T')[0]}
                </td>

                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ref.status === 'Completed' || ref.status === 'Converted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ref.status}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-800">${ref.rewardAmount || 25} Credit</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        ref.rewardStatus === 'Issued'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ref.rewardStatus}
                    </span>
                  </div>
                </td>

                <td className="p-3.5 text-right">
                  {ref.rewardStatus !== 'Issued' ? (
                    <button
                      onClick={() => handleIssueReward(ref.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs inline-flex items-center gap-1"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Issue $25 Credit
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reward Credited
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOG REFERRAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Log Patient Recommendation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Referring Advocate (Current Patient) *</label>
                <select
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referred Person Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Samuel Jackson"
                  value={referredName}
                  onChange={(e) => setReferredName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Referred Person Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 345-6789"
                  value={referredPhone}
                  onChange={(e) => setReferredPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Advocate Reward Credit ($)</label>
                <input
                  type="number"
                  value={rewardDiscount}
                  onChange={(e) => setRewardDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Log Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
