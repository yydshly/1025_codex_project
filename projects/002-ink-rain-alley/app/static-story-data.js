import { tracks } from './story-data.js';

export const staticChapters = tracks.map(({ id, number, name }) => ({
  id,
  number,
  name,
  file: `../assets/images/v2.2/story-${number}.png`,
}));

export const staticSeasons = ['春', '夏', '秋', '冬'].map((name, index) => ({
  name,
  file: `../assets/images/v2.2/season-${index}.png`,
}));

export const staticReasons = {
  'context-unavailable': '当前浏览器未能创建 WebGL 2 动态画面，已切换为截图浏览。',
  'context-lost': '动态画面的 WebGL 上下文已中断，已切换为截图浏览。',
  'scene-init': '场景初始化未完成，已切换为截图浏览。',
  'render-error': '动态画面绘制中断，已切换为截图浏览。',
  manual: '当前为你主动选择的静态预览模式。',
};

function boundedIndex(value, count) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(count - 1, Math.max(0, Math.trunc(number))) : 0;
}

export const normalizeChapterIndex = value => boundedIndex(value, staticChapters.length);
export const normalizeSeasonIndex = value => boundedIndex(value, staticSeasons.length);

export function chapterIndexFromHash(hash = '') {
  let id;
  try { id = decodeURIComponent(String(hash).replace(/^#/, '')); }
  catch { return 0; }
  return Math.max(0, staticChapters.findIndex(chapter => chapter.id === id));
}

export function adjacentChapterIndex(index, direction) {
  return normalizeChapterIndex(normalizeChapterIndex(index) + Math.sign(Number(direction) || 0));
}

export function getStaticFrame(index, season = 0) {
  const chapter = staticChapters[normalizeChapterIndex(index)];
  const selectedSeason = chapter.id === 'seasons' ? staticSeasons[normalizeSeasonIndex(season)] : null;
  const label = `${chapter.number} · ${chapter.name}${selectedSeason ? ` · ${selectedSeason.name}` : ''}`;
  return {
    ...chapter,
    label,
    file: selectedSeason ? selectedSeason.file : chapter.file,
    alt: `本项目真实运行截图：${label}。截图中的旧控件不可操作。`,
  };
}

export function retryDynamicUrl(href) {
  const url = new URL(href);
  url.searchParams.delete('preview');
  return url.href;
}

export function normalizeStaticReason(reason) {
  return Object.hasOwn(staticReasons, reason) ? reason : 'render-error';
}
