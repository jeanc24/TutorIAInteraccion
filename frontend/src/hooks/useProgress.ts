'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressData, PracticeAttempt } from '@/lib/types';
import { loadProgress, recordAttempt, resetProgress, getCompletedCount } from '@/lib/progress';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const record = useCallback((attempt: PracticeAttempt) => {
    setProgress((prev) => {
      if (!prev) return prev;
      return recordAttempt(prev, attempt);
    });
  }, []);

  const reset = useCallback(() => {
    setProgress(resetProgress());
  }, []);

  const completedCount = progress ? getCompletedCount(progress) : 0;

  return { progress, record, reset, completedCount };
}
