import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  change?: string;
  trend?: { value: string; isPositive?: boolean };
  isPositive?: boolean;
  icon: LucideIcon;
  iconColor?: 'teal' | 'blue' | 'rose' | 'amber' | 'indigo' | 'emerald';
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  change,
  trend,
  isPositive: propIsPositive,
  icon: Icon,
  iconColor: propIconColor,
  color,
  onClick,
}) => {
  const iconColor = (propIconColor || color || 'teal') as 'teal' | 'blue' | 'rose' | 'amber' | 'indigo' | 'emerald';
  const effectiveChange = change || trend?.value;
  const isPositive = propIsPositive !== undefined ? propIsPositive : (trend?.isPositive !== undefined ? trend.isPositive : true);
  const effectiveSubtitle = subtitle || description;

  const colorMap: Record<string, string> = {
    teal: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900',
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[iconColor] || colorMap.teal}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(effectiveSubtitle || effectiveChange) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {effectiveChange && (
            <span
              className={`font-semibold ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {effectiveChange}
            </span>
          )}
          {effectiveSubtitle && <span className="text-slate-500 dark:text-slate-400">{effectiveSubtitle}</span>}
        </div>
      )}
    </div>
  );
};
