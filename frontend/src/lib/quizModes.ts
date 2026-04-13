import { ALPHABET } from './alphabet';
import { LetterData } from './types';

export type QuizMode = 'gesture' | 'question' | 'match';
export type QuestionPromptType = 'image' | 'description';

export interface QuestionRound {
  id: string;
  letter: LetterData;
  correctLetter: string;
  promptType: QuestionPromptType;
  promptTitle: string;
  promptBody: string;
  promptImagePath?: string;
  options: string[];
}

export interface MatchPair {
  id: string;
  letter: LetterData;
  imagePath: string;
}

export interface MatchLetterCard {
  id: string;
  pairId: string;
  kind: 'letter';
  letter: string;
  label: string;
}

export interface MatchHandCard {
  id: string;
  pairId: string;
  kind: 'hand-image';
  letter: string;
  imagePath: string;
  alt: string;
}

export interface MatchRound {
  pairs: MatchPair[];
  letterCards: MatchLetterCard[];
  handCards: MatchHandCard[];
}

export interface QuizModeMeta {
  id: QuizMode;
  title: string;
  description: string;
  cta: string;
}

export const QUIZ_MODE_META: QuizModeMeta[] = [
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

const QUIZ_IMAGE_LETTERS = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));

export function getQuizLetterImagePath(letter: string): string | null {
  const normalizedLetter = letter.toUpperCase();
  if (!QUIZ_IMAGE_LETTERS.has(normalizedLetter)) return null;
  return `/asl_dataset_crops/${normalizedLetter}.png`;
}

function filterAlphabetWithQuizImages(alphabet: LetterData[]): LetterData[] {
  return alphabet.filter((candidate) => getQuizLetterImagePath(candidate.letter) !== null);
}

function shuffleArray<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[randomIndex];
    copy[randomIndex] = current;
  }

  return copy;
}

function pickLetters(count: number, random: () => number, alphabet: LetterData[]): LetterData[] {
  return shuffleArray(alphabet, random).slice(0, Math.min(count, alphabet.length));
}

function buildQuestionOptions(letter: LetterData, alphabet: LetterData[], random: () => number): string[] {
  const distractors = shuffleArray(
    alphabet.filter((candidate) => candidate.letter !== letter.letter).map((candidate) => candidate.letter),
    random
  ).slice(0, 3);

  return shuffleArray([letter.letter, ...distractors], random);
}

export function createQuestionRounds(
  count: number,
  random: () => number = Math.random,
  alphabet: LetterData[] = ALPHABET
): QuestionRound[] {
  const quizAlphabet = filterAlphabetWithQuizImages(alphabet);
  const sourceAlphabet = quizAlphabet.length > 0 ? quizAlphabet : alphabet;

  return pickLetters(count, random, sourceAlphabet).map((letter, index) => {
    const promptType: QuestionPromptType = index % 2 === 0 ? 'image' : 'description';

    if (promptType === 'image') {
      const promptImagePath = getQuizLetterImagePath(letter.letter);

      if (promptImagePath) {
        return {
          id: `question-${index}-${letter.letter}`,
          letter,
          correctLetter: letter.letter,
          promptType,
          promptTitle: '¿Qué letra muestra esta seña?',
          promptBody: 'Observa la imagen y elige la respuesta correcta.',
          promptImagePath,
          options: buildQuestionOptions(letter, sourceAlphabet, random),
        };
      }

      return {
        id: `question-${index}-${letter.letter}`,
        letter,
        correctLetter: letter.letter,
        promptType: 'description',
        promptTitle: '¿Qué letra se forma con esta indicación?',
        promptBody: letter.description,
        options: buildQuestionOptions(letter, sourceAlphabet, random),
      };
    }

    return {
      id: `question-${index}-${letter.letter}`,
      letter,
      correctLetter: letter.letter,
      promptType,
      promptTitle: '¿Qué letra se forma con esta indicación?',
      promptBody: letter.description,
      options: buildQuestionOptions(letter, sourceAlphabet, random),
    };
  });
}

export function createMatchRound(
  pairCount: number,
  random: () => number = Math.random,
  alphabet: LetterData[] = ALPHABET
): MatchRound {
  const quizAlphabet = filterAlphabetWithQuizImages(alphabet);

  const pairs = pickLetters(pairCount, random, quizAlphabet).flatMap((letter) => {
    const imagePath = getQuizLetterImagePath(letter.letter);
    if (!imagePath) return [];

    return [{
      id: `pair-${letter.letter}`,
      letter,
      imagePath,
    }];
  });

  const letterCards = shuffleArray(
    pairs.map((pair) => ({
      id: `letter-${pair.letter.letter}`,
      pairId: pair.id,
      kind: 'letter' as const,
      letter: pair.letter.letter,
      label: `Letra ${pair.letter.letter}`,
    })),
    random
  );

  const handCards = shuffleArray(
    pairs.map((pair) => ({
      id: `hand-${pair.letter.letter}`,
      pairId: pair.id,
      kind: 'hand-image' as const,
      letter: pair.letter.letter,
      imagePath: pair.imagePath,
      alt: `Seña de la letra ${pair.letter.letter}`,
    })),
    random
  );

  return { pairs, letterCards, handCards };
}
