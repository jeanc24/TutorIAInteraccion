'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import FeedbackBar from '@/components/FeedbackBar';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useProgress } from '@/hooks/useProgress';
import { ALPHABET, TOTAL_LETTERS } from '@/lib/alphabet';
import { evaluate, createEvalContext } from '@/lib/evaluator';
import { EvaluationResult, LetterData } from '@/lib/types';

const QUIZ_LENGTH = 10;
const TIME_PER_LETTER_MS = 15000;

interface QuizResult {
  letter: string;
  passed: boolean;
  score: number;
}

function shuffleAndPick(count: number): LetterData[] {
  const shuffled = [...ALPHABET].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, TOTAL_LETTERS));
}

export default function QuizPage() {
  const router = useRouter();
  const { progress, record, completedCount } = useProgress();
  const { videoRef, state: cameraState, start: startCamera, stop: stopCamera } = useCamera();
  const { isModelLoaded, isTracking, loadingProgress, features, allHandsLandmarks, loadModel, startTracking, stopTracking } = useHandTracking(videoRef);

  const [phase, setPhase] = useState<'intro' | 'active' | 'results'>('intro');
  const [quizLetters, setQuizLetters] = useState<LetterData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_LETTER_MS);

  const evalCtxRef = useRef(createEvalContext());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const completedRef = useRef(false);

  const currentLetter = quizLetters[currentIdx] ?? null;

  const startQuiz = useCallback(async () => {
    const letters = shuffleAndPick(QUIZ_LENGTH);
    setQuizLetters(letters);
    setCurrentIdx(0);
    setResults([]);
    setPhase('active');
    completedRef.current = false;
    evalCtxRef.current = createEvalContext();
    setEvalResult(null);

    await loadModel();
    await startCamera();
  }, [startCamera, loadModel]);

  useEffect(() => {
    if (phase === 'active' && isModelLoaded && cameraState.isActive && !isTracking) {
      startTracking();
    }
  }, [phase, isModelLoaded, cameraState.isActive, isTracking, startTracking]);

  useEffect(() => {
    if (phase !== 'active' || !currentLetter) return;

    startTimeRef.current = Date.now();
    setTimeLeft(TIME_PER_LETTER_MS);
    completedRef.current = false;
    evalCtxRef.current = createEvalContext();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, TIME_PER_LETTER_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!completedRef.current) {
          completedRef.current = true;
          advanceQuestion(false, 0);
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, phase]);

  useEffect(() => {
    if (!features || !isTracking || !currentLetter || phase !== 'active' || completedRef.current) return;

    const result = evaluate(currentLetter, features, evalCtxRef.current, Date.now());
    setEvalResult(result);

    if (result.completed) {
      completedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      record({
        letter: currentLetter.letter,
        score: result.score,
        durationMs: Date.now() - startTimeRef.current,
        completed: true,
        mode: 'quiz',
        timestamp: new Date().toISOString(),
      });

      setTimeout(() => advanceQuestion(true, result.score), 1200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, isTracking, currentLetter, phase]);

  const advanceQuestion = useCallback((passed: boolean, score: number) => {
    if (!currentLetter) return;

    setResults((prev) => [...prev, { letter: currentLetter.letter, passed, score }]);
    setEvalResult(null);

    if (currentIdx + 1 >= quizLetters.length) {
      setPhase('results');
      stopTracking();
      stopCamera();
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentLetter, currentIdx, quizLetters.length, stopTracking, stopCamera]);

  const correctCount = useMemo(() => results.filter((r) => r.passed).length, [results]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950">
      <Header completedCount={completedCount} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {phase === 'intro' && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/20 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Modo Evaluación</h1>
              <p className="text-stone-400 mb-2 max-w-sm mx-auto">
                Se presentarán {QUIZ_LENGTH} letras aleatorias. Forma cada seña <strong className="text-stone-300">sin referencia visual</strong>.
              </p>
              <p className="text-stone-500 text-sm mb-6">
                Tienes {TIME_PER_LETTER_MS / 1000} segundos por letra.
              </p>
              <button onClick={startQuiz} className="btn-primary text-base px-8 py-3">
                Comenzar evaluación
              </button>
              <div className="mt-4">
                <button onClick={() => router.push('/learn')} className="text-stone-500 text-sm hover:text-stone-300">
                  ← Volver a Aprender
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'active' && currentLetter && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-sm font-medium">
                Pregunta {currentIdx + 1} de {quizLetters.length}
              </span>
              <div className="flex items-center gap-2">
                <div className={`text-sm font-mono tabular-nums ${timeLeft < 5000 ? 'text-red-400' : 'text-stone-400'}`}>
                  {Math.ceil(timeLeft / 1000)}s
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-sm text-stone-500 mb-1">Forma la seña de:</div>
              <div className="text-6xl font-extrabold text-white">{currentLetter.letter}</div>
            </div>

            <div className="relative min-h-[280px]">
              {cameraState.isLoading || loadingProgress ? (
                <div className="w-full h-[280px] rounded-xl bg-stone-900 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CameraFeed
                  videoRef={videoRef}
                  features={features}
                  allHandsLandmarks={allHandsLandmarks}
                  showLandmarks={true}
                  className="w-full h-[280px]"
                />
              )}
            </div>

            <div className="card p-4 bg-stone-900 border-stone-800">
              <FeedbackBar result={evalResult} isTracking={isTracking} />
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5">
              {quizLetters.map((_, i) => {
                const r = results[i];
                let color = 'bg-stone-700';
                if (r) color = r.passed ? 'bg-success' : 'bg-error';
                else if (i === currentIdx) color = 'bg-accent animate-pulse-soft';
                return <div key={i} className={`w-2.5 h-2.5 rounded-full ${color}`} />;
              })}
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card p-8 max-w-md w-full text-center bg-stone-900 border-stone-800">
              <h2 className="text-2xl font-bold text-white mb-2">Resultados</h2>
              <div className="text-5xl font-extrabold text-accent my-4">
                {correctCount}/{results.length}
              </div>
              <p className="text-stone-400 mb-6">
                {correctCount === results.length
                  ? '¡Perfecto! Dominas todas las letras evaluadas.'
                  : correctCount >= results.length * 0.7
                  ? 'Buen trabajo. Algunas letras necesitan más práctica.'
                  : 'Sigue practicando. Cada intento te acerca más.'}
              </p>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg ${
                      r.passed
                        ? 'bg-emerald-900/50 text-success border border-emerald-700'
                        : 'bg-red-900/50 text-error border border-red-700'
                    }`}
                  >
                    {r.letter}
                  </div>
                ))}
              </div>

              {results.some((r) => !r.passed) && (
                <div className="mb-6 text-left">
                  <h3 className="text-sm font-semibold text-stone-400 mb-2">Practica estas letras:</h3>
                  <div className="flex flex-wrap gap-2">
                    {results
                      .filter((r) => !r.passed)
                      .map((r) => (
                        <button
                          key={r.letter}
                          onClick={() => router.push(`/practice?letter=${r.letter}`)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-sm font-medium transition-colors"
                        >
                          Practicar {r.letter}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button onClick={() => router.push('/learn')} className="btn-secondary">
                  Volver
                </button>
                <button onClick={() => { setPhase('intro'); }} className="btn-primary">
                  Nuevo quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
