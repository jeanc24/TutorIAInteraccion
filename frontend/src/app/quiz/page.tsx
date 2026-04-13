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
import { MatchRound, QuestionRound, QuizMode, QUIZ_MODE_META, createMatchRound, createQuestionRounds } from '@/lib/quizModes';
import { EvaluationResult, LetterData } from '@/lib/types';

const GESTURE_QUIZ_LENGTH = 10;
const QUESTION_QUIZ_LENGTH = 10;
const MATCH_PAIR_COUNT = 6;
const GESTURE_TIME_MS = 15000;
const QUESTION_TIME_MS = 12000;

interface QuizResult {
  letter: string;
  passed: boolean;
  score: number;
}

interface QuestionFeedbackState {
  state: 'correct' | 'wrong' | 'timeout';
  selected?: string;
}

function shuffleAndPick(count: number): LetterData[] {
  const shuffled = [...ALPHABET].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, TOTAL_LETTERS));
}

export default function QuizPage() {
  const router = useRouter();
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

  const [selectedMode, setSelectedMode] = useState<QuizMode>('gesture');
  const [phase, setPhase] = useState<'intro' | 'active' | 'results'>('intro');
  const [gestureLetters, setGestureLetters] = useState<LetterData[]>([]);
  const [questionRounds, setQuestionRounds] = useState<QuestionRound[]>([]);
  const [matchRound, setMatchRound] = useState<MatchRound | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState<QuestionFeedbackState | null>(null);
  const [selectedLetterCardId, setSelectedLetterCardId] = useState<string | null>(null);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [wrongPairCardIds, setWrongPairCardIds] = useState<string[]>([]);
  const [matchMistakes, setMatchMistakes] = useState(0);
  const [matchStatus, setMatchStatus] = useState('Selecciona una letra y luego la imagen de la mano que le corresponde.');

  const evalCtxRef = useRef(createEvalContext());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const completedRef = useRef(false);

  const selectedModeMeta = QUIZ_MODE_META.find((mode) => mode.id === selectedMode)!;
  const currentGestureLetter = gestureLetters[currentIdx] ?? null;
  const currentQuestionRound = questionRounds[currentIdx] ?? null;

  const totalRounds = useMemo(() => {
    if (selectedMode === 'gesture') return gestureLetters.length;
    if (selectedMode === 'question') return questionRounds.length;
    return matchRound?.pairs.length ?? 0;
  }, [selectedMode, gestureLetters.length, questionRounds.length, matchRound]);

  const correctCount = useMemo(() => {
    if (selectedMode === 'match') return matchedPairIds.length;
    return results.filter((result) => result.passed).length;
  }, [selectedMode, matchedPairIds.length, results]);

  const incorrectResults = useMemo(
    () => (selectedMode === 'match' ? [] : results.filter((result) => !result.passed)),
    [selectedMode, results]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearAdvanceTimeout = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
  }, []);

  const teardownCamera = useCallback(() => {
    stopTracking();
    stopCamera();
  }, [stopTracking, stopCamera]);

  const resetTransientState = useCallback(() => {
    clearTimer();
    clearAdvanceTimeout();
    setCurrentIdx(0);
    setResults([]);
    setEvalResult(null);
    setTimeLeft(0);
    setQuestionFeedback(null);
    setSelectedLetterCardId(null);
    setSelectedHandCardId(null);
    setMatchedPairIds([]);
    setWrongPairCardIds([]);
    setMatchMistakes(0);
    setMatchStatus('Selecciona una letra y luego la imagen de la mano que le corresponde.');
    completedRef.current = false;
    evalCtxRef.current = createEvalContext();
  }, [clearAdvanceTimeout, clearTimer]);

  const finishQuiz = useCallback(() => {
    clearTimer();
    clearAdvanceTimeout();
    setTimeLeft(0);
    teardownCamera();
    setPhase('results');
  }, [clearAdvanceTimeout, clearTimer, teardownCamera]);

  const resetToIntro = useCallback(() => {
    teardownCamera();
    resetTransientState();
    setGestureLetters([]);
    setQuestionRounds([]);
    setMatchRound(null);
    setPhase('intro');
  }, [resetTransientState, teardownCamera]);

  const advanceGestureRound = useCallback((passed: boolean, score: number) => {
    if (!currentGestureLetter) return;

    setResults((prev) => [...prev, { letter: currentGestureLetter.letter, passed, score }]);
    setEvalResult(null);

    if (currentIdx + 1 >= gestureLetters.length) {
      finishQuiz();
      return;
    }

    setCurrentIdx((idx) => idx + 1);
  }, [currentGestureLetter, currentIdx, finishQuiz, gestureLetters.length]);

  const advanceQuestionRound = useCallback((passed: boolean) => {
    if (!currentQuestionRound) return;

    setResults((prev) => [...prev, { letter: currentQuestionRound.letter.letter, passed, score: passed ? 1 : 0 }]);

    if (currentIdx + 1 >= questionRounds.length) {
      finishQuiz();
      return;
    }

    setCurrentIdx((idx) => idx + 1);
  }, [currentIdx, currentQuestionRound, finishQuiz, questionRounds.length]);

  const startQuiz = useCallback(async () => {
    teardownCamera();
    resetTransientState();
    setGestureLetters([]);
    setQuestionRounds([]);
    setMatchRound(null);
    setPhase('active');

    if (selectedMode === 'gesture') {
      setGestureLetters(shuffleAndPick(GESTURE_QUIZ_LENGTH));
      await loadModel();
      await startCamera();
      return;
    }

    if (selectedMode === 'question') {
      setQuestionRounds(createQuestionRounds(QUESTION_QUIZ_LENGTH));
      return;
    }

    setMatchRound(createMatchRound(MATCH_PAIR_COUNT));
  }, [loadModel, resetTransientState, selectedMode, startCamera, teardownCamera]);

  const handleQuestionAnswer = useCallback((option: string) => {
    if (!currentQuestionRound || questionFeedback) return;

    clearTimer();
    clearAdvanceTimeout();
    const passed = option === currentQuestionRound.correctLetter;
    setQuestionFeedback({ state: passed ? 'correct' : 'wrong', selected: option });
    advanceTimeoutRef.current = setTimeout(() => advanceQuestionRound(passed), 900);
  }, [advanceQuestionRound, clearAdvanceTimeout, clearTimer, currentQuestionRound, questionFeedback]);

  const handleLetterCardSelect = useCallback((cardId: string, pairId: string) => {
    if (wrongPairCardIds.length > 0 || matchedPairIds.includes(pairId)) return;
    setSelectedLetterCardId((current) => (current === cardId ? null : cardId));
  }, [matchedPairIds, wrongPairCardIds.length]);

  const handleHandCardSelect = useCallback((cardId: string, pairId: string) => {
    if (wrongPairCardIds.length > 0 || matchedPairIds.includes(pairId)) return;
    setSelectedHandCardId((current) => (current === cardId ? null : cardId));
  }, [matchedPairIds, wrongPairCardIds.length]);

  useEffect(() => {
    if (selectedMode === 'gesture' && phase === 'active' && isModelLoaded && cameraState.isActive && !isTracking) {
      startTracking();
    }
  }, [selectedMode, phase, isModelLoaded, cameraState.isActive, isTracking, startTracking]);

  useEffect(() => {
    if (phase !== 'active' || selectedMode !== 'gesture' || !currentGestureLetter) return;

    clearTimer();
    startTimeRef.current = Date.now();
    completedRef.current = false;
    evalCtxRef.current = createEvalContext();
    setEvalResult(null);
    setTimeLeft(GESTURE_TIME_MS);

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, GESTURE_TIME_MS - (Date.now() - startTimeRef.current));
      setTimeLeft(remaining);

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearTimer();
        advanceGestureRound(false, 0);
      }
    }, 100);

    return clearTimer;
  }, [advanceGestureRound, clearTimer, currentGestureLetter, currentIdx, phase, selectedMode]);

  useEffect(() => {
    if (phase !== 'active' || selectedMode !== 'gesture' || !features || !isTracking || !currentGestureLetter || completedRef.current) {
      return;
    }

    const result = evaluate(currentGestureLetter, features, evalCtxRef.current, Date.now());
    setEvalResult(result);

    if (result.completed) {
      completedRef.current = true;
      clearTimer();
      clearAdvanceTimeout();

      record({
        letter: currentGestureLetter.letter,
        score: result.score,
        durationMs: Date.now() - startTimeRef.current,
        completed: true,
        mode: 'quiz',
        timestamp: new Date().toISOString(),
      });

      advanceTimeoutRef.current = setTimeout(() => advanceGestureRound(true, result.score), 900);
    }
  }, [
    advanceGestureRound,
    clearAdvanceTimeout,
    clearTimer,
    currentGestureLetter,
    features,
    isTracking,
    phase,
    record,
    selectedMode,
  ]);

  useEffect(() => {
    if (phase !== 'active' || selectedMode !== 'question' || !currentQuestionRound) return;

    clearTimer();
    clearAdvanceTimeout();
    setQuestionFeedback(null);
    startTimeRef.current = Date.now();
    setTimeLeft(QUESTION_TIME_MS);

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, QUESTION_TIME_MS - (Date.now() - startTimeRef.current));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearTimer();
        setQuestionFeedback({ state: 'timeout' });
        advanceTimeoutRef.current = setTimeout(() => advanceQuestionRound(false), 900);
      }
    }, 100);

    return clearTimer;
  }, [advanceQuestionRound, clearAdvanceTimeout, clearTimer, currentIdx, currentQuestionRound, phase, selectedMode]);

  useEffect(() => {
    if (
      phase !== 'active' ||
      selectedMode !== 'match' ||
      !matchRound ||
      !selectedLetterCardId ||
      !selectedHandCardId ||
      wrongPairCardIds.length > 0
    ) {
      return;
    }

    const letterCard = matchRound.letterCards.find((card) => card.id === selectedLetterCardId);
    const handCard = matchRound.handCards.find((card) => card.id === selectedHandCardId);

    if (!letterCard || !handCard) return;

    if (letterCard.pairId === handCard.pairId) {
      const nextMatchedPairIds = [...matchedPairIds, letterCard.pairId];

      setMatchedPairIds(nextMatchedPairIds);
      setResults((prev) => [...prev, { letter: letterCard.letter, passed: true, score: 1 }]);
      setMatchStatus(`Correcto. Emparejaste la letra ${letterCard.letter}.`);
      setSelectedLetterCardId(null);
      setSelectedHandCardId(null);

      if (nextMatchedPairIds.length >= matchRound.pairs.length) {
        clearAdvanceTimeout();
        advanceTimeoutRef.current = setTimeout(() => finishQuiz(), 500);
      }

      return;
    }

    setMatchMistakes((value) => value + 1);
    setMatchStatus('No coincide. Intenta con otra combinación.');
    setWrongPairCardIds([selectedLetterCardId, selectedHandCardId]);
    clearAdvanceTimeout();
    advanceTimeoutRef.current = setTimeout(() => {
      setWrongPairCardIds([]);
      setSelectedLetterCardId(null);
      setSelectedHandCardId(null);
    }, 700);
  }, [
    clearAdvanceTimeout,
    finishQuiz,
    matchedPairIds,
    matchRound,
    phase,
    selectedHandCardId,
    selectedLetterCardId,
    selectedMode,
    wrongPairCardIds.length,
  ]);

  useEffect(() => () => {
    clearTimer();
    clearAdvanceTimeout();
    teardownCamera();
  }, [clearAdvanceTimeout, clearTimer, teardownCamera]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-950">
      <Header completedCount={completedCount} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6">
        {phase === 'intro' && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Modo Quiz</h1>
                <p className="text-stone-400 max-w-2xl mx-auto">
                  Elige cómo quieres evaluarte: formando la seña con cámara, respondiendo preguntas estilo kahoot o emparejando letras con manos.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-8">
                {QUIZ_MODE_META.map((mode) => {
                  const isSelected = mode.id === selectedMode;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`text-left rounded-2xl border p-5 transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                          : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                          {mode.id === 'gesture' ? 'Señas' : mode.id === 'question' ? 'Preguntas' : 'Emparejar'}
                        </span>
                        {isSelected && <span className="text-xs font-semibold text-accent">Activo</span>}
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-2">{mode.title}</h2>
                      <p className="text-sm text-stone-400 leading-relaxed">{mode.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="card p-6 bg-stone-900 border-stone-800 text-center">
                <h2 className="text-xl font-semibold text-white mb-2">{selectedModeMeta.title}</h2>
                <p className="text-stone-400 mb-5">
                  {selectedMode === 'gesture' && `Se presentarán ${GESTURE_QUIZ_LENGTH} letras aleatorias. Tendrás ${GESTURE_TIME_MS / 1000} segundos por letra.`}
                  {selectedMode === 'question' && `Responderás ${QUESTION_QUIZ_LENGTH} preguntas con ${QUESTION_TIME_MS / 1000} segundos por pregunta.`}
                  {selectedMode === 'match' && `Emparejarás ${MATCH_PAIR_COUNT} letras con sus imágenes correspondientes.`}
                </p>
                <button onClick={startQuiz} className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
                  {selectedModeMeta.cta}
                </button>
                <div className="mt-4">
                  <button onClick={() => router.push('/learn')} className="text-stone-500 text-sm hover:text-stone-300">
                    ← Volver a Aprender
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'active' && selectedMode === 'gesture' && currentGestureLetter && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-stone-400 text-sm font-medium">
                Reto {currentIdx + 1} de {gestureLetters.length}
              </span>
              <div className={`text-sm font-mono tabular-nums shrink-0 ${timeLeft < 5000 ? 'text-red-400' : 'text-stone-400'}`}>
                {Math.ceil(timeLeft / 1000)}s
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-sm text-stone-500 mb-1">Forma la seña de:</div>
              <div className="text-5xl sm:text-6xl font-extrabold text-white">{currentGestureLetter.letter}</div>
            </div>

            <div className="relative min-h-[260px] sm:min-h-[320px]">
              {cameraState.isLoading || loadingProgress ? (
                <div className="w-full h-[260px] sm:h-[320px] rounded-xl bg-stone-900 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : cameraState.error || trackingError ? (
                <div className="w-full h-[260px] sm:h-[320px] rounded-xl bg-stone-900 flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <p className="text-red-400 text-sm mb-4">{cameraState.error || trackingError}</p>
                    <button onClick={startQuiz} className="btn-primary text-sm">Reintentar</button>
                  </div>
                </div>
              ) : (
                <CameraFeed
                  videoRef={videoRef}
                  features={features}
                  allHandsLandmarks={allHandsLandmarks}
                  showLandmarks={true}
                  className="w-full h-[260px] sm:h-[320px]"
                />
              )}
            </div>

            <div className="card p-4 bg-stone-900 border-stone-800">
              <FeedbackBar result={evalResult} isTracking={isTracking} />
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {gestureLetters.map((_, index) => {
                const round = results[index];
                let color = 'bg-stone-700';
                if (round) color = round.passed ? 'bg-success' : 'bg-error';
                else if (index === currentIdx) color = 'bg-accent animate-pulse-soft';
                return <div key={index} className={`w-2.5 h-2.5 rounded-full ${color}`} />;
              })}
            </div>
          </div>
        )}

        {phase === 'active' && selectedMode === 'question' && currentQuestionRound && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-stone-400 text-sm font-medium">
                Pregunta {currentIdx + 1} de {questionRounds.length}
              </span>
              <div className={`text-sm font-mono tabular-nums shrink-0 ${timeLeft < 4000 ? 'text-red-400' : 'text-stone-400'}`}>
                {Math.ceil(timeLeft / 1000)}s
              </div>
            </div>

            <div className="card p-4 sm:p-6 bg-stone-900 border-stone-800 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/80 mb-3">
                Kahoot de señas
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{currentQuestionRound.promptTitle}</h2>

              {currentQuestionRound.promptType === 'image' && currentQuestionRound.promptImagePath ? (
                <>
                  <div className="mx-auto my-4 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border border-stone-700 bg-stone-950/60 p-3 flex items-center justify-center">
                    <img
                      src={currentQuestionRound.promptImagePath}
                      alt={`Seña de la letra ${currentQuestionRound.letter.letter}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-stone-400">{currentQuestionRound.promptBody}</p>
                </>
              ) : (
                <p className="text-lg text-stone-300 leading-relaxed max-w-2xl mx-auto">
                  {currentQuestionRound.promptBody}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {currentQuestionRound.options.map((option) => {
                const isSelected = questionFeedback?.selected === option;
                const isCorrect = questionFeedback && option === currentQuestionRound.correctLetter;
                let buttonClassName = 'border-stone-800 bg-stone-900 hover:border-stone-700 text-white';

                if (questionFeedback) {
                  if (isCorrect) buttonClassName = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                  else if (isSelected) buttonClassName = 'border-red-500 bg-red-500/10 text-red-200';
                  else buttonClassName = 'border-stone-800 bg-stone-900 text-stone-500';
                }

                return (
                  <button
                    key={option}
                    onClick={() => handleQuestionAnswer(option)}
                    disabled={Boolean(questionFeedback)}
                    className={`rounded-2xl border px-4 py-5 text-left transition-all ${buttonClassName}`}
                  >
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500 block mb-2">Opción</span>
                    <span className="text-xl sm:text-2xl font-bold">{option}</span>
                  </button>
                );
              })}
            </div>

            {questionFeedback && (
              <div className={`text-center text-sm font-medium ${
                questionFeedback.state === 'correct'
                  ? 'text-emerald-300'
                  : questionFeedback.state === 'timeout'
                  ? 'text-amber-300'
                  : 'text-red-300'
              }`}>
                {questionFeedback.state === 'correct' && 'Correcto. Muy bien.'}
                {questionFeedback.state === 'wrong' && `Incorrecto. La respuesta correcta era ${currentQuestionRound.correctLetter}.`}
                {questionFeedback.state === 'timeout' && `Se acabó el tiempo. La respuesta correcta era ${currentQuestionRound.correctLetter}.`}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1.5">
              {questionRounds.map((_, index) => {
                const round = results[index];
                let color = 'bg-stone-700';
                if (round) color = round.passed ? 'bg-success' : 'bg-error';
                else if (index === currentIdx) color = 'bg-accent animate-pulse-soft';
                return <div key={index} className={`w-2.5 h-2.5 rounded-full ${color}`} />;
              })}
            </div>
          </div>
        )}

        {phase === 'active' && selectedMode === 'match' && matchRound && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-stone-400 text-sm font-medium">
                  Parejas completadas: {matchedPairIds.length} / {matchRound.pairs.length}
                </span>
                <div className="text-stone-500 text-sm">Errores acumulados: {matchMistakes}</div>
              </div>
              <div className="text-sm text-stone-400 break-words">{matchStatus}</div>
            </div>

            <div className="card p-5 bg-stone-900 border-stone-800">
              <h2 className="text-xl font-bold text-white mb-2">Empareja cada letra con su mano</h2>
              <p className="text-stone-400">
                Primero toca una letra y luego la imagen correcta. Cuando aciertes, la pareja quedará fija.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {matchRound.letterCards.map((card) => {
                  const isMatched = matchedPairIds.includes(card.pairId);
                  const isSelected = selectedLetterCardId === card.id;
                  const isWrong = wrongPairCardIds.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleLetterCardSelect(card.id, card.pairId)}
                      disabled={isMatched}
                      className={`rounded-2xl border p-4 sm:p-5 text-left transition-all ${
                        isMatched
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100'
                          : isWrong
                          ? 'border-red-500 bg-red-500/10 text-red-100'
                          : isSelected
                          ? 'border-accent bg-accent/10 text-white'
                          : 'border-stone-800 bg-stone-900 text-white hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs uppercase tracking-[0.18em] text-stone-500 block mb-2">Letra</span>
                      <span className="text-3xl sm:text-4xl font-extrabold">{card.letter}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {matchRound.handCards.map((card) => {
                  const isMatched = matchedPairIds.includes(card.pairId);
                  const isSelected = selectedHandCardId === card.id;
                  const isWrong = wrongPairCardIds.includes(card.id);
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleHandCardSelect(card.id, card.pairId)}
                      disabled={isMatched}
                      className={`rounded-2xl border p-4 transition-all ${
                        isMatched
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : isWrong
                          ? 'border-red-500 bg-red-500/10'
                          : isSelected
                          ? 'border-accent bg-accent/10'
                          : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-2xl border border-stone-700 bg-stone-950/60 p-3 flex items-center justify-center">
                        <img
                          src={card.imagePath}
                          alt={card.alt}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card p-5 sm:p-8 max-w-2xl w-full text-center bg-stone-900 border-stone-800">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2">
                {selectedModeMeta.title}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Resultados</h2>
              <div className="text-4xl sm:text-5xl font-extrabold text-accent my-4">
                {correctCount}/{totalRounds}
              </div>

              {selectedMode === 'match' ? (
                <p className="text-stone-400 mb-6">
                  {matchMistakes === 0
                    ? 'Emparejaste todas las cartas sin errores.'
                    : `Emparejaste todas las cartas con ${matchMistakes} ${matchMistakes === 1 ? 'error' : 'errores'}.`}
                </p>
              ) : (
                <p className="text-stone-400 mb-6">
                  {correctCount === totalRounds
                    ? 'Perfecto. Dominas todas las letras evaluadas.'
                    : correctCount >= totalRounds * 0.7
                    ? 'Buen trabajo. Algunas letras necesitan más práctica.'
                    : 'Sigue practicando. Cada intento te acerca más.'}
                </p>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
                {(selectedMode === 'match'
                  ? matchRound?.pairs.map((pair) => ({ letter: pair.letter.letter, passed: true })) ?? []
                  : results
                ).map((result, index) => (
                  <div
                    key={`${result.letter}-${index}`}
                    className={`aspect-square rounded-lg flex items-center justify-center font-bold text-lg ${
                      result.passed
                        ? 'bg-emerald-900/50 text-success border border-emerald-700'
                        : 'bg-red-900/50 text-error border border-red-700'
                    }`}
                  >
                    {result.letter}
                  </div>
                ))}
              </div>

              {incorrectResults.length > 0 && (
                <div className="mb-6 text-left">
                  <h3 className="text-sm font-semibold text-stone-400 mb-2">Practica estas letras:</h3>
                  <div className="flex flex-wrap gap-2">
                    {incorrectResults.map((result) => (
                      <button
                        key={result.letter}
                        onClick={() => router.push(`/practice?letter=${result.letter}`)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 text-sm font-medium transition-colors"
                      >
                        Practicar {result.letter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => router.push('/learn')} className="btn-secondary w-full sm:w-auto">
                  Volver
                </button>
                <button onClick={resetToIntro} className="btn-primary w-full sm:w-auto">
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
