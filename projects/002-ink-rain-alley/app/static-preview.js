import './static-preview.css';
import story00 from '../assets/images/v2.2/story-00.png';
import story01 from '../assets/images/v2.2/story-01.png';
import story02 from '../assets/images/v2.2/story-02.png';
import story03 from '../assets/images/v2.2/story-03.png';
import story04 from '../assets/images/v2.2/story-04.png';
import story05 from '../assets/images/v2.2/story-05.png';
import story06 from '../assets/images/v2.2/story-06.png';
import story07 from '../assets/images/v2.2/story-07.png';
import story08 from '../assets/images/v2.2/story-08.png';
import story09 from '../assets/images/v2.2/story-09.png';
import season0 from '../assets/images/v2.2/season-0.png';
import season1 from '../assets/images/v2.2/season-1.png';
import season2 from '../assets/images/v2.2/season-2.png';
import season3 from '../assets/images/v2.2/season-3.png';
import {
  staticChapters, staticSeasons, staticReasons, chapterIndexFromHash,
  adjacentChapterIndex, normalizeChapterIndex, normalizeSeasonIndex,
  getStaticFrame, retryDynamicUrl, normalizeStaticReason,
} from './static-story-data.js';

const imageUrls = new Map([
  ...[story00, story01, story02, story03, story04, story05, story06, story07, story08, story09]
    .map((url, index) => [staticChapters[index].file, url]),
  ...[season0, season1, season2, season3].map((url, index) => [staticSeasons[index].file, url]),
]);
let cleanupCurrent;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(text, label) {
  const element = node('button', '', text);
  element.type = 'button';
  if (label) element.setAttribute('aria-label', label);
  return element;
}

function diagnosticText(value) {
  if (value === undefined || value === null || value === '') return '未提供';
  return String(value instanceof Error ? value.message : value).slice(0, 4000);
}

