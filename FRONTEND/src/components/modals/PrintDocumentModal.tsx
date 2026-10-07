import React from 'react';
import { Prescription, Invoice, LabOrder, Appointment, Patient } from '../../types';
import { dbService } from '../../services/mockDatabase';
import {
  Printer,
  Download,
  X,
  HeartPulse,
  CheckCircle2,
  FileText,
  Building2,
  ShieldCheck
} from 'lucide-react';

export type PrintableDocumentType = 'prescription' | 'invoice' | 'lab_report' | 'token';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: PrintableDocumentType;
  prescription?: Prescription;
  invoice?: Invoice;
  labOrder?: LabOrder;
  appointment?: Appointment;
  data?: any;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  documentType,
  prescription: propPrescription,
  invoice: propInvoice,
  labOrder: propLabOrder,
  appointment: propAppointment,
  data,
}) => {
  if (!isOpen) return null;

  const prescription = propPrescription || data?.prescription;
  const invoice = propInvoice || data?.invoice;
  const labOrder = propLabOrder || data?.labOrder;
  const appointment = propAppointment || data?.appointment;

  const org = dbService.organization;
  const branch = dbService.branches[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm">
              Document Preview — {documentType.toUpperCase().replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 print:p-0" id="printable-area">
          {/* Header Banner on all official docs */}
          <div className="border-b-2 border-teal-700 pb-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{org.name}</h1>
                  <p className="text-xs text-teal-800 font-semibold">{org.tagline}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{branch.address}, {branch.city}, {branch.state} • Ph: {branch.phone}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="bg-slate-100 text-slate-800 font-mono px-2 py-1 rounded font-bold">
                  {documentType === 'prescription' && (prescription?.prescriptionNumber || 'RX-2026-001')}
                  {documentType === 'invoice' && (invoice?.invoiceNumber || 'INV-2026-001')}
                  {documentType === 'lab_report' && (labOrder?.orderNumber || 'LAB-2026-001')}
                  {documentType === 'token' && `TOKEN #${appointment?.tokenNumber || '1'}`}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* PRESCRIPTION VIEW */}
          {documentType === 'prescription' && (
            <div className="space-y-6">
              {/* Doctor & Patient Bar */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Consultant Physician</p>
                  <p className="font-extrabold text-sm text-slate-900">{prescription?.doctorName || 'Dr. Sarah Jenkins, MD'}</p>
                  <p className="text-slate-600">{prescription?.doctorQualification || 'MD (Cardiology), FACC'}</p>
                  <p className="text-[10px] text-slate-500">Reg No: {prescription?.doctorRegNumber || 'MED-NY-849201'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Patient Details</p>
                  <p className="font-extrabold text-sm text-slate-900">{prescription?.patientName || 'Rahul Sharma'}</p>
                  <p className="text-slate-600">Age: {prescription?.patientAge || 42} Yrs • Gender: {prescription?.patientGender || 'Male'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Patient ID: {prescription?.patientId || 'PAT-2026-0001'}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <p className="text-xs font-bold uppercase text-slate-500 mb-1">Clinical Diagnosis & Findings:</p>
                <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs font-semibold text-teal-950">
                  {prescription?.diagnosis || 'Essential Hypertension (Stage 1) with Dyslipidemia'}
                </div>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-serif font-black text-teal-800">℞</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Medication</span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Medicine Name & Strength</th>
                        <th className="p-2.5">Dosage & Route</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(prescription?.items || [
                        { id: '1', medicineName: 'Telmisartan 40mg', strength: '40 mg', dosage: '1 Tab', route: 'Oral', frequency: 'Once Daily (1-0-0)', duration: '30 Days', timing: 'Before Food', instructions: 'Take every morning' },
                        { id: '2', medicineName: 'Atorvastatin 20mg', strength: '20 mg', dosage: '1 Tab', route: 'Oral', frequency: 'Once Daily (0-0-1)', duration: '30 Days', timing: 'Bedtime', instructions: 'Take after dinner' },
                      ]).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-extrabold text-slate-900">{item.medicineName}</td>
                          <td className="p-2.5 text-slate-700">{item.dosage} ({item.route})</td>
                          <td className="p-2.5 font-medium text-slate-800">{item.frequency}</td>
                          <td className="p-2.5 text-slate-700">{item.duration}</td>
                          <td className="p-2.5 text-slate-600 text-[11px]">{item.timing}. {item.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* General Advice */}
              {prescription?.advice && (
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 mb-1">General Dietary & Clinical Advice:</p>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {prescription.advice}
                  </p>
                </div>
              )}

              {/* Doctor Signature Block */}
              <div className="pt-8 flex justify-between items-end border-t border-slate-200">
                <div className="text-[11px] text-slate-400">
                  <p>Next Follow-up Date: <strong>{prescription?.followUpDate || 'As advised in 2 weeks'}</strong></p>
                  <p>Generated electronically via Apex Clinic CRM System</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-48 mb-1"></div>
                  <p className="text-xs font-bold text-slate-900">{prescription?.doctorName || 'Dr. Sarah Jenkins, MD'}</p>
                  <p className="text-[10px] text-teal-700 font-semibold">Authorized Physician Seal</p>
                </div>
              </div>
            </div>
          )}

          {/* INVOICE / RECEIPT VIEW */}
          {documentType === 'invoice' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Billed To (Patient)</p>
                  <p className="font-extrabold text-sm text-slate-900">{invoice?.patientName || 'Rahul Sharma'}</p>
                  <p className="text-slate-600">Phone: {invoice?.patientPhone || '+1 (555) 987-1000'}</p>
                  <p className="text-[11px] text-slate-500">Patient ID: {invoice?.patientId || 'PAT-2026-0001'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Payment Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-extrabold ${
                    invoice?.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice?.status.toUpperCase() || 'PAID'}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1.5">Payment Method: <strong>{invoice?.paymentMethod || 'UPI / Online'}</strong></p>
                  <p className="text-[10px] text-slate-400 font-mono">Ref: {invoice?.transactionReference || 'TXN-884920419'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Category</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(invoice?.items || [
                      { id: '1', description: 'Senior Specialist Consultation (Cardiology)', type: 'Consultation', quantity: 1, unitPrice: 120, total: 120 },
                      { id: '2', description: 'Electrocardiogram (ECG 12-Lead)', type: 'Diagnostics', quantity: 1, unitPrice: 65, total: 65 },
                    ]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-900">{item.description}</td>
                        <td className="p-3 text-center text-slate-500">{item.type}</td>
                        <td className="p-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-700">${item.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${(invoice?.subtotal || 185).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Discounts / Concessions:</span>
                    <span className="font-semibold">-${(invoice?.discountTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax:</span>
                    <span className="font-semibold">${(invoice?.taxTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-teal-700">${(invoice?.grandTotal || 185).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded">
                    <span>Amount Paid:</span>
                    <span>${(invoice?.paidAmount || 185).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
                <p>Tax Registration No: {org.taxNumber}</p>
                <p>Thank you for choosing Apex Health Clinics.</p>
              </div>
            </div>
          )}

          {/* LAB REPORT VIEW */}
          {documentType === 'lab_report' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Patient</p>
                  <p className="font-extrabold text-sm text-slate-900">{labOrder?.patientName || 'Rahul Sharma'}</p>
                  <p className="text-slate-600">Referring Doctor: {labOrder?.doctorName || 'Dr. Sarah Jenkins, MD'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Sample Info</p>
                  <p className="text-slate-700 font-medium">Status: <strong className="text-emerald-700">Completed & Reviewed</strong></p>
                  <p className="text-[11px] text-slate-500">Collected: {labOrder?.sampleCollectedAt || '2026-09-01 09:45 AM'}</p>
                </div>
              </div>

              {/* Lab Parameters Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-3">Test Investigation</th>
                      <th className="p-3">Observed Value</th>
                      <th className="p-3">Standard Reference Interval</th>
                      <th className="p-3">Units</th>
                      <th className="p-3 text-center">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(labOrder?.tests || [
                      { testName: 'Total Cholesterol', resultValue: '218', normalRange: '< 200', units: 'mg/dL', isAbnormal: true },
                      { testName: 'HDL (Good) Cholesterol', resultValue: '42', normalRange: '> 40', units: 'mg/dL', isAbnormal: false },
                      { testName: 'LDL (Bad) Cholesterol', resultValue: '138', normalRange: '< 100', units: 'mg/dL', isAbnormal: true },
                      { testName: 'Triglycerides', resultValue: '172', normalRange: '< 150', units: 'mg/dL', isAbnormal: true },
                      { testName: 'Serum Creatinine', resultValue: '0.95', normalRange: '0.7 - 1.3', units: 'mg/dL', isAbnormal: false },
                    ]).map((test, idx) => (
                      <tr key={idx} className={test.isAbnormal ? 'bg-amber-50/40' : ''}>
                        <td className="p-3 font-bold text-slate-900">{test.testName}</td>
                        <td className={`p-3 font-extrabold ${test.isAbnormal ? 'text-rose-700' : 'text-slate-800'}`}>
                          {test.resultValue}
                        </td>
                        <td className="p-3 text-slate-600">{test.normalRange}</td>
                        <td className="p-3 text-slate-500">{test.units}</td>
                        <td className="p-3 text-center">
                          {test.isAbnormal ? (
                            <span className="bg-rose-100 text-rose-800 font-extrabold text-[10px] px-1.5 py-0.5 rounded">HIGH</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 font-semibold text-[10px] px-1.5 py-0.5 rounded">NORMAL</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <p className="font-bold text-slate-700">Doctor Interpretation & Remarks:</p>
                <p className="text-slate-600 mt-1">
                  {labOrder?.doctorRemarks || 'Lipid profile confirms mild atherogenic dyslipidemia. Dietary and statin therapy recommended.'}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[11px] text-slate-400">
                  <p>Certified Laboratory Technologist: Kenneth Vance, MLS</p>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-44 mb-1"></div>
                  <p className="text-xs font-bold text-slate-900">Dr. Sarah Jenkins, MD</p>
                  <p className="text-[10px] text-teal-700 font-semibold">Consultant Review Sign-off</p>
                </div>
              </div>
            </div>
          )}

          {/* QUEUE TOKEN VIEW */}
          {documentType === 'token' && (
            <div className="text-center py-6 space-y-4 max-w-sm mx-auto">
              <div className="border-4 border-dashed border-teal-600 rounded-2xl p-6 bg-teal-50/50">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Reception Waiting Queue</p>
                <div className="my-4">
                  <span className="text-6xl font-black text-teal-800 font-mono tracking-tight">
                    #{appointment?.tokenNumber || '1'}
                  </span>
                </div>
                <p className="text-sm font-extrabold text-slate-900">{appointment?.doctorName || 'Dr. Sarah Jenkins, MD'}</p>
                <p className="text-xs text-teal-700 font-semibold">{appointment?.doctorSpecialty || 'Cardiology'}</p>
                <div className="mt-4 pt-4 border-t border-teal-200 text-xs text-left space-y-1 text-slate-600">
                  <p>Patient: <strong>{appointment?.patientName || 'Rahul Sharma'}</strong></p>
                  <p>Time Slot: <strong>{appointment?.timeSlot || '09:00 AM'}</strong></p>
                  <p>Branch: <strong>{branch.name}</strong></p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Please present this token when your number is announced.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
