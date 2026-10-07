import React from 'react';
import { HeroSlide } from './hero-config';
import { Sparkles, CheckCircle2, Star, Calendar, ArrowRight, Home } from 'lucide-react';

interface HeroContentProps {
  slide: HeroSlide;
  onOpenBookingModal: () => void;
  onNavigate: (view: string) => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  slide,
  onOpenBookingModal,
  onNavigate,
}) => {
  const handlePrimaryClick = () => {
    if (slide.primaryCta.action === 'booking') {
      onOpenBookingModal();
    } else if (slide.primaryCta.target) {
      onNavigate(slide.primaryCta.target);
    }
  };

  const handleSecondaryClick = () => {
    if (slide.secondaryCta.action === 'booking') {
      onOpenBookingModal();
    } else if (slide.secondaryCta.target) {
      onNavigate(slide.secondaryCta.target);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/90 dark:bg-teal-950/90 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-300 text-xs font-bold shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
        <span>{slide.eyebrow}</span>
      </div>

      {/* Main Title & Highlight */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
        {slide.title}{' '}
        <span className="text-teal-600 dark:text-teal-400 underline decoration-teal-300 dark:decoration-teal-600 decoration-wavy decoration-2">
          {slide.highlight}
        </span>
      </h1>

      {/* Description */}
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
        {slide.description}
      </p>

      {/* Feature Bullet points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {slide.features.map((feature, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3.5 pt-2">
        <button
          onClick={handlePrimaryClick}
          className="px-6 sm:px-7 py-3.5 rounded-xl text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Calendar className="w-4 h-4" />
          <span>{slide.primaryCta.label}</span>
        </button>

        <button
          onClick={() => onNavigate('patient-home-visit')}
          className="px-5 sm:px-6 py-3.5 rounded-xl text-sm font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-800 shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98"
        >
          <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Book Home Visit</span>
        </button>

        <button
          onClick={handleSecondaryClick}
          className="px-5 py-3.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>{slide.secondaryCta.label}</span>
          <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </button>
      </div>

      {/* Trust & Metrics Row */}
      <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        {slide.rating && (
          <div className="flex items-center gap-2 text-xs">
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {slide.rating.score} ★
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              ({slide.rating.count})
            </span>
          </div>
        )}

        {slide.statBadge && (
          <div className="flex items-center gap-2 text-xs pl-4 border-l border-slate-200 dark:border-slate-700">
            <span className="font-black text-teal-600 dark:text-teal-400 text-base">
              {slide.statBadge.value}
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {slide.statBadge.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
