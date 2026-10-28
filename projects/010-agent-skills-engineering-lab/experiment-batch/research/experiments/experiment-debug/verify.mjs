import assert from 'node:assert/strict';
import { entries, buildBefore, buildAfter, search } from './diary-index.mjs';

const version = process.argv[2];
if (!['before', 'after'].includes(version)) throw new Error('Use before or after');
const build = version === 'before' ? buildBefore : buildAfter;
const today = '2026-10-28';
let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.log(`FAIL ${name}: ${error.message.replace(/\n/g, ' ')}`); }
}

const index = build(entries, today);
console.log(`version=${version}, source=${entries.map((entry) => entry.id)}, index=${index.map((entry) => entry.id)}`);
check('source still has previous-day record', () => assert.equal(entries.some((entry) => entry.id === 'old'), true));
check('search finds current-day record', () => assert.deepEqual(search(index, '纸船'), ['today']));
check('search finds previous-day record', () => assert.deepEqual(search(index, '风筝'), ['old']));
check('search returns no false hit', () => assert.deepEqual(search(index, '不存在'), []));
check('fresh index rebuild retains previous-day search', () => assert.deepEqual(search(build(entries, today), '风筝'), ['old']));
console.log(`RESULT ${5 - failures}/5 passed`);
if (failures) process.exitCode = 1;
