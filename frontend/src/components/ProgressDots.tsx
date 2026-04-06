'use client';

import { ALPHABET } from '@/lib/alphabet';
import { ProgressData } from '@/lib/types';

interface ProgressDotsProps {
  progress: ProgressData | null;
  className?: string;
}

export default function ProgressDots({ progress, className = '' }: ProgressDotsProps) {
  const completedCount = progress
    ? Object.values(progress.letters).filter((l) => l.completed).length
    : 0;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex gap-[3px] flex-wrap">
        {ALPHABET.map((letter) => {
          const isCompleted = progress?.letters[letter.letter]?.completed;
          return (
            <div
              key={letter.letter}
              className={`w-2 h-2 rounded-full transition-colors ${
                isCompleted
                  ? 'bg-success'
                  : 'bg-stone-200 dark:bg-stone-700'
              }`}
              title={`${letter.letter}: ${isCompleted ? 'Completada' : 'Pendiente'}`}
            />
          );
        })}
      </div>
      <span className="text-sm font-medium text-text-secondary whitespace-nowrap">
        {completedCount}/{ALPHABET.length}
      </span>
    </div>
  );
}
