'use client';

import { ALPHABET, getLetterImagePath } from '@/lib/alphabet';
import { ProgressData } from '@/lib/types';

interface AlphabetGridProps {
  selectedLetter: string | null;
  onSelectLetter: (letter: string) => void;
  progress: ProgressData | null;
}

export default function AlphabetGrid({ selectedLetter, onSelectLetter, progress }: AlphabetGridProps) {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
      {ALPHABET.map((item) => {
        const lp = progress?.letters[item.letter];
        const isCompleted = lp?.completed;
        const isAttempted = lp && lp.attemptCount > 0;
        const isSelected = selectedLetter === item.letter;

        let bgClass = 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700';
        if (isCompleted) {
          bgClass = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700';
        } else if (isAttempted) {
          bgClass = 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700';
        }

        if (isSelected) {
          bgClass = 'bg-accent/10 border-accent ring-2 ring-accent/30';
        }

        return (
          <button
            key={item.letter}
            onClick={() => onSelectLetter(item.letter)}
            className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center
                        transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent
                        ${bgClass}`}
            aria-label={`Letra ${item.letter}${isCompleted ? ', completada' : ''}`}
          >
            <img
              src={getLetterImagePath(item.letter)}
              alt={item.letter}
              className="w-8 h-8 object-contain opacity-80"
            />
            <span className="text-[10px] font-bold leading-none">{item.letter}</span>
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
