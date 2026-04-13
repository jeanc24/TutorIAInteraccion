'use client';

import { getLetterIndex, TOTAL_LETTERS } from '@/lib/alphabet';

interface LetterNavigationProps {
  currentLetter: string;
  onPrev: () => void;
  onNext: () => void;
  onOpenSelector: () => void;
}

export default function LetterNavigation({ currentLetter, onPrev, onNext, onOpenSelector }: LetterNavigationProps) {
  const idx = getLetterIndex(currentLetter);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
      <button
        onClick={onPrev}
        className="btn-secondary flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto"
        aria-label="Letra anterior"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Anterior
      </button>

      <button
        onClick={onOpenSelector}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors w-full sm:w-auto"
        aria-label="Abrir selector de letras"
      >
        <span className="text-xl font-bold text-accent">{currentLetter}</span>
        <span className="text-sm text-text-secondary">
          {idx + 1} de {TOTAL_LETTERS}
        </span>
      </button>

      <button
        onClick={onNext}
        className="btn-primary flex items-center justify-center gap-1.5 text-sm w-full sm:w-auto"
        aria-label="Siguiente letra"
      >
        Siguiente
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
