#!/usr/bin/env node
// Local, dependency-free integrity checks. Does not generate, upload, decode, or modify media.
import { readFile, readdir, stat, open, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appDir = path.join(projectDir, 'app');
const failures = [];
const checkedFiles = new Map();
const imageFiles = new Set();
const expectedConceptIds = [
  'coastal-scroll', 'inner-sea', 'reflection-first', 'seed-islands',
  'pedal-city', 'miniature-bay', 'seasonal-gate',
];
const requiredMediaIds = [
  'static-720', 'static-1080', 'motion-native', 'motion-paced',
  'shot-a', 'shot-b', 'complete-ride',
  'coastal-scroll-kling4-v1', 'coastal-scroll-seedance2-v1',
];
const optionalMediaIds = ['coastal-scroll-kling4-b-v1', 'coastal-scroll-splice-v1'];
const motionTrialMediaIds = ['coastal-scroll-kling4-v1', 'coastal-scroll-seedance2-v1', 'coastal-scroll-splice-v1'];
let archivedVideoCount = 0;
let conceptsWithMotionTrial = 0;
let spliceTrackVerified = false;
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.avif', '.gif', '.ico']);

function fail(label, message) {
  // Labels are fixed field names or project-relative filenames, never matched secret values.
  failures.push(`${label}: ${message}`);
}

function assert(condition, label, message) {
  if (!condition) fail(label, message);
  return Boolean(condition);
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function relativeLabel(filename) {
  return path.relative(projectDir, filename).split(path.sep).join('/');
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function cleanPath(value) {
  return decodeURIComponent(value.split(/[?#]/, 1)[0]);
}

function isExternal(value) {
  return /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//');
}

async function localFile(value, baseDir, label, { allowExternal = false } = {}) {
  if (!nonempty(value)) {
    fail(label, 'expected a non-empty relative resource path');
    return null;
  }
  if (value.startsWith('#')) return null;
  if (isExternal(value)) {
    if (!allowExternal) fail(label, 'resource must be local and relative');
    return null;
  }
  if (value.startsWith('/') || value.startsWith('\\') || value.includes('\\')) {
    fail(label, 'use a relative URL with forward slashes');
    return null;
  }
  let filename;
  try {
    filename = path.resolve(baseDir, cleanPath(value));
  } catch {
    fail(label, 'invalid URL encoding');
    return null;
  }
  if (!inside(projectDir, filename)) {
    fail(label, 'resource escapes this project');
    return null;
  }
  if (checkedFiles.has(filename)) return checkedFiles.get(filename);
  try {
    const details = await stat(filename);
    const resolved = await realpath(filename);
    if (!details.isFile() || details.size === 0 || !inside(projectDir, resolved)) {
      fail(label, 'resource must be a non-empty file inside this project');
      checkedFiles.set(filename, null);
      return null;
    }
    checkedFiles.set(filename, filename);
    if (imageExtensions.has(path.extname(filename).toLowerCase())) imageFiles.add(filename);
    return filename;
  } catch {
    fail(label, 'referenced local file is missing or unreadable');
    checkedFiles.set(filename, null);
    return null;
  }
}

async function loadData(name) {
  const filename = path.join(appDir, 'data', `${name}.js`);
  try {
    return await import(pathToFileURL(filename).href);
  } catch (error) {
    // Do not echo source text or potentially sensitive exception messages.
    fail(`app/data/${name}.js`, `cannot import module (${error instanceof SyntaxError ? 'syntax error' : 'missing file or import failure'})`);
    return {};
  }
}

function uniqueIds(items, expected, label) {
  if (!assert(Array.isArray(items), label, 'must be an array')) return false;
  const ids = items.map(item => item?.id);
  assert(items.length === expected.length, label, `must contain exactly ${expected.length} records`);
  assert(new Set(ids).size === ids.length, label, 'record IDs must be unique');
  assert(expected.every(id => ids.includes(id)), label, 'required ID set is incomplete or incorrect');
  return true;
}

function checkBeats(beats, label) {
  if (!assert(Array.isArray(beats) && beats.length > 0, label, 'requires timed action beats')) return;
  let end = 0;
  for (let index = 0; index < beats.length; index += 1) {
    const beat = beats[index] ?? {};
    const itemLabel = `${label}[${index}]`;
    for (const field of ['time', 'action', 'camera', 'environment']) {
      assert(nonempty(beat[field]), `${itemLabel}.${field}`, 'must be non-empty');
    }
    const match = String(beat.time ?? '').match(/^\s*(\d+(?:\.\d+)?)\s*[–—−~～-]\s*(\d+(?:\.\d+)?)\s*(?:秒|s)?\s*$/u);
    if (!match) {
      fail(`${itemLabel}.time`, 'use a numeric time range such as 0–2秒');
      continue;
    }
    const start = Number(match[1]);
    const nextEnd = Number(match[2]);
    assert(Math.abs(start - end) < 1e-6, `${itemLabel}.time`, 'target beats must start at 0 and remain contiguous without overlap');
    assert(nextEnd > start && nextEnd <= 10, `${itemLabel}.time`, 'target interval must advance within 0–10 seconds');
    end = nextEnd;
  }
  assert(Math.abs(end - 10) < 1e-6, label, 'target sequence must end at 10 seconds');
}

function checkRights(record, label) {
  const notes = [record?.licenseStatus, record?.licenseNote, record?.license, record?.rights].filter(nonempty);
  assert(notes.length > 0, label, 'requires an explicit third-party rights or unknown-license note');
  for (const note of notes) {
    // A negative statement such as “未声明 CC 授权” is allowed.
    const denied = /未(?:声明|授予|获得|获准)|不(?:代表|等于|构成)|未知|无.*授权|not\s+(?:licensed|granted)|unknown/i.test(note);
    const positiveCC = /^(?:CC(?:0|[-\s]?BY)|Creative Commons)/i.test(note.trim()) || /采用\s*CC|授权(?:为|采用)\s*CC/i.test(note);
    assert(!positiveCC || denied, label, 'the original reference must not be assigned a CC license without evidence');
  }
}

function checkSourceBoundary(sourceModules) {
  const entries = sourceModules.flatMap((module, index) => ['sourceInfo', 'sourceReference']
    .filter(key => module[key] && typeof module[key] === 'object')
    .map(key => ({ source: module[key], label: `${index === 0 ? 'research' : 'media'}.${key}` })));
  assert(entries.length > 0, 'source reference', 'export sourceInfo or sourceReference');
  const mainUrl = 'https://x.com/hi_personality/status/2115567493565825244';
  assert(entries.some(({ source }) => source.url === mainUrl), 'source reference', 'must retain the verified original-post attribution');
  const explicitlyExcluded = entries.some(({ source }) =>
    source.usedAsGenerationInput === false || source.generationInput === false ||
    /仅供.*(?:人工)?分析|没有.*作为.*(?:视频)?输入|未.*作为.*(?:视频)?输入|not.*generation.*input/i.test(source.referenceRole ?? source.inputRole ?? ''));
  assert(explicitlyExcluded, 'source reference', 'must explicitly distinguish analyzed original video from generation inputs');
  for (const { source, label } of entries) {
    assert(source.usedAsGenerationInput !== true && source.generationInput !== true, label, 'must not claim the original video was submitted as this run’s generation input');
    if (source.license || source.licenseNote || source.licenseStatus || source.rights) checkRights(source, label);
  }
  assert(entries.some(({ source }) => source.licenseNote || source.licenseStatus || source.license || source.rights), 'source reference', 'requires a rights boundary for the original work');
}

async function checkImageFile(filename) {
  const extension = path.extname(filename).toLowerCase();
  const handle = await open(filename, 'r');
  const header = Buffer.alloc(32);
  let bytesRead;
  try { ({ bytesRead } = await handle.read(header, 0, header.length, 0)); } finally { await handle.close(); }
  const signatures = {
    '.webp': bytesRead >= 12 && header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP',
    '.png': bytesRead >= 8 && header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    '.jpg': bytesRead >= 3 && header[0] === 255 && header[1] === 216 && header[2] === 255,
    '.jpeg': bytesRead >= 3 && header[0] === 255 && header[1] === 216 && header[2] === 255,
  };
  if (extension in signatures) assert(signatures[extension], relativeLabel(filename), 'image bytes do not match the declared format');
}

async function checkFtyp(filename) {
  const handle = await open(filename, 'r');
  const header = Buffer.alloc(64);
  try {
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    assert(bytesRead >= 16 && header.toString('ascii', 4, 8) === 'ftyp', relativeLabel(filename), 'video must have an MP4 ftyp header');
  } finally { await handle.close(); }
}

// Minimal ISO BMFF reader: verifies the final video track without FFmpeg or decoding.
function boxes(buffer, start = 0, end = buffer.length) {
  const result = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) throw new Error('invalid extended box');
      size = Number(buffer.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) size = end - offset;
    if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) throw new Error('invalid box bounds');
    result.push({ type, start: offset, data: offset + headerSize, end: offset + size });
    offset += size;
  }
  return result;
}

function childBox(buffer, parent, type) {
  const found = boxes(buffer, parent.data, parent.end).find(box => box.type === type);
  if (!found) throw new Error('required container box missing');
  return found;
}

async function readVideoMetadata(filename) {
  const buffer = await readFile(filename);
  const moov = boxes(buffer).find(box => box.type === 'moov');
  if (!moov) throw new Error('movie box missing');
  for (const track of boxes(buffer, moov.data, moov.end).filter(box => box.type === 'trak')) {
    const mdia = childBox(buffer, track, 'mdia');
    const hdlr = childBox(buffer, mdia, 'hdlr');
    if (buffer.toString('ascii', hdlr.data + 8, hdlr.data + 12) !== 'vide') continue;
    const tkhd = childBox(buffer, track, 'tkhd');
    const mdhd = childBox(buffer, mdia, 'mdhd');
    const version = buffer[mdhd.data];
    if (version !== 0 && version !== 1) throw new Error('unsupported media-header version');
    const timescale = buffer.readUInt32BE(mdhd.data + (version === 1 ? 20 : 12));
    const durationTicks = version === 1 ? Number(buffer.readBigUInt64BE(mdhd.data + 24)) : buffer.readUInt32BE(mdhd.data + 16);
    const stbl = childBox(buffer, childBox(buffer, mdia, 'minf'), 'stbl');
    const stts = childBox(buffer, stbl, 'stts');
    const entryCount = buffer.readUInt32BE(stts.data + 4);
    if (stts.data + 8 + entryCount * 8 > stts.end || timescale <= 0) throw new Error('invalid video timing');
    let frames = 0;
    let sampleTicks = 0;
    let constantDelta = null;
    let constantFrameRate = true;
    for (let i = 0; i < entryCount; i += 1) {
      const count = buffer.readUInt32BE(stts.data + 8 + i * 8);
      const delta = buffer.readUInt32BE(stts.data + 12 + i * 8);
      frames += count;
      sampleTicks += count * delta;
      if (constantDelta === null) constantDelta = delta;
      else if (constantDelta !== delta) constantFrameRate = false;
    }
    if (sampleTicks <= 0) throw new Error('empty video timing');
    return {
      width: buffer.readUInt32BE(tkhd.end - 8) / 65536,
      height: buffer.readUInt32BE(tkhd.end - 4) / 65536,
      duration: durationTicks / timescale,
      sampleDuration: sampleTicks / timescale,
      fps: frames * timescale / sampleTicks,
      frames,
      constantFrameRate,
    };
  }
  throw new Error('video track missing');
}

async function filesBelow(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesBelow(filename));
    else if (entry.isFile()) result.push(filename);
    else if (entry.isSymbolicLink()) fail(relativeLabel(filename), 'public app tree must not contain unchecked links');
  }
  return result;
}

function scanSensitiveText(text, label) {
  assert(!/[DE]:(?:\/|\\)/i.test(text), label, 'public code must not contain a local D: or E: filesystem path');
  const sensitivePatterns = [
    /(?:["']?\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|token|secret|password)["']?\s*[:=]\s*["'][^"'\r\n]+["'])/i,
    /\bBearer\s+[A-Za-z\d._~+\/-]{8,}/i,
    /[?&](?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|authorization)=[^&#\s"']+/i,
    /\b(?:sk-[A-Za-z\d_-]{16,}|gh[pousr]_[A-Za-z\d]{20,}|AIza[A-Za-z\d_-]{25,})\b/,
    /\beyJ[A-Za-z\d_-]{12,}\.[A-Za-z\d_-]{12,}\.[A-Za-z\d_-]{8,}\b/,
  ];
  assert(!sensitivePatterns.some(pattern => pattern.test(text)), label, 'possible embedded credential detected; value intentionally omitted');
}

async function scanStaticResources(filename, text) {
  const label = relativeLabel(filename);
  const extension = path.extname(filename);
  if (extension === '.html') {
    for (const tag of text.matchAll(/<([a-z][a-z\d-]*)\b[^>]*>/gi)) {
      const element = tag[1].toLowerCase();
      for (const attribute of tag[0].matchAll(/\b(src|href|poster)\s*=\s*(["'])(.*?)\2/gi)) {
        const value = attribute[3].trim();
        if (!value || value.startsWith('#')) continue;
        const externalAnchor = element === 'a' && attribute[1].toLowerCase() === 'href';
        await localFile(value, path.dirname(filename), `${label} ${element}.${attribute[1]}`, { allowExternal: externalAnchor });
      }
    }
  }
  if (extension === '.css' || extension === '.html') {
    for (const match of text.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
      const value = match[2].trim();
      if (value.startsWith('data:') || value.startsWith('#')) continue;
      await localFile(value, path.dirname(filename), `${label} url()`);
    }
    for (const match of text.matchAll(/@import\s+(["'])(.*?)\1/gi)) {
      await localFile(match[2], path.dirname(filename), `${label} @import`);
    }
  }
  if (extension === '.js' || extension === '.mjs' || extension === '.html') {
    const modulePaths = new Set();
    const importPatterns = [
      /\b(?:import|export)\s+(?:(?:[^;\n]*?)\s+from\s*)?["']([^"']+)["']/g,
      /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
      /\bnew\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g,
    ];
    for (const expression of importPatterns) {
      for (const match of text.matchAll(expression)) {
        modulePaths.add(match[1]);
        await localFile(match[1], path.dirname(filename), `${label} module resource`);
      }
    }
    // Browser data paths are relative to the app document, not to app/data/*.js.
    const assetLiteral = /(["'`])((?:\.{1,2}\/|assets\/|data\/)[^"'`\r\n]+?\.(?:html|css|js|mjs|json|mp4|webm|png|jpe?g|webp|svg|avif|gif|ico|woff2?|ttf)(?:[?#][^"'`\r\n]*)?)\1/g;
    for (const match of text.matchAll(assetLiteral)) {
      if (modulePaths.has(match[2]) || match[2].includes('${')) continue;
      await localFile(match[2], appDir, `${label} static resource`);
    }
    scanSensitiveText(text, label);
  }
}

async function main() {
  const [conceptModule, researchModule, mediaModule] = await Promise.all(['concepts', 'research', 'media'].map(loadData));
  const { concepts } = conceptModule;
  const { media, keyframes, references, conceptVisuals } = mediaModule;
  const presentMediaIds = new Set(Array.isArray(media) ? media.map(item => item?.id) : []);
  const expectedMediaIds = [...requiredMediaIds, ...optionalMediaIds.filter(id => presentMediaIds.has(id))];
  archivedVideoCount = Array.isArray(media) ? media.length : 0;
  const conceptPaths = new Map();
  if (uniqueIds(concepts, expectedConceptIds, 'concepts')) {
    for (const concept of concepts) {
      const label = `concepts.${expectedConceptIds.includes(concept?.id) ? concept.id : 'unknown'}`;
      for (const field of ['title', 'subtitle', 'tone', 'difficulty', 'premise', 'viewerReward', 'worldRule', 'firstFrame', 'imagePrompt', 'identity', 'route', 'camera', 'videoPrompt', 'nextTest']) {
        assert(nonempty(concept?.[field]), `${label}.${field}`, 'must be non-empty');
      }
      assert(['旅程', '空间', '荒诞', '尺度', '时间'].includes(concept.category), `${label}.category`, 'unsupported category');
      const trial = concept.motionTrial;
      const hasTrial = trial !== undefined && trial !== null;
      if (hasTrial) {
        assert(concept.id === 'coastal-scroll', `${label}.motionTrial`, 'only coastal-scroll may link an archived motion trial');
        assert(typeof trial === 'object' && !Array.isArray(trial) && nonempty(trial.label), `${label}.motionTrial`, 'requires a motion-trial object with a non-empty label');
        assert(motionTrialMediaIds.includes(trial?.mediaId) && presentMediaIds.has(trial.mediaId), `${label}.motionTrial.mediaId`, 'must reference an allowed motion trial present in the archived media catalog');
        const multiClip = trial?.multiClip === true;
        assert(trial?.multiClip === undefined || typeof trial.multiClip === 'boolean', `${label}.motionTrial.multiClip`, 'must be a boolean when provided');
        assert(multiClip === (trial?.mediaId === 'coastal-scroll-splice-v1'), `${label}.motionTrial.multiClip`, 'only the multi-clip splice may and must be marked multiClip');
        assert(concept.status === (multiClip ? '已有多段拼接试片·完整方案待验证' : '已有5秒短样·完整方案待验证'), `${label}.status`, 'a motion trial or editorial splice must not mark the complete design as verified');
        assert(concept.imageCaption === '扩展概念图 · 已用于运动短样', `${label}.imageCaption`, 'must distinguish the concept visual used in a short trial from a fully verified sequence');
        conceptsWithMotionTrial += 1;
      } else {
        assert(concept.status === '基础设计·视频未验证', `${label}.status`, 'concepts without a linked motion trial must remain explicitly unverified');
        assert(concept.imageCaption === '扩展概念图 · 视频待验证', `${label}.imageCaption`, 'concept art without a linked trial must retain its unverified label');
      }
      assert(/设计判断/.test(concept.difficulty), `${label}.difficulty`, 'difficulty must be marked as a design judgment');
      for (const field of ['acceptance', 'risks']) {
        assert(Array.isArray(concept[field]) && concept[field].length >= 2 && concept[field].every(nonempty), `${label}.${field}`, 'requires at least two concrete entries');
      }
      for (const field of ['light', 'color', 'sound', 'emotion']) assert(nonempty(concept.atmosphere?.[field]), `${label}.atmosphere.${field}`, 'must be non-empty');
      checkBeats(concept.actionBeats, `${label}.actionBeats`);
      const expectedImage = `assets/images/concepts/${concept.id}.webp`;
      assert(String(concept.image ?? '').replace(/^\.\//, '') === expectedImage, `${label}.image`, 'requires its own dedicated concept image path');
      const filename = await localFile(concept.image, appDir, `${label}.image`);
      if (filename) conceptPaths.set(concept.id, filename);
    }
  }

  const mediaPaths = new Map();
  if (uniqueIds(media, expectedMediaIds, 'media')) {
    assert(new Set(media.map(item => item.src)).size === expectedMediaIds.length, 'media.src', 'each required or present optional video must have a distinct source file');
    for (const item of media) {
      const label = `media.${expectedMediaIds.includes(item?.id) ? item.id : 'unknown'}`;
      for (const field of ['src', 'poster', 'actualInputRole', 'observation', 'limit', 'caption']) assert(nonempty(item[field]), `${label}.${field}`, 'must be non-empty');
      assert(item.cost === null || (typeof item.cost === 'number' && Number.isFinite(item.cost) && item.cost >= 0), `${label}.cost`, 'actual cost must be a verified number or null');
      for (const field of ['duration', 'width', 'height', 'fps']) assert(Number.isFinite(item[field]) && item[field] > 0, `${label}.${field}`, 'must be positive numeric metadata');
      const filename = await localFile(item.src, appDir, `${label}.src`);
      if (filename) {
        mediaPaths.set(item.id, filename);
        await checkFtyp(filename);
      }
      await localFile(item.poster, appDir, `${label}.poster`);
    }
    const byId = new Map(media.map(item => [item.id, item]));
    for (const [id, taskId, cost] of [['shot-a', '1044472', 75], ['shot-b', '1044477', null], ['static-1080', '1044280', 150]]) {
      const item = byId.get(id);
      assert(item && String(item.taskId) === taskId && item.cost === cost, `media.${id}.cost`, 'task ID and verified actual-cost boundary must match the research record');
    }
    for (const id of ['static-720', 'motion-native', 'motion-paced', 'complete-ride']) {
      assert(byId.get(id)?.cost === null, `media.${id}.cost`, 'unverified or derivative cost must stay null; do not substitute estimates or double-count sources');
    }
    const final = byId.get('complete-ride');
    assert(final?.width === 1280 && final?.height === 720 && final?.fps === 24 && Math.abs((final?.duration ?? 0) - 8.375) < 1e-6, 'media.complete-ride', 'declared final metadata must be 8.375s / 1280×720 / 24fps');
    const finalPath = mediaPaths.get('complete-ride');
    if (finalPath) {
      try {
        const actual = await readVideoMetadata(finalPath);
        assert(actual.width === 1280 && actual.height === 720 && actual.frames === 201 && actual.constantFrameRate && Math.abs(actual.fps - 24) < 1e-6 && Math.abs(actual.duration - 8.375) < 0.001 && Math.abs(actual.sampleDuration - 8.375) < 0.001, 'complete-ride MP4 track', 'container must confirm 201 frames, 8.375s, 1280×720 and constant 24fps');
      } catch {
        fail('complete-ride MP4 track', 'cannot read or verify standard MP4 video-track metadata');
      }
    }
    const continuation = byId.get('coastal-scroll-kling4-b-v1');
    if (continuation) assert(continuation.kind === 'ai-original', 'media.coastal-scroll-kling4-b-v1.kind', 'the generated continuation must remain an AI original');
    const splice = byId.get('coastal-scroll-splice-v1');
    if (splice) {
      const label = 'media.coastal-scroll-splice-v1';
      const first = byId.get('coastal-scroll-kling4-v1');
      assert(first?.kind === 'ai-original' && continuation?.kind === 'ai-original' && mediaPaths.has(first?.id) && mediaPaths.has(continuation?.id), label, 'both the Kling A and B originals must be archived in the media catalog');
      assert(splice.kind === 'editorial-derivative' && splice.cost === null, label, 'the splice must be an editorial derivative with null cost, without double-counting source charges');
      const sourceTasks = Array.isArray(splice.sourceTaskIds) ? splice.sourceTaskIds.map(String) : [];
      const originalTasks = [first?.taskId, continuation?.taskId];
      assert(sourceTasks.length === 2 && new Set(sourceTasks).size === 2 && new Set(originalTasks.map(String)).size === 2 && originalTasks.every(id => id !== null && id !== undefined && nonempty(String(id)) && sourceTasks.includes(String(id))), `${label}.sourceTaskIds`, 'requires the two distinct task IDs of the archived A and B originals');
      assert(splice.width === 1280 && splice.height === 720 && splice.fps === 24 && Number.isFinite(splice.duration) && splice.duration >= 10, label, 'declared splice metadata must be at least 10s / 1280×720 / 24fps');
      assert(Number.isFinite(splice.seamTime) && splice.seamTime > 0 && splice.seamTime < splice.duration, `${label}.seamTime`, 'the actual seam must lie strictly inside the video');
      const seamImage = await localFile(splice.seamImage, appDir, `${label}.seamImage`);
      if (seamImage) assert(/\.jpe?g$/i.test(seamImage), `${label}.seamImage`, 'the seam analysis image must be a local JPEG');
      const seamPreview = await localFile(splice.seamPreview, appDir, `${label}.seamPreview`);
      if (seamPreview) {
        assert(path.extname(seamPreview).toLowerCase() === '.mp4', `${label}.seamPreview`, 'the editorial seam excerpt must be a local MP4');
        await checkFtyp(seamPreview);
      }
      const splicePath = mediaPaths.get(splice.id);
      if (splicePath) {
        try {
          const actual = await readVideoMetadata(splicePath);
          spliceTrackVerified = assert(actual.width === 1280 && actual.height === 720 && actual.constantFrameRate && Math.abs(actual.fps - 24) < 1e-6 && actual.duration >= 10 && actual.sampleDuration >= 10 && Math.abs(actual.duration - splice.duration) < 0.001 && Math.abs(actual.sampleDuration - splice.duration) < 0.001, 'coastal-scroll-splice-v1 MP4 track', 'container must confirm at least 10s / 1280×720 / constant 24fps and match declared duration');
          assert(Number.isFinite(splice.seamTime) && splice.seamTime > 0 && splice.seamTime < actual.duration, `${label}.seamTime`, 'the seam must also lie inside the actual MP4 video track');
        } catch {
          fail('coastal-scroll-splice-v1 MP4 track', 'cannot read or verify standard MP4 video-track metadata');
        }
      }
    }
  }

  if (uniqueIds(keyframes, ['start', 'apex', 'end'], 'keyframes')) {
    for (const item of keyframes) await localFile(item.src, appDir, `keyframes.${item.id}.src`);
  }
  assert(Array.isArray(references) && references.length > 0, 'references', 'requires attributed reference images');
  if (Array.isArray(references)) {
    for (let index = 0; index < references.length; index += 1) {
      const item = references[index];
      await localFile(item?.src, appDir, `references[${index}].src`);
      assert(nonempty(item?.author) && /^https:\/\/x\.com\//.test(item?.sourceUrl ?? ''), `references[${index}]`, 'requires author attribution and original-source URL');
      checkRights(item, `references[${index}]`);
    }
  }
  checkSourceBoundary([researchModule, mediaModule]);

  // The manifest records provenance; hashes additionally reject byte-identical frame substitutions.
  // Neither check can certify image content or detect every re-encoded visual copy: human review remains necessary.
  if (uniqueIds(conceptVisuals, expectedConceptIds, 'conceptVisuals')) {
    for (const visual of conceptVisuals) {
      const label = `conceptVisuals.${expectedConceptIds.includes(visual?.id) ? visual.id : 'unknown'}`;
      const filename = await localFile(visual.src ?? visual.image, appDir, `${label}.src`);
      assert(filename && filename === conceptPaths.get(visual.id), label, 'visual manifest must point to the corresponding concept image');
      const provenance = JSON.stringify({ kind: visual.kind, origin: visual.origin, method: visual.method, provenance: visual.provenance, generator: visual.generator, tool: visual.tool });
      assert(/ai[-_ ]?generated|generated[-_ ]?concept|imagegen|AI.?生成|图像生成/i.test(provenance), label, 'requires explicit generated-concept provenance rather than a borrowed frame');
    }
  }

  const publicFiles = await filesBelow(appDir);
  assert(publicFiles.includes(path.join(appDir, 'index.html')), 'app/index.html', 'app entry must exist');
  for (const filename of publicFiles.filter(name => /\.(?:html|css|m?js)$/i.test(name))) {
    await scanStaticResources(filename, await readFile(filename, 'utf8'));
  }
  for (const filename of imageFiles) await checkImageFile(filename);
  const knownFrameHashes = new Set();
  const conceptFileSet = new Set(conceptPaths.values());
  for (const filename of imageFiles) {
    if (!conceptFileSet.has(filename)) knownFrameHashes.add(createHash('sha256').update(await readFile(filename)).digest('hex'));
  }
  const conceptHashes = new Set();
  for (const [id, filename] of conceptPaths) {
    const digest = createHash('sha256').update(await readFile(filename)).digest('hex');
    assert(!knownFrameHashes.has(digest), `concepts.${id}.image`, 'concept artwork must not be a byte-identical reference, keyframe or poster');
    assert(!conceptHashes.has(digest), `concepts.${id}.image`, 'each concept needs its own visual, not a shared placeholder');
    conceptHashes.add(digest);
  }
}

try {
  await main();
} catch {
  fail('check runner', 'unexpected filesystem or parsing failure; sensitive exception details omitted');
}

if (failures.length) {
  console.error(`FAIL: ${failures.length} local project check(s).`);
  for (const message of [...new Set(failures)]) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: 7 concept designs (${conceptsWithMotionTrial} with linked motion trials; full 10s sequences unverified); continuous 0–10s target beats; ${archivedVideoCount} archived videos; images and static resources present.`);
  console.log('PASS: earlier ridge-jump edit MP4 track is 201 frames / 8.375s / 1280×720 / 24fps; verified costs, attribution and input boundaries retained.');
  if (spliceTrackVerified) console.log('PASS: coastal-scroll multi-clip splice is at least 10s / 1280×720 / 24fps, with both source tasks and local seam evidence; full artistic acceptance remains unverified.');
  console.log('PASS: public code scan and concept provenance/hash checks completed; no generation, network or file changes performed.');
  console.log('Scope: automated checks do not replace visual provenance review, browser interaction QA, full motion inspection or listening to audio.');
}
