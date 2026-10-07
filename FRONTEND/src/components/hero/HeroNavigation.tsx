import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface HeroNavigationProps {
  currentIndex: number;
  totalSlides: number;
  isPaused: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  onTogglePause: () => void;
}

export const HeroNavigation: React.FC<HeroNavigationProps> = ({
  currentIndex,
  totalSlides,
  isPaused,
  onPrev,
  onNext,
  onSelect,
  onTogglePause,
}) => {
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Slide Counter */}
      <div className="flex items-baseline gap-1 text-xs font-mono font-bold">
        <span className="text-teal-600 dark:text-teal-400 text-sm">
          {formatNumber(currentIndex + 1)}
        </span>
        <span className="text-slate-400 dark:text-slate-500">/</span>
        <span className="text-slate-500 dark:text-slate-400">
          {formatNumber(totalSlides)}
        </span>
      </div>

      {/* Numbered / Dot Indicators */}
      <div className="flex items-center gap-1.5 mx-2">
        {Array.from({ length: totalSlides }).map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'w-8 bg-teal-600 dark:bg-teal-400 shadow-xs'
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
            />
          );
        })}
      </div>

      {/* Controls: Prev, Play/Pause, Next */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          aria-label="Previous slide"
          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePause}
          aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
          title={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <Play className="w-4 h-4 text-teal-600" /> : <Pause className="w-4 h-4" />}
        </button>

        <button
          onClick={onNext}
          aria-label="Next slide"
          className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
