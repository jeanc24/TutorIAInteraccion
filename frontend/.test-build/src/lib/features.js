"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFeatures = extractFeatures;
exports.landmarksToArray = landmarksToArray;
var types_1 = require("./types");
var TIP_INDICES = [4, 8, 12, 16, 20];
var PIP_INDICES = [3, 6, 10, 14, 18];
var MCP_INDICES = [2, 5, 9, 13, 17];
var DIP_INDICES = [3, 7, 11, 15, 19];
function distance(a, b) {
    return Math.sqrt(Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2) + Math.pow((a[2] - b[2]), 2));
}
function distance2D(a, b) {
    return Math.sqrt(Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2));
}
function angle(a, b, c) {
    var ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    var bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
    var dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
    var magBA = Math.sqrt(Math.pow(ba[0], 2) + Math.pow(ba[1], 2) + Math.pow(ba[2], 2));
    var magBC = Math.sqrt(Math.pow(bc[0], 2) + Math.pow(bc[1], 2) + Math.pow(bc[2], 2));
    if (magBA === 0 || magBC === 0)
        return 0;
    var cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
    return Math.acos(cosAngle) * (180 / Math.PI);
}
function isThumbExtended(landmarks, handedness) {
    var tip = landmarks[4];
    var ip = landmarks[3];
    var mcp = landmarks[2];
    if (handedness === 'Left') {
        return tip[0] < ip[0] && ip[0] < mcp[0];
    }
    return tip[0] > ip[0] && ip[0] > mcp[0];
}
function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
    return landmarks[tipIdx][1] < landmarks[pipIdx][1] &&
        landmarks[pipIdx][1] < landmarks[mcpIdx][1];
}
function getFingerAngle(landmarks, fingerIndex) {
    var tipIdx = TIP_INDICES[fingerIndex];
    var pipIdx = PIP_INDICES[fingerIndex];
    var mcpIdx = MCP_INDICES[fingerIndex];
    if (fingerIndex === 0) {
        return angle(landmarks[tipIdx], landmarks[pipIdx], landmarks[mcpIdx]);
    }
    var dipIdx = DIP_INDICES[fingerIndex];
    var a1 = angle(landmarks[tipIdx], landmarks[dipIdx], landmarks[pipIdx]);
    var a2 = angle(landmarks[dipIdx], landmarks[pipIdx], landmarks[mcpIdx]);
    return (a1 + a2) / 2;
}
function extractFeatures(landmarks, handedness, prevLandmarks) {
    var fingerStates = {
        thumb: isThumbExtended(landmarks, handedness),
        index: isFingerExtended(landmarks, 8, 6, 5),
        middle: isFingerExtended(landmarks, 12, 10, 9),
        ring: isFingerExtended(landmarks, 16, 14, 13),
        pinky: isFingerExtended(landmarks, 20, 18, 17),
    };
    var fingerAngles = {};
    types_1.FINGER_NAMES.forEach(function (name, i) {
        fingerAngles[name] = getFingerAngle(landmarks, i);
    });
    var tipDistances = {};
    for (var i = 0; i < TIP_INDICES.length; i++) {
        for (var j = i + 1; j < TIP_INDICES.length; j++) {
            var key = "".concat(TIP_INDICES[i], "-").concat(TIP_INDICES[j]);
            tipDistances[key] = distance(landmarks[TIP_INDICES[i]], landmarks[TIP_INDICES[j]]);
        }
    }
    tipDistances['4-8'] = distance(landmarks[4], landmarks[8]);
    tipDistances['4-12'] = distance(landmarks[4], landmarks[12]);
    tipDistances['4-16'] = distance(landmarks[4], landmarks[16]);
    tipDistances['4-20'] = distance(landmarks[4], landmarks[20]);
    tipDistances['8-12'] = distance(landmarks[8], landmarks[12]);
    var stability = 1.0;
    if (prevLandmarks) {
        var totalDelta = 0;
        for (var _i = 0, TIP_INDICES_1 = TIP_INDICES; _i < TIP_INDICES_1.length; _i++) {
            var tipIdx = TIP_INDICES_1[_i];
            totalDelta += distance2D(landmarks[tipIdx], prevLandmarks[tipIdx]);
        }
        var avgDelta = totalDelta / TIP_INDICES.length;
        stability = Math.max(0, 1 - Math.min(avgDelta / 0.15, 1));
    }
    return {
        landmarks: landmarks,
        fingerStates: fingerStates,
        fingerAngles: fingerAngles,
        tipDistances: tipDistances,
        stability: stability,
        handedness: handedness,
    };
}
function landmarksToArray(nlms) {
    return nlms.map(function (l) { return [l.x, l.y, l.z]; });
}
