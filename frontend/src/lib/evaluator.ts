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

const STRICT_HIGH_SCORE = 0.85;
const REQUIRED_CONSECUTIVE_FRAMES = 12;
const FINGER_EXPONENT = 1.7;
const DIST_EXPONENT = 1.4;
const STABILITY_EXPONENT = 1.2;
const CRITICAL_SCORE_CAP = 0.5;

export function createEvalContext(): EvalContext {
  return { poseStartedAt: null, holdMs: 0, consecutiveSuccessFrames: 0 };
}

export function evaluate(
  letter: LetterData,
  features: HandFeatures,
  ctx: EvalContext,
  now: number
): EvaluationResult {
  const { fingerScore, corrections, criticalFailure } = scoreFingers(letter, features);
  const distScore = scoreDistances(letter, features);
  const stabilityScore = features.stability;

  const rawScore = Math.pow(fingerScore, FINGER_EXPONENT) *
    Math.pow(distScore, DIST_EXPONENT) *
    Math.pow(stabilityScore, STABILITY_EXPONENT);

  let score = Math.max(0, Math.min(rawScore, 1));
  if (criticalFailure) {
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
      feedback = `Mantén la postura (${ctx.consecutiveSuccessFrames}/${REQUIRED_CONSECUTIVE_FRAMES} frames)...`;
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
): { fingerScore: number; corrections: string[]; criticalFailure: boolean } {
  let totalScore = 0;
  let checked = 0;
  const corrections: string[] = [];
  let criticalFailure = false;

  for (const finger of FINGER_NAMES) {
    const expected = letter.fingerPattern[finger];
    if (expected === null) continue;
    checked++;

    const actual = features.fingerStates[finger];
    const angleDeg = features.fingerAngles[finger];

    const target = expected ? 172 : 102;
    const tolerance = expected ? 16 : 18;
    const angleErr = Math.abs(angleDeg - target);
    const angleScore = Math.exp(-((angleErr / tolerance) ** 2));
    const stateScore = actual === expected ? 1 : 0;
    const componentScore = 0.65 * stateScore + 0.35 * angleScore;
    totalScore += componentScore;

    if (actual !== expected) {
      const action = expected ? 'extiende' : 'flexiona';
      corrections.push(`${action} el ${FINGER_LABELS[finger]}`);
    }

    if (expected && (!actual || angleDeg < 132)) {
      criticalFailure = true;
    }
  }

  return {
    fingerScore: checked > 0 ? totalScore / checked : 1,
    corrections,
    criticalFailure,
  };
}

function scoreDistances(letter: LetterData, features: HandFeatures): number {
  if (!letter.distanceChecks?.length) return 1;

  let totalScore = 0;
  for (const check of letter.distanceChecks) {
    const key = `${check.from}-${check.to}`;
    const dist = features.tipDistances[key] ?? 1;
    const normalizedExpectedMax = check.maxDistance / Math.max(features.handScale, 1e-4);
    const strictExpectedMax = normalizedExpectedMax * 0.85;
    const ratio = dist / Math.max(strictExpectedMax, 1e-4);
    const s = Math.exp(-((Math.max(0, ratio - 1) / 0.45) ** 2));
    totalScore += s;
  }

  return totalScore / letter.distanceChecks.length;
}
