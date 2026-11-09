import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = fs.readFileSync(path.join(root, 'publication/catalog.json'), 'utf8');
const catalog = JSON.parse(json);
const assets = new Set();

function https(value) {
  assert(typeof value === 'string' && value.trim(), 'Missing source URL');
  const url = new URL(value);
  assert(url.protocol === 'https:' && !url.username && !url.password, value);
  assert(!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), value);
}

function checkLinks(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (key === 'preview') continue;
    if (['url', 'entryUrl', 'evidenceUrl', 'sourcePost', 'original'].includes(key)) https(nested);
    else checkLinks(nested);
  }
}

const ids = Array.from({ length: 50 }, (_, i) => i + 1);
assert.deepEqual(catalog.items.map(item => item.id), ids);
assert.deepEqual(catalog.showcases.map(item => item.siteIds), [...ids.map(id => [id]), []]);
assert.equal(catalog.showcases.at(-1).id, 'post');
assert.equal(catalog.showcases.at(-1).preview.type, 'none', 'Only the original post link may be published');
assert(!/source-previews|127\.0\.0\.1|localhost|verification-post-video\.json/.test(json), 'Local-only reference in public catalog');
checkLinks(catalog);
for (const [index, source] of catalog.showcases.entries()) {
  if (index < 50) assert.equal(source.id, 'site-' + String(index + 1).padStart(2, '0'));
  for (const key of ['title', 'summary', 'borrow', 'use', 'entryLabel', 'attribution', 'verification']) {
    assert(typeof source[key] === 'string' && source[key].trim(), source.id + '.' + key);
  }
  https(source.entryUrl);
  const { type, url } = source.preview;
  if (type === 'none') {
    assert.equal(url, '');
    assert(!source.rights, 'Unexpected media rights for ' + source.id);
    continue;
  }
  const extension = type === 'video' ? /\.mp4$/ : /\.(jpg|webp)$/;
  assert(['image', 'video'].includes(type) && /^assets\/[a-z0-9-]+\.(jpg|webp|mp4)$/.test(url) && extension.test(url), url);
  assert(source.rights?.label?.trim() && /^[0-9a-f]{64}$/.test(source.rights.sha256), 'Missing rights record: ' + source.id);
  https(source.rights.original);
  https(source.rights.url);
  const file = path.join(root, 'publication', url);
  assert(fs.lstatSync(file).isFile(), url);
  const bytes = fs.readFileSync(file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.rights.sha256, url);
  assets.add(url);
}
assert.equal(catalog.shortlist.items.length, 5);
assert.equal(catalog.directions.length, 10);

if (!process.argv.includes('--check')) {
  const output = path.join(root, 'dist/site');
  assert(!fs.existsSync(output), 'Build 014 in a fresh output directory');
  fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
  for (const name of ['index.html', 'styles.css', 'app.js']) {
    fs.copyFileSync(path.join(root, 'app', name), path.join(output, name));
  }
  for (const name of assets) fs.copyFileSync(path.join(root, 'publication', name), path.join(output, name));
  fs.writeFileSync(path.join(output, 'catalog.json'), json);
  fs.writeFileSync(path.join(output, 'catalog-data.js'), 'window.PRODUCT_REFERENCE_LIBRARY = ' + json.replaceAll('<', '\\u003c') + ';\n');
}
console.log('014 公开目录：50 站、原帖入口及 ' + assets.size + ' 项已核对来源的媒体。');
