import { Finger, HandFeatures, Landmark } from './types';

const TIP_INDICES = [4, 8, 12, 16, 20];
const DIP_INDICES = [3, 7, 11, 15, 19];
const PIP_INDICES = [3, 6, 10, 14, 18];
const MCP_INDICES = [2, 5, 9, 13, 17];
const MIN_HAND_SCALE = 1e-4;

function distance(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function distance2D(a: Landmark, b: Landmark): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const ba: Landmark = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const bc: Landmark = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
  const magBA = Math.sqrt(ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2);
  const magBC = Math.sqrt(bc[0] ** 2 + bc[1] ** 2 + bc[2] ** 2);
  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

function normalizeDistance(a: Landmark, b: Landmark, handScale: number): number {
  return distance(a, b) / handScale;
}

function fingerExtendedScore(jointAngles: number[]): number {
  const normalized = jointAngles.map((joint) => {
    const t = (joint - 90) / 90;
    return Math.max(0, Math.min(1, t));
  });
  return normalized.reduce((acc, cur) => acc + cur, 0) / normalized.length;
}

function isThumbExtendedByAxis(landmarks: Landmark[], handedness: string): boolean {
  const tip = landmarks[4];
  const ip = landmarks[3];
  const mcp = landmarks[2];
  if (handedness === 'Left') {
    return tip[0] < ip[0] && ip[0] < mcp[0];
  }
  return tip[0] > ip[0] && ip[0] > mcp[0];
}

function isFingerExtendedByAxis(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): boolean {
  const tipY = landmarks[tipIdx][1];
  const pipY = landmarks[pipIdx][1];
  const mcpY = landmarks[mcpIdx][1];
  return tipY < pipY && pipY < mcpY;
}

function getThumbMetrics(landmarks: Landmark[], handScale: number): {
  extensionScore: number;
  extensionAngle: number;
} {
  const mcpAngle = angle(landmarks[1], landmarks[2], landmarks[3]);
  const ipAngle = angle(landmarks[2], landmarks[3], landmarks[4]);
  const reach = normalizeDistance(landmarks[4], landmarks[5], handScale);
  const reachScore = Math.max(0, Math.min(1, (reach - 0.25) / 0.45));

  const extensionScore = 0.55 * fingerExtendedScore([mcpAngle, ipAngle]) + 0.45 * reachScore;
  const extensionAngle = (mcpAngle + ipAngle) / 2;

  return { extensionScore, extensionAngle };
}

function getFingerMetrics(landmarks: Landmark[], fingerIndex: number): {
  extensionScore: number;
  extensionAngle: number;
} {
  const tipIdx = TIP_INDICES[fingerIndex];
  const dipIdx = DIP_INDICES[fingerIndex];
  const pipIdx = PIP_INDICES[fingerIndex];
  const mcpIdx = MCP_INDICES[fingerIndex];

  const mcpAngle = angle(landmarks[0], landmarks[mcpIdx], landmarks[pipIdx]);
  const pipAngle = angle(landmarks[mcpIdx], landmarks[pipIdx], landmarks[dipIdx]);
  const dipAngle = angle(landmarks[pipIdx], landmarks[dipIdx], landmarks[tipIdx]);
  const extensionScore = fingerExtendedScore([mcpAngle, pipAngle, dipAngle]);
  const extensionAngle = (mcpAngle + pipAngle + dipAngle) / 3;

  return { extensionScore, extensionAngle };
}

function getHandScale(landmarks: Landmark[]): number {
  return Math.max(distance(landmarks[0], landmarks[9]), MIN_HAND_SCALE);
}

export function extractFeatures(
  landmarks: Landmark[],
  handedness: string,
  prevLandmarks: Landmark[] | null
): HandFeatures {
  const handScale = getHandScale(landmarks);
  const thumbMetrics = getThumbMetrics(landmarks, handScale);
  const indexMetrics = getFingerMetrics(landmarks, 1);
  const middleMetrics = getFingerMetrics(landmarks, 2);
  const ringMetrics = getFingerMetrics(landmarks, 3);
  const pinkyMetrics = getFingerMetrics(landmarks, 4);
  const thumbByAxis = isThumbExtendedByAxis(landmarks, handedness);
  const indexByAxis = isFingerExtendedByAxis(landmarks, 8, 6, 5);
  const middleByAxis = isFingerExtendedByAxis(landmarks, 12, 10, 9);
  const ringByAxis = isFingerExtendedByAxis(landmarks, 16, 14, 13);
  const pinkyByAxis = isFingerExtendedByAxis(landmarks, 20, 18, 17);

  const fingerStates: Record<Finger, boolean> = {
    thumb: thumbMetrics.extensionScore >= 0.50 || thumbByAxis,
    index: indexMetrics.extensionScore >= 0.58 || indexByAxis,
    middle: middleMetrics.extensionScore >= 0.58 || middleByAxis,
    ring: ringMetrics.extensionScore >= 0.58 || ringByAxis,
    pinky: pinkyMetrics.extensionScore >= 0.55 || pinkyByAxis,
  };

  const fingerAngles: Record<Finger, number> = {
    thumb: thumbMetrics.extensionAngle,
    index: indexMetrics.extensionAngle,
    middle: middleMetrics.extensionAngle,
    ring: ringMetrics.extensionAngle,
    pinky: pinkyMetrics.extensionAngle,
  };

  const tipDistances: Record<string, number> = {};
  for (let i = 0; i < TIP_INDICES.length; i++) {
    for (let j = i + 1; j < TIP_INDICES.length; j++) {
      const key = `${TIP_INDICES[i]}-${TIP_INDICES[j]}`;
      tipDistances[key] = normalizeDistance(
        landmarks[TIP_INDICES[i]],
        landmarks[TIP_INDICES[j]],
        handScale
      );
    }
  }

  let stability = 1.0;
  if (prevLandmarks) {
    let totalDelta = 0;
    for (const tipIdx of TIP_INDICES) {
      totalDelta += distance2D(landmarks[tipIdx], prevLandmarks[tipIdx]);
    }
    const avgDelta = totalDelta / TIP_INDICES.length;
    stability = Math.max(0, 1 - Math.min((avgDelta / handScale) / 0.9, 1));
  }

  return {
    landmarks,
    fingerStates,
    fingerAngles,
    tipDistances,
    handScale,
    stability,
    handedness,
  };
}

export function landmarksToArray(
  nlms: { x: number; y: number; z: number }[]
): Landmark[] {
  return nlms.map((l) => [l.x, l.y, l.z]);
}
