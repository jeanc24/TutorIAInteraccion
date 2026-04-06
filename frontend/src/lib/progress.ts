import { LetterProgress, PracticeAttempt, ProgressData } from './types';
import { ALPHABET } from './alphabet';

const STORAGE_KEY = 'signtutor_progress';

function createDefaultProgress(): ProgressData {
  const letters: Record<string, LetterProgress> = {};
  for (const l of ALPHABET) {
    letters[l.letter] = {
      letter: l.letter,
      bestScore: 0,
      attemptCount: 0,
      completed: false,
      lastPracticedAt: null,
      firstCompletedAt: null,
    };
  }
  return {
    letters,
    totalCompleted: 0,
    currentStreak: 0,
    lastSessionAt: null,
  };
}

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const data = JSON.parse(raw) as ProgressData;
    for (const l of ALPHABET) {
      if (!data.letters[l.letter]) {
        data.letters[l.letter] = {
          letter: l.letter,
          bestScore: 0,
          attemptCount: 0,
          completed: false,
          lastPracticedAt: null,
          firstCompletedAt: null,
        };
      }
    }
    return data;
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — silent */ }
}

export function recordAttempt(
  progress: ProgressData,
  attempt: PracticeAttempt
): ProgressData {
  const updated = { ...progress, letters: { ...progress.letters } };
  const lp = { ...updated.letters[attempt.letter] };

  lp.attemptCount++;
  lp.lastPracticedAt = attempt.timestamp;

  if (attempt.score > lp.bestScore) {
    lp.bestScore = attempt.score;
  }

  if (attempt.completed && !lp.completed) {
    lp.completed = true;
    lp.firstCompletedAt = attempt.timestamp;
    updated.totalCompleted = Object.values(updated.letters).filter(
      (l) => l.letter === attempt.letter ? true : l.completed
    ).length;
  }

  updated.letters[attempt.letter] = lp;
  updated.lastSessionAt = attempt.timestamp;

  if (attempt.completed) {
    updated.currentStreak++;
  } else {
    updated.currentStreak = 0;
  }

  saveProgress(updated);
  return updated;
}

export function resetProgress(): ProgressData {
  const data = createDefaultProgress();
  saveProgress(data);
  return data;
}

export function getCompletedCount(progress: ProgressData): number {
  return Object.values(progress.letters).filter((l) => l.completed).length;
}

export function getWeakLetters(progress: ProgressData, count = 5): LetterProgress[] {
  return Object.values(progress.letters)
    .filter((l) => !l.completed && l.attemptCount > 0)
    .sort((a, b) => a.bestScore - b.bestScore)
    .slice(0, count);
}
