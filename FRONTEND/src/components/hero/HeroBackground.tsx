import React from 'react';
import { HeroSlide } from './hero-config';

interface HeroBackgroundProps {
  slides: HeroSlide[];
  currentIndex: number;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  slides,
  currentIndex,
}) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Background Images with Crossfade */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className={`w-full h-full object-cover transition-transform duration-7000 ease-out ${
                isCurrent ? 'scale-105' : 'scale-100'
              }`}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          </div>
        );
      })}

      {/* Lighting & Contrast Overlay Gradients:
          Ensures text is crisp and readable in both Light mode and Dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/40 transition-colors duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-teal-950/10 dark:from-slate-950 dark:via-transparent dark:to-teal-950/30" />
    </div>
  );
};
