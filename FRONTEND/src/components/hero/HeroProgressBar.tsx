import React from 'react';

interface HeroProgressBarProps {
  progress: number; // 0 to 100
  isPaused: boolean;
}

export const HeroProgressBar: React.FC<HeroProgressBarProps> = ({
  progress,
  isPaused,
}) => {
  return (
    <div className="w-full h-1 bg-slate-200/40 dark:bg-slate-800/80 overflow-hidden relative">
      <div
        className="h-full bg-teal-500 dark:bg-teal-400 transition-all ease-linear"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          transitionDuration: isPaused ? '0ms' : '100ms',
        }}
      />
    </div>
  );
};
