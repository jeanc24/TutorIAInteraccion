import assert from 'node:assert/strict';

import { getReferenceFigureConfig } from '../src/lib/referenceDisplay';

function run(name: string, check: () => void) {
  try {
    check();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run('compact practice reference keeps the same hand alignment rules as the full learn reference', () => {
  const full = getReferenceFigureConfig('full');
  const compact = getReferenceFigureConfig('compact');

  assert.equal(compact.imageClassName, full.imageClassName);
  assert.match(compact.boxClassName, /items-center/);
  assert.match(compact.boxClassName, /justify-center/);
  assert.match(compact.boxClassName, /overflow-hidden/);
});
