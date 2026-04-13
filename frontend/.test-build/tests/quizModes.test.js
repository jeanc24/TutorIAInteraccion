"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var strict_1 = __importDefault(require("node:assert/strict"));
var quizModes_1 = require("../src/lib/quizModes");
function createSequenceRandom(values) {
    var index = 0;
    return function () {
        var next = values[index % values.length];
        index += 1;
        return next;
    };
}
function run(name, check) {
    try {
        check();
        console.log("PASS ".concat(name));
    }
    catch (error) {
        console.error("FAIL ".concat(name));
        throw error;
    }
}
run('createQuestionRounds builds mixed prompts with unique options and the correct answer included', function () {
    var rounds = (0, quizModes_1.createQuestionRounds)(4, createSequenceRandom([0.12, 0.84, 0.33, 0.57, 0.71]));
    strict_1.default.equal(rounds.length, 4);
    strict_1.default.ok(rounds.some(function (round) { return round.promptType === 'image'; }));
    strict_1.default.ok(rounds.some(function (round) { return round.promptType === 'description'; }));
    var imageRounds = rounds.filter(function (round) { return round.promptType === 'image'; });
    strict_1.default.ok(imageRounds.length > 0);
    strict_1.default.ok(imageRounds.every(function (round) { return typeof round.promptImagePath === 'string' && /^\/asl_dataset_crops\/[A-Z]\.png$/.test(round.promptImagePath); }));
    for (var _i = 0, rounds_1 = rounds; _i < rounds_1.length; _i++) {
        var round = rounds_1[_i];
        strict_1.default.equal(new Set(round.options).size, round.options.length);
        strict_1.default.equal(round.options.length, 4);
        strict_1.default.ok(round.options.includes(round.correctLetter));
        strict_1.default.equal(round.correctLetter, round.letter.letter);
    }
});
run('createMatchRound returns matching letter and hand-image cards for the same shuffled pairs', function () {
    var round = (0, quizModes_1.createMatchRound)(6, createSequenceRandom([0.91, 0.14, 0.62, 0.27, 0.48, 0.73]));
    strict_1.default.equal(round.pairs.length, 6);
    strict_1.default.equal(round.letterCards.length, 6);
    strict_1.default.equal(round.handCards.length, 6);
    var pairIds = new Set(round.pairs.map(function (pair) { return pair.id; }));
    strict_1.default.deepEqual(new Set(round.letterCards.map(function (card) { return card.pairId; })), pairIds);
    strict_1.default.deepEqual(new Set(round.handCards.map(function (card) { return card.pairId; })), pairIds);
    strict_1.default.ok(round.handCards.every(function (card) { return card.kind === 'hand-image'; }));
    strict_1.default.ok(round.letterCards.every(function (card) { return card.kind === 'letter'; }));
    strict_1.default.ok(round.pairs.every(function (pair) { return /^\/asl_dataset_crops\/[A-Z]\.png$/.test(pair.imagePath); }));
    strict_1.default.ok(round.handCards.every(function (card) { return /^\/asl_dataset_crops\/[A-Z]\.png$/.test(card.imagePath); }));
});
