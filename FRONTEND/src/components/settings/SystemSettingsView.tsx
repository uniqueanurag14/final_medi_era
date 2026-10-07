import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { SystemSetting } from '../../types/index.ts';
import { Sliders, Shield, Database, CheckCircle2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const SystemSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const fetchSettingsAndHealth = async () => {
    setLoading(true);
    const [settRes, healthRes] = await Promise.all([
      apiRequest<SystemSetting[]>('/api/v1/settings'),
      apiRequest<{ status: string; timestamp: string }>('/api/health'),
    ]);
    setLoading(false);

    if (settRes.success && settRes.data) {
      setSettings(settRes.data);
      const initialMap: Record<string, string> = {};
      settRes.data.forEach((s) => {
        initialMap[s.key] = s.value;
      });
      setEditValues(initialMap);
    }

    if (healthRes.success) {
      setHealthStatus(healthRes.data || healthRes);
    }
  };

  useEffect(() => {
    fetchSettingsAndHealth();
  }, []);

  const handleSaveSetting = async (key: string) => {
    const value = editValues[key];
    if (value === undefined) return;

    setSavingKey(key);
    setActionMsg(null);

    const res = await apiRequest(`/api/v1/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });

    setSavingKey(null);
    if (res.success) {
      setActionMsg({ text: `Setting "${key}" updated successfully.`, type: 'success' });
      fetchSettingsAndHealth();
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to update setting.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">System Settings &amp; Security Policy</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure system-wide authentication constraints, inactivity timeouts, and database status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSettingsAndHealth}
            disabled={loading}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Cloud SQL Database Health Block */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Cloud SQL (PostgreSQL) Status</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Connected via Drizzle ORM to PostgreSQL instance in asia-southeast1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Operational
          </span>
        </div>
      </div>

      {/* Security Policies List */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs divide-y divide-zinc-200">
        <div className="p-4 bg-zinc-50 flex items-center gap-2 text-xs font-semibold text-zinc-700 uppercase tracking-wider">
          <Shield className="w-4 h-4 text-zinc-600" />
          <span>Security &amp; Inactivity Parameters</span>
        </div>

        {loading && settings.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading settings...</div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">No settings found.</div>
        ) : (
          settings.map((s) => (
            <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md">
                <span className="text-xs font-mono font-semibold text-zinc-900 block mb-0.5">
                  {s.key}
                </span>
                <span className="text-xs text-zinc-500 block leading-relaxed">{s.description}</span>
                <span className="text-[11px] text-zinc-400 block mt-1">
                  Last updated: {formatDateTime(s.updatedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValues[s.key] ?? s.value}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      [s.key]: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 border border-zinc-300 rounded-lg text-xs font-mono bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900 w-44"
                />
                <button
                  onClick={() => handleSaveSetting(s.key)}
                  disabled={savingKey === s.key || editValues[s.key] === s.value}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingKey === s.key ? 'Saving...' : 'Apply'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
