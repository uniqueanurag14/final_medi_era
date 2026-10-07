import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { DashboardStats } from '../../types/index.ts';
import { Users, UserCheck, UserX, Shield, Activity, RefreshCw, ArrowUpRight } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiRequest<DashboardStats>('/api/v1/dashboard/stats');
    setLoading(false);
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">System Overview</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time user governance metrics and security activity from Cloud SQL PostgreSQL.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono">
            {loading ? '—' : stats?.totalUsers ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Registered in system</span>
        </div>

        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Active</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {loading ? '—' : stats?.activeUsers ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Full access granted</span>
        </div>

        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Inactive</span>
            <UserX className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-700 font-mono">
            {loading ? '—' : stats?.inactiveUsers ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Deactivated accounts</span>
        </div>

        <div
          onClick={() => onNavigate('users')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Suspended</span>
            <UserX className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-700 font-mono">
            {loading ? '—' : stats?.suspendedUsers ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Security locked</span>
        </div>

        <div
          onClick={() => onNavigate('roles')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Roles</span>
            <Shield className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono">
            {loading ? '—' : stats?.totalRoles ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">System &amp; custom</span>
        </div>

        <div
          onClick={() => onNavigate('sessions')}
          className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sessions</span>
            <Activity className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 font-mono">
            {loading ? '—' : stats?.activeSessions ?? 0}
          </div>
          <span className="text-[11px] text-zinc-400 mt-1 block">Active tokens</span>
        </div>
      </div>

      {/* Recent Security Activity Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Recent Security Audit Trail</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Most recent administrative and authentication events</p>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900"
          >
            <span>Full Audit Log</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Action</th>
              <th className="py-2.5 px-4">Resource</th>
              <th className="py-2.5 px-4">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-400">
                  Loading activity...
                </td>
              </tr>
            ) : !stats?.recentAuditLogs || stats.recentAuditLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-500">
                  No recent audit activity.
                </td>
              </tr>
            ) : (
              stats.recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-zinc-500 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-2.5 px-4 font-mono font-medium">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-zinc-600 text-[11px] uppercase">
                    {log.resource}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-900 font-medium">
                    {log.userEmail || 'System / Anonymous'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
