import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Calendar,
  User,
  Server,
  Terminal,
  Clock,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  FileCode,
  X
} from 'lucide-react';

interface AuditRecord {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

interface AdminAuditLogsPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminAuditLogsPage: React.FC<AdminAuditLogsPageProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedModule !== 'all') params.append('module', selectedModule);
      if (selectedAction !== 'all') params.append('action', selectedAction);
      params.append('limit', '100');

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        setTotalCount(json.total || 0);
      } else {
        throw new Error(json.error || 'Failed to fetch audit logs');
      }
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err?.message || 'Failed to connect to database audit service');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedModule, selectedAction]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Real CSV Export
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'User Email', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Metadata'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.userEmail || ''}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.resourceId || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.metadata || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distinct modules & actions from current logs
  const availableModules = Array.from(new Set(logs.map((l) => l.resource))).filter(Boolean);
  const availableActions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REVOKE') || action.includes('FAIL')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('BOOTSTRAP') || action.includes('CREATE') || action.includes('REGISTERED') || action.includes('SCHEDULED')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('STATUS')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6" id="admin-audit-logs-page">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Audit & Governance Trail
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-slate-100">
              <Database className="w-3 h-3 text-teal-400" />
              {totalCount} Real DB Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent, tamper-evident record of all database modifications, user authentications, and clinical system actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="audit-export-btn"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            id="audit-refresh-btn"
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="audit-search-input"
              type="text"
              placeholder="Search by action, email, resource or metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-teal-600 focus:border-teal-600 text-slate-800 transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="audit-module-filter"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Modules</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
              {!availableModules.includes('users') && <option value="users">users</option>}
              {!availableModules.includes('patients') && <option value="patients">patients</option>}
              {!availableModules.includes('appointments') && <option value="appointments">appointments</option>}
              {!availableModules.includes('invoices') && <option value="invoices">invoices</option>}
              {!availableModules.includes('settings') && <option value="settings">settings</option>}
            </select>

            <select
              id="audit-action-filter"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Actions</option>
              {availableActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
              {!availableActions.includes('SYSTEM_BOOTSTRAP') && <option value="SYSTEM_BOOTSTRAP">SYSTEM_BOOTSTRAP</option>}
              {!availableActions.includes('PATIENT_REGISTERED') && <option value="PATIENT_REGISTERED">PATIENT_REGISTERED</option>}
              {!availableActions.includes('APPOINTMENT_SCHEDULED') && <option value="APPOINTMENT_SCHEDULED">APPOINTMENT_SCHEDULED</option>}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {logs.length} of {totalCount} records
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="audit-table">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Resource / Entity</th>
                <th className="py-3 px-4">Network / IP</th>
                <th className="py-3 px-4">Payload Preview</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                    <span className="font-semibold">Loading real audit records from database...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-800 text-sm">No Audit Logs Found</p>
                    <p className="text-slate-400 text-xs max-w-md mx-auto mt-1">
                      {searchQuery || selectedModule !== 'all' || selectedAction !== 'all'
                        ? 'No logs match your current search criteria. Try clearing the filter.'
                        : 'No audit records currently in the database. As administrative and clinical activities take place, all security and data events will be permanently recorded here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(log)}
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                        {log.userEmail || 'system'}
                      </span>
                      {log.userId && (
                        <span className="text-[10px] text-slate-400 font-mono">User #{log.userId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          ID: {log.resourceId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate font-mono text-[11px]" title={log.metadata || ''}>
                      {log.metadata ? log.metadata : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(log);
                        }}
                        className="px-2.5 py-1 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspector Drawer / Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Audit Log Entry #{selectedRecord.id}</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Action Event</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{selectedRecord.action}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Resource</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{selectedRecord.resource} {selectedRecord.resourceId ? `(${selectedRecord.resourceId})` : ''}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actor Email</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{selectedRecord.userEmail || 'System Process'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Timestamp</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{new Date(selectedRecord.createdAt).toUTCString()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client IP Address</span>
                  <p className="font-mono text-slate-800 mt-0.5">{selectedRecord.ipAddress || 'Internal Loopback'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">User Agent</span>
                  <p className="font-mono text-slate-800 mt-0.5 truncate" title={selectedRecord.userAgent || ''}>
                    {selectedRecord.userAgent || 'Standard API Client'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Metadata & Event Payload (JSON)
                </span>
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedRecord.metadata
                    ? (() => {
                        try {
                          return JSON.stringify(JSON.parse(selectedRecord.metadata), null, 2);
                        } catch {
                          return selectedRecord.metadata;
                        }
                      })()
                    : 'No additional metadata attached.'}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
