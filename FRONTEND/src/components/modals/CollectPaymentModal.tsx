import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '../../types';
import { dbService } from '../../services/mockDatabase';
import {
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  X,
  Receipt,
  Building2,
  DollarSign
} from 'lucide-react';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: (invoice: Invoice) => void;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !invoice) return null;

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const { invoice: updatedInvoice } = dbService.payInvoice(
          invoice.id,
          paymentMethod,
          transactionRef,
          'Reception Desk #1'
        );
        setIsProcessing(false);
        onPaymentSuccess(updatedInvoice);
        onClose();
      } catch (e) {
        setIsProcessing(false);
        alert('Payment processing error');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Collect Payment</h3>
              <p className="text-xs text-slate-400">Invoice: {invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Bill Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-900">{invoice.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Due Date:</span>
              <span className="text-slate-700">{invoice.dueDate}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
              <span>Amount Due:</span>
              <span className="text-teal-700">${invoice.balanceAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'UPI' as PaymentMethod, label: 'UPI / QR', icon: QrCode },
                { id: 'Cash' as PaymentMethod, label: 'Cash', icon: Banknote },
                { id: 'Card' as PaymentMethod, label: 'Debit / Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === m.id
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-teal-600" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'UPI' && (
            <div className="bg-teal-50/50 border border-teal-200 p-3 rounded-xl flex items-center gap-3">
              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-teal-200 flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[11px] text-teal-900">
                <p className="font-bold">Scan to Pay via UPI</p>
                <p className="text-slate-600 mt-0.5">apexhealth@upi • Instant verification enabled</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Transaction / Reference Number
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleProcessPayment}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'Recording Payment...' : `Confirm Receipt ($${invoice.balanceAmount.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
