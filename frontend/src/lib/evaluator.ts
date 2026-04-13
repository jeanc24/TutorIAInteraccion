import { LetterData, HandFeatures, EvaluationResult, EvaluationStatus, Finger, FINGER_NAMES } from './types';

interface EvalContext {
  poseStartedAt: number | null;
  holdMs: number;
  consecutiveSuccessFrames: number;
}

const FINGER_LABELS: Record<Finger, string> = {
  thumb: 'pulgar',
  index: 'índice',
  middle: 'medio',
  ring: 'anular',
  pinky: 'meñique',
};

const STRICT_HIGH_SCORE = 0.80;
const REQUIRED_CONSECUTIVE_FRAMES = 6;
const FINGER_EXPONENT = 1.2;
const DIST_EXPONENT = 1.1;
const STABILITY_EXPONENT = 1.0;
const CRITICAL_SCORE_CAP = 0.68;
const MIN_HAND_SCALE = 1e-4;
const DISTANCE_TOLERANCE = 0.8;

export function createEvalContext(): EvalContext {
  return { poseStartedAt: null, holdMs: 0, consecutiveSuccessFrames: 0 };
}

export function evaluate(
  letter: LetterData,
  features: HandFeatures,
  ctx: EvalContext,
  now: number
): EvaluationResult {
  const { fingerScore, corrections, criticalFailureCount } = scoreFingers(letter, features);
  const distScore = scoreDistances(letter, features);
  const stabilityScore = features.stability;
  const hasDistanceChecks = Boolean(letter.distanceChecks?.length);

  const multiplicativeScore = Math.pow(fingerScore, FINGER_EXPONENT) *
    Math.pow(distScore, DIST_EXPONENT) *
    Math.pow(stabilityScore, STABILITY_EXPONENT);
  const linearFingerWeight = 0.6;
  const linearDistanceWeight = hasDistanceChecks ? 0.25 : 0;
  const linearStabilityWeight = hasDistanceChecks ? 0.15 : 0.4;
  const linearWeightTotal = linearFingerWeight + linearDistanceWeight + linearStabilityWeight;
  const linearScore = (
    linearFingerWeight * fingerScore +
    linearDistanceWeight * distScore +
    linearStabilityWeight * stabilityScore
  ) / linearWeightTotal;
  const rawScore = 0.7 * multiplicativeScore + 0.3 * linearScore;

  let score = Math.max(0, Math.min(rawScore, 1));
  if (criticalFailureCount >= 2) {
    score = Math.min(score, CRITICAL_SCORE_CAP);
  }

  const strictThreshold = Math.max(letter.thresholdSuccess, STRICT_HIGH_SCORE);
  let status: EvaluationStatus = 'tracking';
  let completed = false;
  let feedback = '';
  let holdProgress = 0;

  if (score >= strictThreshold) {
    if (ctx.poseStartedAt === null) {
      ctx.poseStartedAt = now;
    }
    ctx.consecutiveSuccessFrames += 1;

    const elapsed = now - ctx.poseStartedAt;
    const holdByTime = Math.min(elapsed / letter.holdMs, 1);
    const holdByFrames = Math.min(ctx.consecutiveSuccessFrames / REQUIRED_CONSECUTIVE_FRAMES, 1);
    holdProgress = Math.min(holdByTime, holdByFrames);

    if (elapsed >= letter.holdMs && ctx.consecutiveSuccessFrames >= REQUIRED_CONSECUTIVE_FRAMES) {
      completed = true;
      status = 'success';
      feedback = `¡Correcto! Letra "${letter.letter}" completada.`;
    } else {
      status = 'holding';
      feedback = 'Mantén la postura...';
    }
  } else {
    ctx.poseStartedAt = null;
    ctx.consecutiveSuccessFrames = 0;
    holdProgress = 0;

    if (score < 0.35) {
      status = 'error';
      feedback = corrections.length > 0
        ? `Corrige: ${corrections.slice(0, 2).join(', ')}.`
        : 'Ajusta la posición de la mano.';
    } else {
      status = 'tracking';
      feedback = corrections.length > 0
        ? `Casi: ${corrections.slice(0, 2).join(', ')}.`
        : 'Sigue ajustando la postura.';
    }
  }

  ctx.holdMs = letter.holdMs;
  return { status, score, completed, feedback, corrections, holdProgress };
}

function scoreFingers(
  letter: LetterData,
  features: HandFeatures
): { fingerScore: number; corrections: string[]; criticalFailureCount: number } {
  let totalScore = 0;
  let checked = 0;
  const corrections: string[] = [];
  let criticalFailureCount = 0;

  for (const finger of FINGER_NAMES) {
    const expected = letter.fingerPattern[finger];
    if (expected === null) continue;
    checked++;

    const actual = features.fingerStates[finger];
    const angleDeg = features.fingerAngles[finger];

    const target = expected ? 165 : 105;
    const tolerance = expected ? 24 : 24;
    const angleErr = Math.abs(angleDeg - target);
    const angleScore = Math.exp(-((angleErr / tolerance) ** 2));
    const stateScore = actual === expected ? 1 : 0;
    const componentScore = 0.75 * stateScore + 0.25 * angleScore;
    totalScore += componentScore;

    if (actual !== expected) {
      const action = expected ? 'extiende' : 'flexiona';
      corrections.push(`${action} el ${FINGER_LABELS[finger]}`);
    }

    if (expected && !actual && angleDeg < 118) {
      criticalFailureCount += 1;
    }
  }

  return {
    fingerScore: checked > 0 ? totalScore / checked : 1,
    corrections,
    criticalFailureCount,
  };
}

function scoreDistances(letter: LetterData, features: HandFeatures): number {
  if (!letter.distanceChecks?.length) return 1;

  let totalScore = 0;
  for (const check of letter.distanceChecks) {
    const key = `${check.from}-${check.to}`;
    const dist = features.tipDistances[key] ?? 1;
    const normalizedExpectedMax = check.maxDistance / Math.max(features.handScale, MIN_HAND_SCALE);
    const ratio = dist / Math.max(normalizedExpectedMax, MIN_HAND_SCALE);
    const s = Math.exp(-((Math.max(0, ratio - 1) / DISTANCE_TOLERANCE) ** 2));
    totalScore += s;
  }

  return totalScore / letter.distanceChecks.length;
}
