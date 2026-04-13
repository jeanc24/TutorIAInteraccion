"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_LETTERS = exports.ALPHABET_MAP = exports.ALPHABET = void 0;
exports.getLetterByIndex = getLetterByIndex;
exports.getLetterIndex = getLetterIndex;
exports.getNextLetter = getNextLetter;
exports.getPrevLetter = getPrevLetter;
exports.getDifficultyColor = getDifficultyColor;
exports.getDifficultyLabel = getDifficultyLabel;
exports.getLetterImagePath = getLetterImagePath;
exports.ALPHABET = [
    {
        letter: 'A',
        name: 'A',
        description: 'Cierra el puño y coloca el pulgar al lado del índice, apuntando hacia arriba.',
        fingerPattern: { thumb: true, index: false, middle: false, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'B',
        name: 'B',
        description: 'Extiende los cuatro dedos juntos hacia arriba. El pulgar se cruza sobre la palma.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: true, pinky: true },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'C',
        name: 'C',
        description: 'Curva todos los dedos formando una "C", como si sostuvieras una pelota pequeña.',
        fingerPattern: { thumb: true, index: true, middle: true, ring: true, pinky: true },
        distanceChecks: [
            { from: 4, to: 8, maxDistance: 0.25, label: 'acerca el pulgar al índice' },
        ],
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'D',
        name: 'D',
        description: 'Extiende el índice hacia arriba. Los demás dedos se curvan y tocan la punta del pulgar.',
        fingerPattern: { thumb: null, index: true, middle: false, ring: false, pinky: false },
        distanceChecks: [
            { from: 4, to: 12, maxDistance: 0.1, label: 'toca el pulgar con el dedo medio' },
        ],
        holdMs: 700,
        thresholdSuccess: 0.75,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'E',
        name: 'E',
        description: 'Curva todos los dedos hacia la palma. El pulgar se cruza por debajo de los dedos.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'F',
        name: 'F',
        description: 'Une la punta del pulgar con la punta del índice formando un círculo. Extiende los otros tres dedos.',
        fingerPattern: { thumb: null, index: null, middle: true, ring: true, pinky: true },
        distanceChecks: [
            { from: 4, to: 8, maxDistance: 0.08, label: 'une la punta del pulgar con el índice' },
        ],
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'G',
        name: 'G',
        description: 'Extiende el índice y el pulgar hacia el frente, apuntando hacia el lado. Los demás dedos cerrados.',
        fingerPattern: { thumb: true, index: true, middle: false, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'H',
        name: 'H',
        description: 'Extiende el índice y el medio hacia el lado, juntos y horizontales. Los demás dedos cerrados.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'I',
        name: 'I',
        description: 'Extiende solo el meñique hacia arriba. Los demás dedos cerrados, pulgar sobre ellos.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: true },
        holdMs: 650,
        thresholdSuccess: 0.80,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'J',
        name: 'J',
        description: 'Comienza como la "I" (meñique extendido) y traza la forma de una "J" en el aire. Mantén la posición inicial.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: true },
        holdMs: 600,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'K',
        name: 'K',
        description: 'Extiende el índice y el medio en "V". Coloca el pulgar entre ambos, tocando el medio.',
        fingerPattern: { thumb: true, index: true, middle: true, ring: false, pinky: false },
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'L',
        name: 'L',
        description: 'Extiende el pulgar y el índice formando una "L". Los demás dedos cerrados.',
        fingerPattern: { thumb: true, index: true, middle: false, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.80,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'M',
        name: 'M',
        description: 'Cierra la mano. Coloca el pulgar debajo del índice, medio y anular, con las puntas de estos tres dedos visibles sobre el pulgar.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        holdMs: 750,
        thresholdSuccess: 0.70,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'N',
        name: 'N',
        description: 'Similar a la "M", pero solo el índice y el medio se colocan sobre el pulgar.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        holdMs: 750,
        thresholdSuccess: 0.70,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'Ñ',
        name: 'Ñ',
        description: 'Similar a la "N". Forma la N y añade un movimiento sutil o variación según la lengua de señas regional.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        holdMs: 750,
        thresholdSuccess: 0.70,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'O',
        name: 'O',
        description: 'Curva todos los dedos para que sus puntas toquen la punta del pulgar, formando un círculo.',
        fingerPattern: { thumb: null, index: null, middle: null, ring: null, pinky: null },
        distanceChecks: [
            { from: 4, to: 8, maxDistance: 0.09, label: 'une el pulgar con el índice' },
            { from: 4, to: 12, maxDistance: 0.12, label: 'acerca el medio al pulgar' },
        ],
        holdMs: 700,
        thresholdSuccess: 0.70,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'P',
        name: 'P',
        description: 'Como la "K" pero con la mano apuntando hacia abajo. Índice y medio extendidos con el pulgar entre ellos.',
        fingerPattern: { thumb: true, index: true, middle: true, ring: false, pinky: false },
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'Q',
        name: 'Q',
        description: 'Extiende el pulgar y el índice hacia abajo, como una "G" invertida. Los demás dedos cerrados.',
        fingerPattern: { thumb: true, index: true, middle: false, ring: false, pinky: false },
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'R',
        name: 'R',
        description: 'Cruza el dedo medio sobre el índice, ambos extendidos hacia arriba. Los demás dedos cerrados.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        distanceChecks: [
            { from: 8, to: 12, maxDistance: 0.06, label: 'cruza el medio sobre el índice' },
        ],
        holdMs: 750,
        thresholdSuccess: 0.68,
        gestureType: 'STATIC',
        difficulty: 'hard',
    },
    {
        letter: 'S',
        name: 'S',
        description: 'Cierra el puño con el pulgar cruzado por delante de los dedos.',
        fingerPattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'T',
        name: 'T',
        description: 'Cierra el puño y coloca el pulgar entre el índice y el medio.',
        fingerPattern: { thumb: null, index: false, middle: false, ring: false, pinky: false },
        holdMs: 700,
        thresholdSuccess: 0.72,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'U',
        name: 'U',
        description: 'Extiende el índice y el medio juntos hacia arriba. Los demás dedos cerrados, pulgar sobre ellos.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.80,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'V',
        name: 'V',
        description: 'Extiende el índice y el medio separados en "V" (signo de paz). Los demás dedos cerrados.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.80,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'W',
        name: 'W',
        description: 'Extiende el índice, medio y anular separados. El meñique y el pulgar se cierran.',
        fingerPattern: { thumb: false, index: true, middle: true, ring: true, pinky: false },
        holdMs: 650,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'X',
        name: 'X',
        description: 'Extiende el índice y dóblalo en forma de gancho. Los demás dedos cerrados.',
        fingerPattern: { thumb: false, index: null, middle: false, ring: false, pinky: false },
        holdMs: 700,
        thresholdSuccess: 0.70,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
    {
        letter: 'Y',
        name: 'Y',
        description: 'Extiende el pulgar y el meñique. Los otros tres dedos se cierran.',
        fingerPattern: { thumb: true, index: false, middle: false, ring: false, pinky: true },
        holdMs: 650,
        thresholdSuccess: 0.80,
        gestureType: 'STATIC',
        difficulty: 'easy',
    },
    {
        letter: 'Z',
        name: 'Z',
        description: 'Extiende el índice y traza la forma de una "Z" en el aire. Mantén la posición inicial con el índice extendido.',
        fingerPattern: { thumb: false, index: true, middle: false, ring: false, pinky: false },
        holdMs: 600,
        thresholdSuccess: 0.78,
        gestureType: 'STATIC',
        difficulty: 'medium',
    },
];
exports.ALPHABET_MAP = new Map(exports.ALPHABET.map(function (l) { return [l.letter, l]; }));
exports.TOTAL_LETTERS = exports.ALPHABET.length;
function getLetterByIndex(index) {
    return exports.ALPHABET[((index % exports.TOTAL_LETTERS) + exports.TOTAL_LETTERS) % exports.TOTAL_LETTERS];
}
function getLetterIndex(letter) {
    return exports.ALPHABET.findIndex(function (l) { return l.letter === letter; });
}
function getNextLetter(current) {
    var idx = getLetterIndex(current);
    return getLetterByIndex(idx + 1);
}
function getPrevLetter(current) {
    var idx = getLetterIndex(current);
    return getLetterByIndex(idx - 1);
}
function getDifficultyColor(difficulty) {
    switch (difficulty) {
        case 'easy': return 'text-success bg-emerald-50 border-emerald-200';
        case 'medium': return 'text-warning bg-amber-50 border-amber-200';
        case 'hard': return 'text-error bg-red-50 border-red-200';
        default: return 'text-text-secondary bg-stone-50 border-stone-200';
    }
}
function getDifficultyLabel(difficulty) {
    switch (difficulty) {
        case 'easy': return 'Fácil';
        case 'medium': return 'Media';
        case 'hard': return 'Difícil';
        default: return difficulty;
    }
}
function getLetterImagePath(letter) {
    var l = letter.toUpperCase();
    if (l === 'Ñ')
        return '/alphabet/enie.png';
    return "/alphabet/".concat(l.toLowerCase(), ".png");
}
