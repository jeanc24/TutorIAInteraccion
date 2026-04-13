'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useProgress } from '@/hooks/useProgress';
import { ALPHABET, TOTAL_LETTERS, getDifficultyColor, getDifficultyLabel } from '@/lib/alphabet';

export default function ProgressPage() {
  const { progress, completedCount, reset } = useProgress();

  const stats = useMemo(() => {
    if (!progress) return null;

    const letters = Object.values(progress.letters);
    const attempted = letters.filter((l) => l.attemptCount > 0);
    const completed = letters.filter((l) => l.completed);
    const totalAttempts = letters.reduce((sum, l) => sum + l.attemptCount, 0);
    const avgScore = attempted.length > 0
      ? attempted.reduce((sum, l) => sum + l.bestScore, 0) / attempted.length
      : 0;

    const weakest = letters
      .filter((l) => l.attemptCount > 0 && !l.completed)
      .sort((a, b) => a.bestScore - b.bestScore)
      .slice(0, 5);

    return { attempted: attempted.length, completed: completed.length, totalAttempts, avgScore, weakest };
  }, [progress]);

  const percentage = Math.round((completedCount / TOTAL_LETTERS) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Header completedCount={completedCount} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Progreso</h1>
          <p className="text-text-secondary">Tu avance en el abecedario dactilológico.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-accent">{percentage}%</div>
            <div className="text-xs text-text-secondary mt-1">Progreso total</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-success">{completedCount}</div>
            <div className="text-xs text-text-secondary mt-1">Letras dominadas</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold">{stats?.attempted ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Letras intentadas</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold">{stats?.totalAttempts ?? 0}</div>
            <div className="text-xs text-text-secondary mt-1">Total de intentos</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="card p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Avance del abecedario</span>
            <span className="text-sm text-text-secondary">{completedCount}/{TOTAL_LETTERS}</span>
          </div>
          <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Alphabet grid with details */}
        <div className="card p-4 mb-8">
          <h2 className="font-semibold mb-4">Detalle por letra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ALPHABET.map((item) => {
              const lp = progress?.letters[item.letter];
              const score = lp?.bestScore ?? 0;
              const attempts = lp?.attemptCount ?? 0;
              const isDone = lp?.completed ?? false;

              return (
                <Link
                  key={item.letter}
                  href={`/practice?letter=${item.letter}`}
                  className={`flex items-start sm:items-center gap-3 p-3 rounded-lg transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 ${
                    isDone ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                    isDone
                      ? 'bg-success text-white'
                      : attempts > 0
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                      : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                  }`}>
                    {item.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">Letra {item.letter}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}>
                        {getDifficultyLabel(item.difficulty)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isDone ? 'bg-success' : 'bg-accent'}`}
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary tabular-nums w-8 text-right">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  </div>
                  {isDone && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 sm:mt-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Weak letters */}
        {stats?.weakest && stats.weakest.length > 0 && (
          <div className="card p-4 mb-8">
            <h2 className="font-semibold mb-3">Letras que necesitan más práctica</h2>
            <div className="flex flex-wrap gap-2">
              {stats.weakest.map((lp) => (
                <Link
                  key={lp.letter}
                  href={`/practice?letter=${lp.letter}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <span className="font-bold">{lp.letter}</span>
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    {Math.round(lp.bestScore * 100)}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="text-center">
          <button
            onClick={() => {
              if (confirm('¿Reiniciar todo el progreso? Esta acción no se puede deshacer.')) {
                reset();
              }
            }}
            className="text-sm text-text-secondary hover:text-error transition-colors"
          >
            Reiniciar progreso
          </button>
        </div>
      </main>
    </div>
  );
}
