import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HERO_SLIDES } from './hero-config';
import { HeroBackground } from './HeroBackground';
import { HeroContent } from './HeroContent';
import { HeroNavigation } from './HeroNavigation';
import { HeroProgressBar } from './HeroProgressBar';
import { ShieldCheck, HeartPulse, Clock, Award } from 'lucide-react';

interface HeroSectionProps {
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
  onNavigate: (view: string) => void;
}

const SLIDE_DURATION_MS = 6000;
const TICK_INTERVAL_MS = 100;

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBookingModal,
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const touchStartXRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = HERO_SLIDES.length;
  const currentSlide = HERO_SLIDES[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Timer & progress bar loop
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const step = (TICK_INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        const nextVal = prev + step;
        if (nextVal >= 100) {
          handleNext();
          return 0;
        }
        return nextVal;
      });
    }, TICK_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      className="relative min-h-[580px] lg:min-h-[640px] flex flex-col justify-between overflow-hidden border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-200"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="MediEra Featured Medical Care Slideshow"
    >
      {/* Dynamic Crossfade Background */}
      <HeroBackground slides={HERO_SLIDES} currentIndex={currentIndex} />

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Slide Content */}
          <div className="lg:col-span-7">
            <HeroContent
              slide={currentSlide}
              onOpenBookingModal={() => onOpenBookingModal()}
              onNavigate={onNavigate}
            />
          </div>

          {/* Right Column: Interactive Clinical Status Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                      MediEra Healthcare
                    </h3>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                      Downtown & North Specialty Centers
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  OPD Open Today
                </span>
              </div>

              {/* Quick Clinical Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Average Wait</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">&lt; 12 Mins</p>
                  <p className="text-[10px] text-slate-400">Live token allocation</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
                    <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Diagnostics</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">Same-Day</p>
                  <p className="text-[10px] text-slate-400">Digital verification</p>
                </div>
              </div>

              {/* Accreditations Banner */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    JCI Accredited & ISO 9001 Certified
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Highest tier clinical protocol compliance and patient safety.
                  </p>
                </div>
              </div>

              {/* Quick Action in Card */}
              <button
                onClick={() => onOpenBookingModal()}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Specialist Availability</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Progress Bar and Slide Navigation */}
      <div className="relative z-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs border-t border-slate-200/60 dark:border-slate-800">
        <HeroProgressBar progress={progress} isPaused={isPaused} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="hidden sm:inline">Featured Focus:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {currentSlide.highlight}
            </strong>
          </div>

          <HeroNavigation
            currentIndex={currentIndex}
            totalSlides={totalSlides}
            isPaused={isPaused}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelect={handleSelect}
            onTogglePause={handleTogglePause}
          />
        </div>
      </div>
    </section>
  );
};
