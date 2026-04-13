"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvalContext = createEvalContext;
exports.evaluate = evaluate;
var types_1 = require("./types");
var FINGER_LABELS = {
    thumb: 'pulgar',
    index: 'índice',
    middle: 'medio',
    ring: 'anular',
    pinky: 'meñique',
};
function createEvalContext() {
    return { poseStartedAt: null, holdMs: 0 };
}
function evaluate(letter, features, ctx, now) {
    var _a, _b;
    var _c = scoreFingers(letter, features), fingerScore = _c.fingerScore, corrections = _c.corrections;
    var distScore = scoreDistances(letter, features);
    var stabilityScore = features.stability;
    var fingerWeight = 0.55;
    var distWeight = ((_a = letter.distanceChecks) === null || _a === void 0 ? void 0 : _a.length) ? 0.25 : 0.0;
    var stabilityWeight = ((_b = letter.distanceChecks) === null || _b === void 0 ? void 0 : _b.length) ? 0.20 : 0.45;
    var totalWeight = fingerWeight + distWeight + stabilityWeight;
    var rawScore = (fingerWeight * fingerScore +
        distWeight * distScore +
        stabilityWeight * stabilityScore) / totalWeight;
    var score = Math.max(0, Math.min(rawScore, 1));
    var status = 'tracking';
    var completed = false;
    var feedback = '';
    var holdProgress = 0;
    if (score >= letter.thresholdSuccess) {
        if (ctx.poseStartedAt === null) {
            ctx.poseStartedAt = now;
        }
        var elapsed = now - ctx.poseStartedAt;
        holdProgress = Math.min(elapsed / letter.holdMs, 1);
        if (elapsed >= letter.holdMs) {
            completed = true;
            status = 'success';
            feedback = "\u00A1Correcto! Letra \"".concat(letter.letter, "\" completada.");
        }
        else {
            status = 'holding';
            feedback = 'Mantén la postura...';
        }
    }
    else {
        ctx.poseStartedAt = null;
        holdProgress = 0;
        if (score < 0.35) {
            status = 'error';
            feedback = corrections.length > 0
                ? "Corrige: ".concat(corrections.slice(0, 2).join(', '), ".")
                : 'Ajusta la posición de la mano.';
        }
        else {
            status = 'tracking';
            feedback = corrections.length > 0
                ? "Casi: ".concat(corrections.slice(0, 2).join(', '), ".")
                : 'Sigue ajustando la postura.';
        }
    }
    return { status: status, score: score, completed: completed, feedback: feedback, corrections: corrections, holdProgress: holdProgress };
}
function scoreFingers(letter, features) {
    var matches = 0;
    var checked = 0;
    var corrections = [];
    for (var _i = 0, FINGER_NAMES_1 = types_1.FINGER_NAMES; _i < FINGER_NAMES_1.length; _i++) {
        var finger = FINGER_NAMES_1[_i];
        var expected = letter.fingerPattern[finger];
        if (expected === null)
            continue;
        checked++;
        var actual = features.fingerStates[finger];
        if (actual === expected) {
            matches++;
        }
        else {
            var action = expected ? 'extiende' : 'flexiona';
            corrections.push("".concat(action, " el ").concat(FINGER_LABELS[finger]));
        }
    }
    return {
        fingerScore: checked > 0 ? matches / checked : 1,
        corrections: corrections,
    };
}
function scoreDistances(letter, features) {
    var _a, _b;
    if (!((_a = letter.distanceChecks) === null || _a === void 0 ? void 0 : _a.length))
        return 1;
    var totalScore = 0;
    for (var _i = 0, _c = letter.distanceChecks; _i < _c.length; _i++) {
        var check = _c[_i];
        var key = "".concat(check.from, "-").concat(check.to);
        var dist = (_b = features.tipDistances[key]) !== null && _b !== void 0 ? _b : 1;
        var s = Math.max(0, 1 - dist / check.maxDistance);
        totalScore += s;
    }
    return totalScore / letter.distanceChecks.length;
}
