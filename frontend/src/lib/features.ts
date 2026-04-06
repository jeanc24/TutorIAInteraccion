import { Finger, FINGER_NAMES, HandFeatures, Landmark } from './types';

const TIP_INDICES = [4, 8, 12, 16, 20];
const PIP_INDICES = [3, 6, 10, 14, 18];
const MCP_INDICES = [2, 5, 9, 13, 17];
const DIP_INDICES = [3, 7, 11, 15, 19];

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

function isThumbExtended(landmarks: Landmark[], handedness: string): boolean {
  const tip = landmarks[4];
  const ip = landmarks[3];
  const mcp = landmarks[2];

  if (handedness === 'Left') {
    return tip[0] < ip[0] && ip[0] < mcp[0];
  }
  return tip[0] > ip[0] && ip[0] > mcp[0];
}

function isFingerExtended(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number
): boolean {
  return landmarks[tipIdx][1] < landmarks[pipIdx][1] &&
         landmarks[pipIdx][1] < landmarks[mcpIdx][1];
}

function getFingerAngle(landmarks: Landmark[], fingerIndex: number): number {
  const tipIdx = TIP_INDICES[fingerIndex];
  const pipIdx = PIP_INDICES[fingerIndex];
  const mcpIdx = MCP_INDICES[fingerIndex];

  if (fingerIndex === 0) {
    return angle(landmarks[tipIdx], landmarks[pipIdx], landmarks[mcpIdx]);
  }

  const dipIdx = DIP_INDICES[fingerIndex];
  const a1 = angle(landmarks[tipIdx], landmarks[dipIdx], landmarks[pipIdx]);
  const a2 = angle(landmarks[dipIdx], landmarks[pipIdx], landmarks[mcpIdx]);
  return (a1 + a2) / 2;
}

export function extractFeatures(
  landmarks: Landmark[],
  handedness: string,
  prevLandmarks: Landmark[] | null
): HandFeatures {
  const fingerStates: Record<Finger, boolean> = {
    thumb: isThumbExtended(landmarks, handedness),
    index: isFingerExtended(landmarks, 8, 6, 5),
    middle: isFingerExtended(landmarks, 12, 10, 9),
    ring: isFingerExtended(landmarks, 16, 14, 13),
    pinky: isFingerExtended(landmarks, 20, 18, 17),
  };

  const fingerAngles: Record<Finger, number> = {} as Record<Finger, number>;
  FINGER_NAMES.forEach((name, i) => {
    fingerAngles[name] = getFingerAngle(landmarks, i);
  });

  const tipDistances: Record<string, number> = {};
  for (let i = 0; i < TIP_INDICES.length; i++) {
    for (let j = i + 1; j < TIP_INDICES.length; j++) {
      const key = `${TIP_INDICES[i]}-${TIP_INDICES[j]}`;
      tipDistances[key] = distance(landmarks[TIP_INDICES[i]], landmarks[TIP_INDICES[j]]);
    }
  }
  tipDistances['4-8'] = distance(landmarks[4], landmarks[8]);
  tipDistances['4-12'] = distance(landmarks[4], landmarks[12]);
  tipDistances['4-16'] = distance(landmarks[4], landmarks[16]);
  tipDistances['4-20'] = distance(landmarks[4], landmarks[20]);
  tipDistances['8-12'] = distance(landmarks[8], landmarks[12]);

  let stability = 1.0;
  if (prevLandmarks) {
    let totalDelta = 0;
    for (const tipIdx of TIP_INDICES) {
      totalDelta += distance2D(landmarks[tipIdx], prevLandmarks[tipIdx]);
    }
    const avgDelta = totalDelta / TIP_INDICES.length;
    stability = Math.max(0, 1 - Math.min(avgDelta / 0.15, 1));
  }

  return {
    landmarks,
    fingerStates,
    fingerAngles,
    tipDistances,
    stability,
    handedness,
  };
}

export function landmarksToArray(
  nlms: { x: number; y: number; z: number }[]
): Landmark[] {
  return nlms.map((l) => [l.x, l.y, l.z]);
}
