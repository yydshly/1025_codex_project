'use strict';
// Execute the actual project functions in a Node VM with synthetic input and memory-only storage.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.resolve(__dirname, '../../../../../008-ultraman-card-draw/app/app.js'), 'utf8');
function slice(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error(`Source boundaries not found: ${start}`);
  return source.slice(a, b);
}
const functions = slice('function validCard(card)', '\ntry {') + slice('function save(next)', '\nfunction imageMarkup');
const script = `const categories = ['奥特曼', '怪兽', '其他'];
const STORAGE_KEY = 'synthetic-only';
let cards = [{ id: 'old' }]; let storageBlocked = false;
function notify() {}
${functions}
globalThis.api = { parseBackup, save, getCards: () => cards, block: () => { storageBlocked = true; } };`;
const sandbox = { localStorage: { setItem() { throw new Error('simulated quota'); } } };
vm.runInNewContext(script, sandbox);
const { parseBackup, save, getCards, block } = sandbox.api;
const card = { id: 'a', name: '虚构角色', category: '其他', number: '', version: '', description: '虚构', image: '', example: false, extra: 'drop' };
const valid = parseBackup({ schemaVersion: 1, cards: [card] });
assert.equal(valid[0].name, '虚构角色');
assert.equal(Object.hasOwn(valid[0], 'extra'), false);
assert.throws(() => parseBackup({ schemaVersion: 1, cards: [card, card] }), /重复/);
assert.throws(() => parseBackup({ schemaVersion: 1, cards: [{ ...card, image: 'https://example.com/x.png' }] }), /格式/);
assert.throws(() => parseBackup({ schemaVersion: 2, cards: [card] }), /格式/);
assert.equal(save(valid), false);
assert.equal(getCards()[0].id, 'old');
block();
assert.equal(save(valid), false);
assert.equal(getCards()[0].id, 'old');
console.log('PASS: valid backup, duplicate ID, invalid image, schema, quota failure, blocked storage');