export function startStaticPreview({ reason = 'manual', stage, message, contextMessage } = {}) {
  cleanupCurrent?.();
  const currentReason = normalizeStaticReason(reason);
  let chapterIndex = chapterIndexFromHash(location.hash);
  let seasonIndex = 0;
  const root = document.querySelector('#fallback') || node('section');
  root.id = 'fallback';
  root.className = 'static-preview';
  root.hidden = false;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-labelledby', 'static-preview-title');
  root.replaceChildren();
  if (!root.isConnected) document.body.append(root);
  document.body.classList.add('static-preview-mode');
  scrollTo({top:0,behavior:'instant'});
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());

  const header = node('header', 'static-preview-header');
  const identity = node('div');
  identity.append(node('p', 'static-preview-kicker', 'NOT YET / 真实运行截图'));
  const title = node('h1', '', '未完 · 静态章节浏览');
  title.id = 'static-preview-title';
  identity.append(title);
  const retry = node('a', 'static-preview-retry', '重试动态模式 ↗');
  retry.href = retryDynamicUrl(location.href);
  header.append(identity, retry);

  const notice = node('div', 'static-preview-notice');
  const reasonLine = node('p', 'static-preview-reason', staticReasons[currentReason]);
  reasonLine.setAttribute('role', 'status');
  notice.append(reasonLine, node('p', '', '本项目真实运行截图，非实时动画，截图内旧控件不可操作。可用下方导航继续浏览；此模式不自动翻页或播放声音。'));

  const navigation = node('nav', 'static-preview-navigation');
  navigation.setAttribute('aria-label', '静态截图章节导航');
  const previous = button('← 上一章');
  previous.id = 'static-previous';
  const selectionLabel = node('label', 'static-preview-select');
  selectionLabel.htmlFor = 'static-chapter';
  selectionLabel.append(node('span', '', '选择章节'));
  const selection = node('select');
  selection.id = 'static-chapter';
  staticChapters.forEach((chapter, index) => {
    const option = node('option', '', `${chapter.number} · ${chapter.name}`);
    option.value = String(index);
    selection.append(option);
  });
  selectionLabel.append(selection);
  const next = button('下一章 →');
  next.id = 'static-next';
  navigation.append(previous, selectionLabel, next);

  const figure = node('figure', 'static-preview-figure');
  const image = node('img');
  image.width = 1265;
  image.height = 712;
  image.decoding = 'async';
  const caption = node('figcaption');
  const captionTitle = node('span', 'static-preview-caption-title');
  captionTitle.setAttribute('aria-live', 'polite');
  const originalImage = node('a', '', '单独放大原图 ↗');
  originalImage.target = '_blank';
  originalImage.rel = 'noopener noreferrer';
  caption.append(captionTitle, originalImage);
  figure.append(image, caption);

  const seasons = node('div', 'static-preview-seasons');
  seasons.setAttribute('role', 'group');
  seasons.setAttribute('aria-label', '选择四季截图');
  seasons.append(node('span', '', '四季截图'));
  const seasonButtons = staticSeasons.map((season, index) => {
    const control = button(season.name, `查看${season.name}季运行截图`);
    control.addEventListener('click', () => { seasonIndex = normalizeSeasonIndex(index); render(); });
    seasons.append(control);
    return control;
  });

  const imageError = node('p', 'static-preview-image-error', '这张截图未能载入。可尝试其他章节，或使用“重试动态模式”。');
  imageError.hidden = true;
  imageError.setAttribute('role', 'status');
  image.addEventListener('error', () => { imageError.hidden = false; });
  image.addEventListener('load', () => { imageError.hidden = true; });

  const diagnostics = node('details', 'static-preview-diagnostics');
  diagnostics.append(node('summary', '', '查看原因与诊断'));
  diagnostics.append(node('p', '', '静态浏览不需要 WebGL。若要恢复动态，可检查浏览器的图形加速状态后重试；初始化错误也可能来自场景或渲染流程。'));
  const diagnosticList = node('dl');
  [
    ['原因类别', currentReason], ['发生阶段', stage],
    ['错误信息', message], ['WebGL 上下文信息', contextMessage],
  ].forEach(([label, value]) => diagnosticList.append(node('dt', '', label), node('dd', '', diagnosticText(value))));
  diagnostics.append(diagnosticList);
  root.append(header, notice, navigation, figure, seasons, imageError, diagnostics);

  function render() {
    const frame = getStaticFrame(chapterIndex, seasonIndex);
    const url = imageUrls.get(frame.file);
    imageError.hidden = true;
    image.src = url;
    image.alt = frame.alt;
    originalImage.href = url;
    originalImage.setAttribute('aria-label', `单独打开${frame.label}的完整截图`);
    captionTitle.textContent = `${frame.label} / 静态截图`;
    selection.value = String(chapterIndex);
    previous.disabled = chapterIndex === 0;
    next.disabled = chapterIndex === staticChapters.length - 1;
    seasons.hidden = frame.id !== 'seasons';
    seasonButtons.forEach((control, index) => control.setAttribute('aria-pressed', String(index === seasonIndex)));
    retry.href = retryDynamicUrl(location.href);
    root.dataset.chapter = frame.id;
  }

  function selectChapter(index) {
    chapterIndex = normalizeChapterIndex(index);
    const hash = `#${staticChapters[chapterIndex].id}`;
    if (location.hash !== hash) location.hash = hash;
    render();
  }

  previous.addEventListener('click', () => selectChapter(adjacentChapterIndex(chapterIndex, -1)));
  next.addEventListener('click', () => selectChapter(adjacentChapterIndex(chapterIndex, 1)));
  selection.addEventListener('change', () => selectChapter(selection.value));
  const onHashChange = () => { chapterIndex = chapterIndexFromHash(location.hash); render(); };
  addEventListener('hashchange', onHashChange);
  const cleanup = () => {
    removeEventListener('hashchange', onHashChange);
    if (cleanupCurrent === cleanup) cleanupCurrent = undefined;
  };
  cleanupCurrent = cleanup;
  render();
  return { element: root, selectChapter, destroy: cleanup };
}
