import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { UserSession } from '../../types/index.ts';
import { ShieldCheck, Monitor, Smartphone, Globe, Trash2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const SessionManagementView: React.FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    const res = await apiRequest<UserSession[]>('/api/v1/sessions');
    setLoading(false);
    if (res.success && res.data) {
      setSessions(res.data);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: string | number) => {
    if (!confirm('Are you sure you want to revoke this session? The device will be signed out.')) return;

    const res = await apiRequest(`/api/v1/sessions/${sessionId}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg({ text: 'Session revoked successfully.', type: 'success' });
      fetchSessions();
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to revoke session.', type: 'error' });
    }
  };

  const handleRevokeAllOther = async () => {
    if (!confirm('Revoke all other active sessions? All other devices will be signed out.')) return;

    const res = await apiRequest('/api/v1/sessions/all', { method: 'DELETE' });
    if (res.success) {
      setActionMsg({ text: 'All other sessions have been terminated.', type: 'success' });
      fetchSessions();
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to revoke sessions.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Active Sessions</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor and revoke active authenticated login sessions for this account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSessions}
            disabled={loading}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRevokeAllOther}
            disabled={sessions.length <= 1}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Revoke All Other Sessions
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Session Cards */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs divide-y divide-zinc-200">
        {loading && sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading active sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No active sessions found.</div>
        ) : (
          sessions.map((s) => {
            const isMobile = s.userAgent && /mobile|android|iphone/i.test(s.userAgent);
            return (
              <div key={s.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                    {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900 font-mono">
                        {s.ipAddress || 'Unknown IP'}
                      </span>
                      {s.isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Current Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xl truncate" title={s.userAgent || ''}>
                      {s.userAgent || 'Standard Browser Client'}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 mt-2">
                      <span>Started: {formatDateTime(s.createdAt)}</span>
                      {s.lastUsedAt && <span>Last Active: {formatDateTime(s.lastUsedAt)}</span>}
                    </div>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
