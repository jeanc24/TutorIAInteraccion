import assert from 'node:assert/strict';

import { createMatchRound, createQuestionRounds } from '../src/lib/quizModes';

function createSequenceRandom(values: number[]): () => number {
  let index = 0;
  return () => {
    const next = values[index % values.length];
    index += 1;
    return next;
  };
}

function run(name: string, check: () => void) {
  try {
    check();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run('createQuestionRounds builds mixed prompts with unique options and the correct answer included', () => {
  const rounds = createQuestionRounds(4, createSequenceRandom([0.12, 0.84, 0.33, 0.57, 0.71]));

  assert.equal(rounds.length, 4);
  assert.ok(rounds.some((round) => round.promptType === 'image'));
  assert.ok(rounds.some((round) => round.promptType === 'description'));

  const imageRounds = rounds.filter((round) => round.promptType === 'image');
  assert.ok(imageRounds.length > 0);
  assert.ok(
    imageRounds.every(
      (round) => typeof round.promptImagePath === 'string' && /^\/asl_dataset_crops\/[A-Z]\.png$/.test(round.promptImagePath)
    )
  );

  for (const round of rounds) {
    assert.equal(new Set(round.options).size, round.options.length);
    assert.equal(round.options.length, 4);
    assert.ok(round.options.includes(round.correctLetter));
    assert.equal(round.correctLetter, round.letter.letter);
  }
});

run('createMatchRound returns matching letter and hand-image cards for the same shuffled pairs', () => {
  const round = createMatchRound(6, createSequenceRandom([0.91, 0.14, 0.62, 0.27, 0.48, 0.73]));

  assert.equal(round.pairs.length, 6);
  assert.equal(round.letterCards.length, 6);
  assert.equal(round.handCards.length, 6);

  const pairIds = new Set(round.pairs.map((pair) => pair.id));
  assert.deepEqual(new Set(round.letterCards.map((card) => card.pairId)), pairIds);
  assert.deepEqual(new Set(round.handCards.map((card) => card.pairId)), pairIds);
  assert.ok(round.handCards.every((card) => card.kind === 'hand-image'));
  assert.ok(round.letterCards.every((card) => card.kind === 'letter'));
  assert.ok(round.pairs.every((pair) => /^\/asl_dataset_crops\/[A-Z]\.png$/.test(pair.imagePath)));
  assert.ok(round.handCards.every((card) => /^\/asl_dataset_crops\/[A-Z]\.png$/.test(card.imagePath)));
});
