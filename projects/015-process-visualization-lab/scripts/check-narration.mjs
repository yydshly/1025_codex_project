import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { tours } from '../app/narration-script.js';
import { dynamicEvents } from '../app/dynamic-events.js';
import { mechanismAudioTours } from '../app/case-lessons.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(path.join(root, 'app/narration-script.js'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'app/assets/narration/manifest.json'), 'utf8'));
assert.equal(manifest.provider, 'MiniMax', '当前清单必须是完整 MiniMax 旁白，不能沿用旧语音或部分生成结果');
assert.equal(manifest.locale, 'zh-CN');
assert.equal(manifest.format, 'wav');
assert.equal(manifest.sampleRate, 32000);
assert.equal(manifest.channels, 1);
assert.equal(typeof manifest.model, 'string'); assert(manifest.model.trim());
assert.equal(typeof manifest.voice, 'string'); assert(manifest.voice.trim());
assert.equal(manifest.scriptSha256, sha256(source), '讲解源文件已变化，须重新确认或生成相应旁白');
assert(manifest.clips && typeof manifest.clips === 'object' && !Array.isArray(manifest.clips));

const listClips = entries => Object.entries(entries).flatMap(([tour, entry]) =>
  entry.steps.map((step, index) => ({ id: `${tour}-${index}`, tour, text: step.text })));
const legacy = listClips(tours);
const eventTours = Object.fromEntries(Object.values(dynamicEvents)
  .filter(event => event.tour?.captionsOnly === false).map(event => [event.id, event.tour]));
const registered = listClips({...eventTours, ...mechanismAudioTours});
assert.equal(legacy.length, 41, '基础讲解包含三段汤加海底地形讲解');
if (registered.length) assert.equal(manifest.registeredTourSha256, sha256(JSON.stringify(registered)), '扩展事件讲解文字与 MiniMax 清单不一致');
const expected = [...legacy, ...registered];
assert.deepEqual(Object.keys(manifest.clips).sort(), expected.map(item => item.id).sort(), '音频与讲解章节必须一一对应，不能缺段或多出旧段');

