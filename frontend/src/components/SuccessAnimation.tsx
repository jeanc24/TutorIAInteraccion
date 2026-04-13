'use client';

import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  letter: string;
  show: boolean;
  onNext: () => void;
  onRepeat: () => void;
}

export default function SuccessAnimation({ letter, show, onNext, onRepeat }: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-surface-card dark:bg-surface-card-dark rounded-2xl p-5 sm:p-8 max-w-sm w-full mx-4 text-center animate-slide-up shadow-xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
          <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-1">¡Excelente!</h2>
        <p className="text-text-secondary mb-6">
          Letra &ldquo;{letter}&rdquo; completada correctamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onRepeat} className="btn-secondary w-full sm:w-auto">
            Repetir
          </button>
          <button onClick={onNext} className="btn-primary w-full sm:w-auto">
            Siguiente letra →
          </button>
        </div>
      </div>
    </div>
  );
}
