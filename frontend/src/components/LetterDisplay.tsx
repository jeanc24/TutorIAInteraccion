'use client';

import { LetterData, LetterProgress } from '@/lib/types';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/alphabet';
import LetterReferenceFigure from './LetterReferenceFigure';

interface LetterDisplayProps {
  letter: LetterData;
  letterProgress?: LetterProgress;
  onPractice: () => void;
}

export default function LetterDisplay({ letter, letterProgress, onPractice }: LetterDisplayProps) {
  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(letter.difficulty)}`}>
            {getDifficultyLabel(letter.difficulty)}
          </span>
        </div>
        {letterProgress && letterProgress.attemptCount > 0 && (
          <div className="text-right text-sm text-text-secondary">
            <div>Mejor: {Math.round(letterProgress.bestScore * 100)}%</div>
            <div>{letterProgress.attemptCount} intentos</div>
          </div>
        )}
      </div>

      <div className="text-center mb-6">
        <div className="letter-display text-accent mb-2">{letter.letter}</div>

        <LetterReferenceFigure
          letter={letter.letter}
          alt={`Seña de la letra ${letter.letter}: ${letter.description}`}
          variant="full"
        />

        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          {letter.description}
        </p>
      </div>

      <div className="flex justify-center">
        <button onClick={onPractice} className="btn-primary flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Practicar esta letra
        </button>
      </div>

      {letterProgress?.completed && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 text-success text-sm font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Letra dominada
          </span>
        </div>
      )}
    </div>
  );
}
