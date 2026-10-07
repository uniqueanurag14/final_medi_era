import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'indigo' | 'purple' | 'slate' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-md',
    lg: 'text-sm px-3 py-1.5 font-semibold rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  switch (status) {
    case 'Completed':
    case 'Paid':
    case 'Delivered':
    case 'Active':
    case 'In Stock':
    case 'Converted':
      return <Badge variant="emerald" size={size}>{status}</Badge>;

    case 'In Consultation':
    case 'Processing':
    case 'Partially Paid':
    case 'Interested':
    case 'Appointment Booked':
      return <Badge variant="blue" size={size}>{status}</Badge>;

    case 'Waiting':
    case 'Pending':
    case 'Issued':
    case 'Ordered':
    case 'Sample Collected':
    case 'Low Stock':
    case 'Contacted':
    case 'On Leave':
      return <Badge variant="amber" size={size}>{status}</Badge>;

    case 'Cancelled':
    case 'No Show':
    case 'Refunded':
    case 'Expired':
    case 'Out of Stock':
    case 'Lost':
      return <Badge variant="rose" size={size}>{status}</Badge>;

    case 'Checked In':
    case 'Confirmed':
      return <Badge variant="teal" size={size}>{status}</Badge>;

    case 'Reviewed':
    case 'New':
      return <Badge variant="indigo" size={size}>{status}</Badge>;

    default:
      return <Badge variant="slate" size={size}>{status}</Badge>;
  }
};
