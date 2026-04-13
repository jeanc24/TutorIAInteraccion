'use client';

import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import FeedbackBar from '@/components/FeedbackBar';
import LetterReferenceFigure from '@/components/LetterReferenceFigure';
import SuccessAnimation from '@/components/SuccessAnimation';
import { useCamera } from '@/hooks/useCamera';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useProgress } from '@/hooks/useProgress';
import { ALPHABET_MAP, getNextLetter, getDifficultyLabel, getDifficultyColor } from '@/lib/alphabet';
import { evaluate, createEvalContext } from '@/lib/evaluator';
import { EvaluationResult } from '@/lib/types';

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const letterParam = searchParams.get('letter') || 'A';

  const [currentLetter, setCurrentLetter] = useState(letterParam);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const evalCtxRef = useRef(createEvalContext());

  const { record, completedCount } = useProgress();
  const { videoRef, state: cameraState, start: startCamera, stop: stopCamera } = useCamera();
  const {
    isModelLoaded,
    isTracking,
    loadingProgress,
    features,
    allHandsLandmarks,
    error: trackingError,
    loadModel,
    startTracking,
    stopTracking,
  } = useHandTracking(videoRef);

  const letterData = ALPHABET_MAP.get(currentLetter)!;

  const startSession = useCallback(async () => {
    setSessionStarted(true);
    startTimeRef.current = Date.now();
    evalCtxRef.current = createEvalContext();
    setEvalResult(null);
    setShowSuccess(false);
    await loadModel();
    await startCamera();
  }, [startCamera, loadModel]);

  useEffect(() => {
    if (sessionStarted && isModelLoaded && cameraState.isActive && !isTracking) {
      startTracking();
    }
  }, [sessionStarted, isModelLoaded, cameraState.isActive, isTracking, startTracking]);

  useEffect(() => {
    if (!features || !isTracking || showSuccess) return;

    const result = evaluate(letterData, features, evalCtxRef.current, Date.now());
    setEvalResult(result);

    if (result.completed) {
      const durationMs = Date.now() - startTimeRef.current;
      record({
        letter: currentLetter,
        score: result.score,
        durationMs,
        completed: true,
        mode: 'practice',
        timestamp: new Date().toISOString(),
      });
      setShowSuccess(true);
      stopTracking();
    }
  }, [features, isTracking, letterData, currentLetter, showSuccess, record, stopTracking]);

  useEffect(() => {
    if (isTracking && !features) {
      setEvalResult({
        status: 'no_hand',
        score: 0,
        completed: false,
        feedback: 'Coloca tu mano frente a la cámara.',
        corrections: [],
        holdProgress: 0,
      });
    }
  }, [features, isTracking]);

  const handleNext = useCallback(() => {
    const next = getNextLetter(currentLetter);
    setCurrentLetter(next.letter);
    evalCtxRef.current = createEvalContext();
    setEvalResult(null);
    setShowSuccess(false);
    startTimeRef.current = Date.now();
    if (!isTracking && isModelLoaded && cameraState.isActive) {
      startTracking();
    }
  }, [currentLetter, isTracking, isModelLoaded, cameraState.isActive, startTracking]);

  const handleRepeat = useCallback(() => {
    evalCtxRef.current = createEvalContext();
    setEvalResult(null);
    setShowSuccess(false);
    startTimeRef.current = Date.now();
    if (!isTracking && isModelLoaded && cameraState.isActive) {
      startTracking();
    }
  }, [isTracking, isModelLoaded, cameraState.isActive, startTracking]);

  const handleExit = useCallback(() => {
    stopTracking();
    stopCamera();
    router.push('/learn');
  }, [stopTracking, stopCamera, router]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950">
      <Header completedCount={completedCount} />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-3xl font-extrabold text-white">{currentLetter}</span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getDifficultyColor(letterData.difficulty)}`}>
              {getDifficultyLabel(letterData.difficulty)}
            </span>
          </div>
          <button onClick={handleExit} className="text-stone-400 hover:text-white transition-colors text-sm flex items-center gap-1 ml-auto sm:ml-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Salir
          </button>
        </div>

        {!sessionStarted ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center w-full max-w-md">
              <LetterReferenceFigure
                letter={currentLetter}
                alt={`Seña de la letra ${currentLetter}`}
                variant="card"
                className="mb-6"
              />
              <h2 className="text-xl font-bold text-white mb-2">Practicar &ldquo;{currentLetter}&rdquo;</h2>
              <p className="text-stone-400 mb-2 max-w-sm mx-auto">{letterData.description}</p>
              <p className="text-stone-500 text-sm mb-6">Se activará tu cámara para detectar la seña.</p>
              <button onClick={startSession} className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                Iniciar práctica
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1 min-h-[240px] sm:min-h-[300px]">
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-black/70 rounded-lg p-1.5 sm:p-2 backdrop-blur-sm">
                <div className="text-[10px] text-stone-400 mb-1 text-center hidden sm:block">Referencia</div>
                <LetterReferenceFigure
                  letter={currentLetter}
                  alt={`Seña ${currentLetter}`}
                  variant="compact"
                />
              </div>

              {cameraState.isLoading || loadingProgress ? (
                <div className="w-full h-full rounded-xl bg-stone-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-stone-400 text-sm">
                      {loadingProgress || 'Activando cámara...'}
                    </p>
                  </div>
                </div>
              ) : cameraState.error || trackingError ? (
                <div className="w-full h-full rounded-xl bg-stone-900 flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <p className="text-red-400 text-sm mb-4">{cameraState.error || trackingError}</p>
                    <button onClick={startSession} className="btn-primary text-sm">Reintentar</button>
                  </div>
                </div>
              ) : (
                <CameraFeed
                  videoRef={videoRef}
                  features={features}
                  allHandsLandmarks={allHandsLandmarks}
                  showLandmarks={true}
                  className="w-full h-full min-h-[240px] sm:min-h-[300px]"
                />
              )}
            </div>

            <div className="card p-4 bg-stone-900 border-stone-800">
              <FeedbackBar result={evalResult} isTracking={isTracking} />
              {!isTracking && !showSuccess && sessionStarted && isModelLoaded && (
                <p className="text-stone-500 text-sm text-center">Preparando detección...</p>
              )}
            </div>

            <div className="flex justify-center pb-2">
              <button
                onClick={handleNext}
                className="text-stone-500 hover:text-stone-300 text-sm transition-colors"
              >
                Saltar letra →
              </button>
            </div>
          </div>
        )}
      </main>

      <SuccessAnimation
        letter={currentLetter}
        show={showSuccess}
        onNext={handleNext}
        onRepeat={handleRepeat}
      />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
