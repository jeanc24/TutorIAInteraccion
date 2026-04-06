export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export const FINGER_NAMES: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

export type Landmark = [number, number, number];

export type FingerPattern = Record<Finger, boolean | null>;

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DistanceCheck {
  from: number;
  to: number;
  maxDistance: number;
  label: string;
}

export interface LetterData {
  letter: string;
  name: string;
  description: string;
  fingerPattern: FingerPattern;
  distanceChecks?: DistanceCheck[];
  gestureType: 'STATIC';
  holdMs: number;
  thresholdSuccess: number;
  difficulty: Difficulty;
}

export interface HandFeatures {
  landmarks: Landmark[];
  fingerStates: Record<Finger, boolean>;
  fingerAngles: Record<Finger, number>;
  tipDistances: Record<string, number>;
  stability: number;
  handedness: string;
}

export type EvaluationStatus = 'idle' | 'no_hand' | 'tracking' | 'holding' | 'success' | 'error';

export interface EvaluationResult {
  status: EvaluationStatus;
  score: number;
  completed: boolean;
  feedback: string;
  corrections: string[];
  holdProgress: number;
}

export interface LetterProgress {
  letter: string;
  bestScore: number;
  attemptCount: number;
  completed: boolean;
  lastPracticedAt: string | null;
  firstCompletedAt: string | null;
}

export interface ProgressData {
  letters: Record<string, LetterProgress>;
  totalCompleted: number;
  currentStreak: number;
  lastSessionAt: string | null;
}

export interface PracticeAttempt {
  letter: string;
  score: number;
  durationMs: number;
  completed: boolean;
  mode: 'learn' | 'practice' | 'quiz';
  timestamp: string;
}