// Read RIFF chunks rather than assuming every WAVE file has a 44-byte header.
function inspectWave(bytes, id) {
  const require = (condition, message) => assert(condition, `${id}: ${message}`);
  require(bytes.length >= 44, 'WAVE 文件过短');
  require(bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WAVE', '不是 RIFF/WAVE 字节');
  require(bytes.readUInt32LE(4) + 8 === bytes.length, 'RIFF 声明长度与实际文件不一致');
  let offset = 12, format = null, data = null;
  while (offset < bytes.length) {
    require(offset + 8 <= bytes.length, '音频块头不完整');
    const kind = bytes.toString('ascii', offset, offset + 4), length = bytes.readUInt32LE(offset + 4), start = offset + 8;
    require(start + length <= bytes.length, `${kind} 块超出文件边界`);
    if (kind === 'fmt ') {
      require(format === null && length >= 16, 'PCM 格式块缺失或重复');
      format = { codec: bytes.readUInt16LE(start), channels: bytes.readUInt16LE(start + 2), sampleRate: bytes.readUInt32LE(start + 4), byteRate: bytes.readUInt32LE(start + 8), blockAlign: bytes.readUInt16LE(start + 12), bits: bytes.readUInt16LE(start + 14) };
    } else if (kind === 'data') {
      require(data === null && length > 0, 'PCM 数据块为空或重复');
      data = { start, length };
    }
    offset = start + length + (length % 2);
    require(offset <= bytes.length, '奇数字节音频块缺少对齐字节');
  }
  require(format !== null && data !== null, '缺少 fmt 或 data 块');
  require(format.codec === 1 && format.bits === 16 && format.channels === 1 && format.sampleRate === 32000, '必须为 32 kHz 单声道 16-bit 整数 PCM');
  require(format.blockAlign === format.channels * format.bits / 8, 'PCM 样本对齐不一致');
  require(format.byteRate === format.sampleRate * format.blockAlign, 'PCM 字节率与采样率不一致');
  require(data.length % format.blockAlign === 0, 'PCM 存在不完整样本');
  const samples = data.length / format.blockAlign, seconds = samples / format.sampleRate;
  require(seconds >= 1, '旁白音频不足一秒');
  let minimum = Infinity, maximum = -Infinity, sum = 0, squares = 0;
  for (let at = data.start; at < data.start + data.length; at += 2) {
    const value = bytes.readInt16LE(at);
    minimum = Math.min(minimum, value); maximum = Math.max(maximum, value); sum += value; squares += value * value;
  }
  const mean = sum / samples, rms = Math.sqrt(Math.max(0, squares / samples - mean * mean));
  require(maximum - minimum >= 512 && rms >= 32, 'PCM 为空、恒定值或近乎静音，不能作为有效旁白');
  return { ...format, seconds, samples, minimum, maximum, rms };
}

const base = fs.realpathSync(path.join(root, 'app/assets/narration/minimax'));
const usedPaths = new Set(), usedHashes = new Set();
let totalBytes = 0, totalSeconds = 0, minimumRms = Infinity;
for (const item of expected) {
  const clip = manifest.clips[item.id];
  assert(clip && typeof clip === 'object', `${item.id}: 缺少音频条目`);
  assert.equal(clip.text, item.text, `${item.id}: 音频提交文本与当前讲解不完全一致`);
  assert.match(clip.url, /^assets\/narration\/minimax\/[A-Za-z0-9][A-Za-z0-9._-]*\.wav$/, `${item.id}: 只能引用本地 MiniMax WAV`);
  assert.match(clip.sha256, /^[a-f0-9]{64}$/, `${item.id}: 缺少有效 SHA-256`);
  assert(Number.isInteger(clip.bytes) && clip.bytes > 44, `${item.id}: 缺少实际字节数`);
  assert(Number.isFinite(clip.durationSeconds) && clip.durationSeconds > 0, `${item.id}: 缺少实际时长`);
  const filename = fs.realpathSync(path.join(root, 'app', clip.url));
  assert(path.dirname(filename) === base, `${item.id}: 文件必须位于 MiniMax 资源目录，不能经链接引用其他来源`);
  assert(!usedPaths.has(filename), `${item.id}: 不同章节不能重复引用同一音频文件`); usedPaths.add(filename);
  const bytes = fs.readFileSync(filename), hash = sha256(bytes), audio = inspectWave(bytes, item.id);
  assert.equal(bytes.length, clip.bytes, `${item.id}: 文件字节数不一致`);
  assert.equal(hash, clip.sha256, `${item.id}: 音频 SHA-256 不一致`);
  if(clip.playback){
    assert.equal(clip.playback.url,clip.url.replace(/\.wav$/,'.mp3'),`${item.id}: 播放版本须和原旁白对应`);
    const playback=fs.readFileSync(path.join(root,'app',clip.playback.url));
    assert.equal(playback.length,clip.playback.bytes,`${item.id}: 压缩音频字节数不一致`);
    assert.equal(sha256(playback),clip.playback.sha256,`${item.id}: 压缩音频 SHA-256 不一致`);
  }
  assert(!usedHashes.has(hash), `${item.id}: 不同章节不能用相同音频字节充数`); usedHashes.add(hash);
  assert(Math.abs(clip.durationSeconds - audio.seconds) <= 0.001, `${item.id}: 声明时长与 PCM 样本数不一致`);
  for (const field of ['sampleRate', 'channels', 'bits']) if (clip[field] !== undefined) assert.equal(clip[field], audio[field], `${item.id}: ${field} 与 WAV 头不一致`);
  totalBytes += bytes.length; totalSeconds += audio.seconds; minimumRms = Math.min(minimumRms, audio.rms);
}
console.log(`通过：${expected.length} 段 MiniMax 旁白与当前章节文本逐字对应，WAV 格式、非静音、时长、字节数与 SHA-256 已核验。`);
console.log(JSON.stringify({ provider: manifest.provider, model: manifest.model, voice: manifest.voice, clips: expected.length, uniqueAudioFiles: usedPaths.size, totalDurationSeconds: Number(totalSeconds.toFixed(3)), totalBytes, minimumCenteredRms: Number(minimumRms.toFixed(3)), scriptSha256: manifest.scriptSha256, registeredTourSha256: manifest.registeredTourSha256 }));
