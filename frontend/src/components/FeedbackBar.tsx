'use client';

import { EvaluationResult } from '@/lib/types';

interface FeedbackBarProps {
  result: EvaluationResult | null;
  isTracking: boolean;
}

const STATUS_CONFIG = {
  idle: { color: 'bg-stone-200', barColor: 'bg-stone-400', textColor: 'text-text-secondary' },
  no_hand: { color: 'bg-stone-200', barColor: 'bg-stone-400', textColor: 'text-text-secondary' },
  tracking: { color: 'bg-amber-100', barColor: 'bg-warning', textColor: 'text-amber-800' },
  holding: { color: 'bg-emerald-100', barColor: 'bg-success', textColor: 'text-emerald-800' },
  success: { color: 'bg-emerald-100', barColor: 'bg-success', textColor: 'text-emerald-800' },
  error: { color: 'bg-red-100', barColor: 'bg-error', textColor: 'text-red-800' },
};

export default function FeedbackBar({ result, isTracking }: FeedbackBarProps) {
  if (!isTracking) return null;

  const status = result?.status ?? 'idle';
  const config = STATUS_CONFIG[status];
  const score = result?.score ?? 0;

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${config.textColor}`}>
          {result?.feedback ?? 'Coloca tu mano frente a la cámara.'}
        </span>
        <span className="font-mono text-text-secondary tabular-nums">
          {Math.round(score * 100)}%
        </span>
      </div>

      <div className={`h-2.5 rounded-full overflow-hidden ${config.color}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${config.barColor}`}
          style={{ width: `${Math.round(score * 100)}%` }}
        />
      </div>

      {status === 'holding' && result && (
        <div className="h-1 rounded-full overflow-hidden bg-emerald-100">
          <div
            className="h-full rounded-full bg-success transition-all duration-100"
            style={{ width: `${Math.round(result.holdProgress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
