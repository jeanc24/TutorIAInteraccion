"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProgress = loadProgress;
exports.saveProgress = saveProgress;
exports.recordAttempt = recordAttempt;
exports.resetProgress = resetProgress;
exports.getCompletedCount = getCompletedCount;
exports.getWeakLetters = getWeakLetters;
var alphabet_1 = require("./alphabet");
var STORAGE_KEY = 'signtutor_progress';
function createDefaultProgress() {
    var letters = {};
    for (var _i = 0, ALPHABET_1 = alphabet_1.ALPHABET; _i < ALPHABET_1.length; _i++) {
        var l = ALPHABET_1[_i];
        letters[l.letter] = {
            letter: l.letter,
            bestScore: 0,
            attemptCount: 0,
            completed: false,
            lastPracticedAt: null,
            firstCompletedAt: null,
        };
    }
    return {
        letters: letters,
        totalCompleted: 0,
        currentStreak: 0,
        lastSessionAt: null,
    };
}
function loadProgress() {
    if (typeof window === 'undefined')
        return createDefaultProgress();
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return createDefaultProgress();
        var data = JSON.parse(raw);
        for (var _i = 0, ALPHABET_2 = alphabet_1.ALPHABET; _i < ALPHABET_2.length; _i++) {
            var l = ALPHABET_2[_i];
            if (!data.letters[l.letter]) {
                data.letters[l.letter] = {
                    letter: l.letter,
                    bestScore: 0,
                    attemptCount: 0,
                    completed: false,
                    lastPracticedAt: null,
                    firstCompletedAt: null,
                };
            }
        }
        return data;
    }
    catch (_a) {
        return createDefaultProgress();
    }
}
function saveProgress(data) {
    if (typeof window === 'undefined')
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    catch ( /* quota exceeded — silent */_a) { /* quota exceeded — silent */ }
}
function recordAttempt(progress, attempt) {
    var updated = __assign(__assign({}, progress), { letters: __assign({}, progress.letters) });
    var lp = __assign({}, updated.letters[attempt.letter]);
    lp.attemptCount++;
    lp.lastPracticedAt = attempt.timestamp;
    if (attempt.score > lp.bestScore) {
        lp.bestScore = attempt.score;
    }
    if (attempt.completed && !lp.completed) {
        lp.completed = true;
        lp.firstCompletedAt = attempt.timestamp;
        updated.totalCompleted = Object.values(updated.letters).filter(function (l) { return l.letter === attempt.letter ? true : l.completed; }).length;
    }
    updated.letters[attempt.letter] = lp;
    updated.lastSessionAt = attempt.timestamp;
    if (attempt.completed) {
        updated.currentStreak++;
    }
    else {
        updated.currentStreak = 0;
    }
    saveProgress(updated);
    return updated;
}
function resetProgress() {
    var data = createDefaultProgress();
    saveProgress(data);
    return data;
}
function getCompletedCount(progress) {
    return Object.values(progress.letters).filter(function (l) { return l.completed; }).length;
}
function getWeakLetters(progress, count) {
    if (count === void 0) { count = 5; }
    return Object.values(progress.letters)
        .filter(function (l) { return !l.completed && l.attemptCount > 0; })
        .sort(function (a, b) { return a.bestScore - b.bestScore; })
        .slice(0, count);
}
