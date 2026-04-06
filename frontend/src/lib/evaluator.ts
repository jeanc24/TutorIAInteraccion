import { LetterData, HandFeatures, EvaluationResult, EvaluationStatus, Finger, FINGER_NAMES } from './types';

interface EvalContext {
  poseStartedAt: number | null;
  holdMs: number;
}

const FINGER_LABELS: Record<Finger, string> = {
  thumb: 'pulgar',
  index: 'índice',
  middle: 'medio',
  ring: 'anular',
  pinky: 'meñique',
};

export function createEvalContext(): EvalContext {
  return { poseStartedAt: null, holdMs: 0 };
}

export function evaluate(
  letter: LetterData,
  features: HandFeatures,
  ctx: EvalContext,
  now: number
): EvaluationResult {
  const { fingerScore, corrections } = scoreFingers(letter, features);
  const distScore = scoreDistances(letter, features);
  const stabilityScore = features.stability;

  const fingerWeight = 0.55;
  const distWeight = letter.distanceChecks?.length ? 0.25 : 0.0;
  const stabilityWeight = letter.distanceChecks?.length ? 0.20 : 0.45;
  const totalWeight = fingerWeight + distWeight + stabilityWeight;

  const rawScore =
    (fingerWeight * fingerScore +
     distWeight * distScore +
     stabilityWeight * stabilityScore) / totalWeight;

  const score = Math.max(0, Math.min(rawScore, 1));
  let status: EvaluationStatus = 'tracking';
  let completed = false;
  let feedback = '';
  let holdProgress = 0;

  if (score >= letter.thresholdSuccess) {
    if (ctx.poseStartedAt === null) {
      ctx.poseStartedAt = now;
    }
    const elapsed = now - ctx.poseStartedAt;
    holdProgress = Math.min(elapsed / letter.holdMs, 1);

    if (elapsed >= letter.holdMs) {
      completed = true;
      status = 'success';
      feedback = `¡Correcto! Letra "${letter.letter}" completada.`;
    } else {
      status = 'holding';
      feedback = 'Mantén la postura...';
    }
  } else {
    ctx.poseStartedAt = null;
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

  return { status, score, completed, feedback, corrections, holdProgress };
}

function scoreFingers(letter: LetterData, features: HandFeatures): { fingerScore: number; corrections: string[] } {
  let matches = 0;
  let checked = 0;
  const corrections: string[] = [];

  for (const finger of FINGER_NAMES) {
    const expected = letter.fingerPattern[finger];
    if (expected === null) continue;
    checked++;

    const actual = features.fingerStates[finger];
    if (actual === expected) {
      matches++;
    } else {
      const action = expected ? 'extiende' : 'flexiona';
      corrections.push(`${action} el ${FINGER_LABELS[finger]}`);
    }
  }

  return {
    fingerScore: checked > 0 ? matches / checked : 1,
    corrections,
  };
}

function scoreDistances(letter: LetterData, features: HandFeatures): number {
  if (!letter.distanceChecks?.length) return 1;

  let totalScore = 0;
  for (const check of letter.distanceChecks) {
    const key = `${check.from}-${check.to}`;
    const dist = features.tipDistances[key] ?? 1;
    const s = Math.max(0, 1 - dist / check.maxDistance);
    totalScore += s;
  }

  return totalScore / letter.distanceChecks.length;
}
