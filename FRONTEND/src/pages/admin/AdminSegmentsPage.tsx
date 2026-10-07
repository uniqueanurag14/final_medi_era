import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { PatientSegment, PatientTag } from '../../types';
import {
  Layers,
  Plus,
  Users,
  Tag,
  Search,
  Filter,
  Send,
  Sparkles,
  DollarSign,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface AdminSegmentsPageProps {
  onNavigate: (view: string) => void;
}

export const AdminSegmentsPage: React.FC<AdminSegmentsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'segments' | 'tags'>('segments');
  const [selectedSegment, setSelectedSegment] = useState<PatientSegment | null>(null);

  // New Segment Modal
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [segName, setSegName] = useState('');
  const [segDesc, setSegDesc] = useState('');
  const [minVisits, setMinVisits] = useState<number | undefined>(undefined);
  const [minSpend, setMinSpend] = useState<number | undefined>(undefined);
  const [inactiveDays, setInactiveDays] = useState<number | undefined>(undefined);
  const [hasBalance, setHasBalance] = useState(false);

  // New Tag Modal
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('bg-teal-100 text-teal-800');
  const [tagDesc, setTagDesc] = useState('');

  const segments = dbService.getPatientSegments();
  const tags = dbService.getPatientTags();

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segName) return;

    const newSeg = dbService.createPatientSegment({
      name: segName,
      description: segDesc,
      criteria: {
        minVisits: minVisits ? Number(minVisits) : undefined,
        minTotalSpent: minSpend ? Number(minSpend) : undefined,
        daysSinceLastVisit: inactiveDays ? Number(inactiveDays) : undefined,
        hasOutstandingBalance: hasBalance ? true : undefined,
      },
    });

    setIsSegmentModalOpen(false);
    setSegName('');
    setSegDesc('');
    setSelectedSegment(newSeg);
    alert(`Segment "${segName}" created with ${newSeg.memberCount} members!`);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;

    dbService.createPatientTag({
      name: tagName,
      color: tagColor,
      description: tagDesc,
    });

    setIsTagModalOpen(false);
    setTagName('');
    setTagDesc('');
    alert(`Patient Tag "${tagName}" created!`);
  };

  const currentSegmentMembers = selectedSegment
    ? dbService.evaluateSegmentPatients(selectedSegment)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Segmentation & Smart Tagging
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Audience CRM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Group clinical cohorts by visit history, lifetime value, chronic diagnoses, or inactivity to deliver personalized care
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'segments' ? (
            <button
              onClick={() => setIsSegmentModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Segment Rule
            </button>
          ) : (
            <button
              onClick={() => setIsTagModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Patient Tag
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('segments')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'segments'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Dynamic Patient Segments ({segments.length})
        </button>

        <button
          onClick={() => setActiveTab('tags')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'tags'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          Clinical & Behavior Tags ({tags.length})
        </button>
      </div>

      {/* TAB 1: SEGMENTS */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Segments Cards */}
          <div className="lg:col-span-1 space-y-3">
            {segments.map((seg) => {
              const count = dbService.evaluateSegmentPatients(seg).length;
              const isSelected = selectedSegment?.id === seg.id;

              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 text-xs ${
                    isSelected
                      ? 'bg-purple-50/80 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-white border-slate-200 shadow-xs hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-sm">{seg.name}</h3>
                    <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {count} Patients
                    </span>
                  </div>

                  <p className="text-slate-500 text-[11px] leading-relaxed">{seg.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Dynamic Query</span>
                    <span className="text-purple-700 font-bold flex items-center gap-1">
                      View cohort <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Segment Details & Patient List */}
          <div className="lg:col-span-2 space-y-4">
            {selectedSegment ? (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{selectedSegment.name}</h2>
                    <p className="text-slate-500">{selectedSegment.description}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('admin-campaigns')}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Launch Campaign to this Cohort
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">Patient</th>
                        <th className="pb-2">Contact</th>
                        <th className="pb-2">Tags</th>
                        <th className="pb-2 text-right">Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentSegmentMembers.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold text-slate-900">
                            {p.firstName} {p.lastName}
                            <span className="block text-[10px] text-slate-400 font-normal">{p.patientId}</span>
                          </td>
                          <td className="py-2.5 font-mono text-slate-600">{p.phone}</td>
                          <td className="py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {p.tags?.map((t, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  {t}
                                </span>
                              )) || <span className="text-slate-400 italic">None</span>}
                            </div>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => onNavigate(`admin-patient-detail-${p.id}`)}
                              className="text-teal-600 font-bold hover:underline"
                            >
                              Open 360°
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center text-slate-400 text-xs">
                Select an audience segment on the left to preview eligible patients
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TAGS */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <div key={tag.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${tag.color}`}>
                  {tag.name}
                </span>
                <Tag className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-slate-500 text-[11px]">{tag.description || 'Clinical or CRM tag'}</p>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                Created {tag.createdAt.split('T')[0]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SEGMENT MODAL */}
      {isSegmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Define Dynamic Patient Segment</h2>
              <button onClick={() => setIsSegmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSegment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Frequent Care Patients"
                  value={segName}
                  onChange={(e) => setSegName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Segment Description</label>
                <input
                  type="text"
                  placeholder="e.g. Patients with 5+ consultations and total spend > $500"
                  value={segDesc}
                  onChange={(e) => setSegDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Completed Visits</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={minVisits || ''}
                    onChange={(e) => setMinVisits(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Lifetime Spent ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={minSpend || ''}
                    onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inactive for X Days</label>
                  <input
                    type="number"
                    placeholder="e.g. 90"
                    value={inactiveDays || ''}
                    onChange={(e) => setInactiveDays(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="hasBal"
                    checked={hasBalance}
                    onChange={(e) => setHasBalance(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <label htmlFor="hasBal" className="font-bold text-slate-700">Has Unpaid Invoices</label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSegmentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Compute Cohort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TAG MODAL */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Create Patient Tag</h2>
              <button onClick={() => setIsTagModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tag Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP High Net Worth"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tag Color Theme</label>
                <select
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                >
                  <option value="bg-teal-100 text-teal-800">Teal (Clinical/Wellness)</option>
                  <option value="bg-purple-100 text-purple-800">Purple (VIP / Special)</option>
                  <option value="bg-amber-100 text-amber-800">Amber (Monitoring / Care Alert)</option>
                  <option value="bg-rose-100 text-rose-800">Rose (High Risk / Urgent)</option>
                  <option value="bg-blue-100 text-blue-800">Blue (Insurance / Corporate)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Tag for premium executive health package members"
                  value={tagDesc}
                  onChange={(e) => setTagDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTagModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
