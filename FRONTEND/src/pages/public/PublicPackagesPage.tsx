import React from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  Heart,
  Activity,
  ArrowRight,
  Info,
  Clock,
  Building2,
  PackageCheck
} from 'lucide-react';

interface PublicPackagesPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (packageName?: string) => void;
}

export const PublicPackagesPage: React.FC<PublicPackagesPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const packages = dbService.packages.filter((p) => p.active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Preventative Health Plans
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Comprehensive Health Checkup Packages
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Tailored wellness evaluations for individuals, seniors, cardiac wellness, and women's health with same-day reports.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('services')}
            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Looking for Individual Procedures? View Services Catalog</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {packages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-xl mx-auto">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Health Packages Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            Checkup packages are configured by administrative staff and will appear here once published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => {
          const savings = pkg.originalPrice - pkg.discountedPrice;
          const discountPct = Math.round((savings / pkg.originalPrice) * 100);

          return (
            <div
              key={pkg.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all bg-white relative ${
                pkg.badge
                  ? 'border-teal-500 shadow-xl ring-2 ring-teal-500/20'
                  : 'border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              {pkg.badge && (
                <span className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                  {pkg.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {pkg.code || 'PKG'}
                  </span>
                  {pkg.departmentName && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {pkg.departmentName}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-lg text-slate-900 mt-2">{pkg.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.tagline}</p>

                <div className="my-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-950">${pkg.discountedPrice}</span>
                  <span className="text-sm text-slate-400 line-through font-semibold">${pkg.originalPrice}</span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-auto">
                    Save ${savings} ({discountPct}% OFF)
                  </span>
                </div>

                {/* Included tests */}
                <div className="space-y-2 border-t border-slate-100 pt-3 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Tests & Procedures ({pkg.servicesIncluded.length}):
                  </p>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {pkg.servicesIncluded.map((srv, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparation Instructions */}
                {pkg.preparationInstructions && (
                  <div className="mb-4 p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Instructions: </span>
                      {pkg.preparationInstructions}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[10px] text-slate-400 text-center font-medium">
                  Valid for {pkg.validityDays} days from purchase
                </div>
                <button
                  onClick={() => onOpenBookingModal(pkg.name)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book Package
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
