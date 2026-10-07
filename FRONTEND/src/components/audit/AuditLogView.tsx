import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { AuditLog, PaginatedResult } from '../../types/index.ts';
import { ShieldAlert, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  // Selected Log for metadata inspection
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = async (currentPage = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', '15');
    if (actionFilter) params.set('action', actionFilter);
    if (resourceFilter) params.set('resource', resourceFilter);
    if (emailFilter) params.set('userEmail', emailFilter);

    const res = await apiRequest<PaginatedResult<AuditLog>>(`/api/v1/audit-logs?${params.toString()}`);
    setLoading(false);

    if (res.success && res.data) {
      setLogs(res.data.items);
      setPage(res.data.meta.page);
      setTotalPages(res.data.meta.totalPages);
      setTotalRecords(res.data.meta.total);
    }
  };

  useEffect(() => {
    fetchAuditLogs(1);
  }, [actionFilter, resourceFilter, emailFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAuditLogs(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Security Audit Logs</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Immutable log of all user authentication events, account updates, and permission changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAuditLogs(page)}
            disabled={loading}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Actions</option>
          <option value="SUCCESSFUL_LOGIN">SUCCESSFUL_LOGIN</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_UPDATED">USER_UPDATED</option>
          <option value="USER_DELETED">USER_DELETED</option>
          <option value="PASSWORD_CHANGED">PASSWORD_CHANGED</option>
          <option value="SESSION_REVOKED">SESSION_REVOKED</option>
          <option value="ROLE_CREATED">ROLE_CREATED</option>
          <option value="SETTING_UPDATED">SETTING_UPDATED</option>
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Resources</option>
          <option value="auth">auth</option>
          <option value="users">users</option>
          <option value="roles">roles</option>
          <option value="sessions">sessions</option>
          <option value="settings">settings</option>
        </select>

        <input
          type="text"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          placeholder="Filter by email"
          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900 w-48"
        />

        {(actionFilter || resourceFilter || emailFilter) && (
          <button
            onClick={() => {
              setActionFilter('');
              setResourceFilter('');
              setEmailFilter('');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Resource</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400">
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No audit log records match the current criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isFail = log.action.includes('FAILED') || log.action.includes('BLOCKED');
                const isDelete = log.action.includes('DELETED');
                const isCreate = log.action.includes('CREATED');

                return (
                  <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isFail
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isDelete
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : isCreate
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-600 uppercase text-[11px]">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 text-zinc-900 font-medium">
                      {log.userEmail || (log.userId ? `User #${log.userId}` : 'System / Anonymous')}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {log.metadata ? (
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 p-1 hover:bg-zinc-100 rounded"
                          title="View metadata payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-800">{logs.length}</strong> of{' '}
            <strong className="text-zinc-800">{totalRecords}</strong> records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Inspector Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-zinc-200 relative">
            <button
              onClick={() => setInspectLog(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">
              Audit Event: {inspectLog.action}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Recorded on {formatDateTime(inspectLog.createdAt)}
            </p>

            <div className="bg-zinc-900 text-zinc-100 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-72">
              <pre>{JSON.stringify(inspectLog.metadata, null, 2)}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium"
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
