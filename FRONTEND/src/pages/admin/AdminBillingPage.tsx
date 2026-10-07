import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Invoice } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Receipt,
  DollarSign,
  Search,
  Filter,
  Printer,
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface AdminBillingPageProps {
  onNavigate: (view: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const AdminBillingPage: React.FC<AdminBillingPageProps> = ({
  onNavigate,
  onOpenPrintModal,
  onOpenPaymentModal,
}) => {
  const invoices = dbService.invoices;
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.items.some((item) => item.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Billing, Invoices & Accounts Receivable
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Invoicing, Digital Receipts, Tax Accounting & Payment Reconciliation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Invoiced Revenue</span>
            <Receipt className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-950">${totalBilled.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">{invoices.length} Generated Invoices</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Collected Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">${totalCollected.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 font-medium">96.4% Collection Efficiency</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending / Outstanding Due</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">${totalOutstanding.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">Desk & insurance co-pays</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice number (INV-2026-0001), patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
          >
            <option value="all">All Invoices ({invoices.length})</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3.5">Invoice #</th>
              <th className="p-3.5">Patient Details</th>
              <th className="p-3.5">Created Date</th>
              <th className="p-3.5">Billed Items</th>
              <th className="p-3.5">Grand Total</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3.5 font-mono font-bold text-slate-900">
                  {inv.invoiceNumber}
                </td>

                <td className="p-3.5">
                  <p className="font-extrabold text-slate-900">{inv.patientName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{inv.patientPhone}</p>
                </td>

                <td className="p-3.5 text-slate-600">
                  {inv.createdAt.split('T')[0]}
                </td>

                <td className="p-3.5 max-w-[220px]">
                  <p className="text-slate-700 truncate font-medium">
                    {inv.items.map((i) => i.description).join(', ')}
                  </p>
                </td>

                <td className="p-3.5">
                  <span className="font-extrabold text-slate-950 text-sm">${inv.grandTotal.toFixed(2)}</span>
                  {inv.balanceAmount > 0 && (
                    <span className="block text-[10px] text-rose-600 font-bold">
                      ${inv.balanceAmount.toFixed(2)} due
                    </span>
                  )}
                </td>

                <td className="p-3.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    inv.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>

                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {inv.status !== 'Paid' && (
                      <button
                        onClick={() => onOpenPaymentModal(inv)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg shadow-xs"
                      >
                        Collect
                      </button>
                    )}
                    <button
                      onClick={() => onOpenPrintModal('invoice', { invoice: inv })}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                      title="Print Invoice Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
