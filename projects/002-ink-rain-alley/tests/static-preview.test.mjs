import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import {
  staticChapters, staticSeasons, chapterIndexFromHash, adjacentChapterIndex,
  normalizeChapterIndex, normalizeSeasonIndex, getStaticFrame,
  retryDynamicUrl, normalizeStaticReason,
} from '../app/static-story-data.js';

test('chapter hashes preserve all ten supported destinations and reject malformed hashes', () => {
  assert.equal(staticChapters.length, 10);
  staticChapters.forEach((chapter, index) => assert.equal(chapterIndexFromHash(`#${chapter.id}`), index));
  assert.equal(chapterIndexFromHash('#%6cotus'), 7);
  for (const hash of ['', '#unknown', '#lotus/other', '#%E0%A4%A']) assert.equal(chapterIndexFromHash(hash), 0);
});

test('chapter navigation stops at the first and last chapters', () => {
  assert.equal(adjacentChapterIndex(0, -1), 0);
  assert.equal(adjacentChapterIndex(9, 1), 9);
  assert.equal(adjacentChapterIndex(4, -1), 3);
  assert.equal(adjacentChapterIndex(4, 1), 5);
  assert.equal(normalizeChapterIndex('7'), 7);
  assert.equal(normalizeChapterIndex(NaN), 0);
});

test('season changes affect only the four-seasons chapter', () => {
  assert.equal(staticSeasons.length, 4);
  for (let season = 0; season < 4; season++) {
    assert.equal(getStaticFrame(5, season).file, staticSeasons[season].file);
    assert.equal(getStaticFrame(7, season).file, staticChapters[7].file);
  }
  assert.equal(normalizeSeasonIndex(-1), 0);
  assert.equal(normalizeSeasonIndex(99), 3);
  assert.equal(normalizeSeasonIndex(undefined), 0);
});

test('every frame is a real local v2.2 implementation screenshot, never reference media', () => {
  const frames = [...staticChapters, ...staticSeasons];
  for (const frame of frames) {
    assert.match(frame.file, /^\.\.\/assets\/images\/v2\.2\/(story-\d{2}|season-[0-3])\.png$/);
    assert.ok(existsSync(new URL(frame.file, new URL('../app/static-story-data.js', import.meta.url))));
  }
  assert.equal(new Set(frames.map(frame => frame.file)).size, 14);
});

test('retry removes only preview parameters and preserves other query values and chapter', () => {
  const url = new URL(retryDynamicUrl('https://example.test/005/original/?preview=static&inspect=1&name=a%20b&preview=1#lotus'));
  assert.equal(url.searchParams.has('preview'), false);
  assert.equal(url.searchParams.get('inspect'), '1');
  assert.equal(url.searchParams.get('name'), 'a b');
  assert.equal(url.hash, '#lotus');
  assert.equal(url.pathname, '/005/original/');
});

test('diagnostic categories remain distinct and unknown categories have a neutral fallback', () => {
  for (const reason of ['context-unavailable', 'context-lost', 'scene-init', 'render-error', 'manual']) {
    assert.equal(normalizeStaticReason(reason), reason);
  }
  assert.equal(normalizeStaticReason('unsupported-guess'), 'render-error');
  assert.equal(normalizeStaticReason('__proto__'), 'render-error');
});
