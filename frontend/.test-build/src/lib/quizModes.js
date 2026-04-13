"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUIZ_MODE_META = void 0;
exports.getQuizLetterImagePath = getQuizLetterImagePath;
exports.createQuestionRounds = createQuestionRounds;
exports.createMatchRound = createMatchRound;
var alphabet_1 = require("./alphabet");
exports.QUIZ_MODE_META = [
    {
        id: 'gesture',
        title: 'Quiz de señas',
        description: 'Forma la letra de memoria frente a la cámara y supera el tiempo límite.',
        cta: 'Comenzar evaluación',
    },
    {
        id: 'question',
        title: 'Quiz de preguntas',
        description: 'Responde estilo kahoot viendo la seña o leyendo una pista de cómo mover la mano.',
        cta: 'Comenzar preguntas',
    },
    {
        id: 'match',
        title: 'Quiz de emparejar',
        description: 'Relaciona cada letra con la imagen correcta de la mano.',
        cta: 'Comenzar emparejamiento',
    },
];
var QUIZ_IMAGE_LETTERS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
function getQuizLetterImagePath(letter) {
    var normalizedLetter = letter.toUpperCase();
    if (!QUIZ_IMAGE_LETTERS.has(normalizedLetter))
        return null;
    return "/asl_dataset_crops/".concat(normalizedLetter, ".png");
}
function filterAlphabetWithQuizImages(alphabet) {
    return alphabet.filter(function (candidate) { return getQuizLetterImagePath(candidate.letter) !== null; });
}
function shuffleArray(items, random) {
    if (random === void 0) { random = Math.random; }
    var copy = __spreadArray([], items, true);
    for (var index = copy.length - 1; index > 0; index -= 1) {
        var randomIndex = Math.floor(random() * (index + 1));
        var current = copy[index];
        copy[index] = copy[randomIndex];
        copy[randomIndex] = current;
    }
    return copy;
}
function pickLetters(count, random, alphabet) {
    return shuffleArray(alphabet, random).slice(0, Math.min(count, alphabet.length));
}
function buildQuestionOptions(letter, alphabet, random) {
    var distractors = shuffleArray(alphabet.filter(function (candidate) { return candidate.letter !== letter.letter; }).map(function (candidate) { return candidate.letter; }), random).slice(0, 3);
    return shuffleArray(__spreadArray([letter.letter], distractors, true), random);
}
function createQuestionRounds(count, random, alphabet) {
    if (random === void 0) { random = Math.random; }
    if (alphabet === void 0) { alphabet = alphabet_1.ALPHABET; }
    var quizAlphabet = filterAlphabetWithQuizImages(alphabet);
    var sourceAlphabet = quizAlphabet.length > 0 ? quizAlphabet : alphabet;
    return pickLetters(count, random, sourceAlphabet).map(function (letter, index) {
        var promptType = index % 2 === 0 ? 'image' : 'description';
        if (promptType === 'image') {
            var promptImagePath = getQuizLetterImagePath(letter.letter);
            if (promptImagePath) {
                return {
                    id: "question-".concat(index, "-").concat(letter.letter),
                    letter: letter,
                    correctLetter: letter.letter,
                    promptType: promptType,
                    promptTitle: '¿Qué letra muestra esta seña?',
                    promptBody: 'Observa la imagen y elige la respuesta correcta.',
                    promptImagePath: promptImagePath,
                    options: buildQuestionOptions(letter, sourceAlphabet, random),
                };
            }
            return {
                id: "question-".concat(index, "-").concat(letter.letter),
                letter: letter,
                correctLetter: letter.letter,
                promptType: 'description',
                promptTitle: '¿Qué letra se forma con esta indicación?',
                promptBody: letter.description,
                options: buildQuestionOptions(letter, sourceAlphabet, random),
            };
        }
        return {
            id: "question-".concat(index, "-").concat(letter.letter),
            letter: letter,
            correctLetter: letter.letter,
            promptType: promptType,
            promptTitle: '¿Qué letra se forma con esta indicación?',
            promptBody: letter.description,
            options: buildQuestionOptions(letter, sourceAlphabet, random),
        };
    });
}
function createMatchRound(pairCount, random, alphabet) {
    if (random === void 0) { random = Math.random; }
    if (alphabet === void 0) { alphabet = alphabet_1.ALPHABET; }
    var quizAlphabet = filterAlphabetWithQuizImages(alphabet);
    var pairs = pickLetters(pairCount, random, quizAlphabet).flatMap(function (letter) {
        var imagePath = getQuizLetterImagePath(letter.letter);
        if (!imagePath)
            return [];
        return [{
                id: "pair-".concat(letter.letter),
                letter: letter,
                imagePath: imagePath,
            }];
    });
    var letterCards = shuffleArray(pairs.map(function (pair) { return ({
        id: "letter-".concat(pair.letter.letter),
        pairId: pair.id,
        kind: 'letter',
        letter: pair.letter.letter,
        label: "Letra ".concat(pair.letter.letter),
    }); }), random);
    var handCards = shuffleArray(pairs.map(function (pair) { return ({
        id: "hand-".concat(pair.letter.letter),
        pairId: pair.id,
        kind: 'hand-image',
        letter: pair.letter.letter,
        imagePath: pair.imagePath,
        alt: "Se\u00F1a de la letra ".concat(pair.letter.letter),
    }); }), random);
    return { pairs: pairs, letterCards: letterCards, handCards: handCards };
}
