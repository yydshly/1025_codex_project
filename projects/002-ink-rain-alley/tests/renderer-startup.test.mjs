import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  createStoryRenderer, drawingPixelRatio, WebGLUnavailableError,
} from '../app/renderer-startup.js';
import { tracks, totalUnits, locate, seasons } from '../app/story-data.js';

const conservativeOptions = {
  alpha: false,
  antialias: false,
  powerPreference: 'default',
  failIfMajorPerformanceCaveat: false,
};

for (const mode of ['null', 'throw', 'lost']) {
  test(`a single ${mode} context attempt cannot construct the renderer`, () => {
    const requests = [];
    let constructions = 0;
    const canvas = {
      getContext(type, options) {
        requests.push({ type, options });
        if (mode === 'throw') throw new Error('Context creation disabled');
        return mode === 'lost' ? { isContextLost: () => true } : null;
      },
    };
    class Renderer { constructor() { constructions++; } }

    assert.throws(() => createStoryRenderer(canvas, Renderer), error => {
      assert.ok(error instanceof WebGLUnavailableError);
      if (mode === 'throw') assert.equal(error.message, 'Context creation disabled');
      return true;
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].type, 'webgl2');
    assert.deepEqual(requests[0].options, conservativeOptions);
    assert.equal(constructions, 0);
  });
}

test('successful startup passes the same context to the renderer with conservative options', () => {
  const context = { isContextLost: () => false };
  let requests = 0;
  let receivedOptions;
  const canvas = {
    getContext(type, options) {
      requests++;
      assert.equal(type, 'webgl2');
      assert.deepEqual(options, conservativeOptions);
      return context;
    },
  };
  class Renderer { constructor(options) { receivedOptions = options; } }

  assert.ok(createStoryRenderer(canvas, Renderer) instanceof Renderer);
  assert.equal(requests, 1);
  assert.equal(receivedOptions.canvas, canvas);
  assert.equal(receivedOptions.context, context);
  const { canvas: ignoredCanvas, context: ignoredContext, ...options } = receivedOptions;
  assert.deepEqual(options, conservativeOptions);
});

test('renderer construction failures retain their original error identity and type', () => {
  const failure = new TypeError('Renderer initialization failed after context creation');
  let requests = 0;
  const canvas = { getContext() { requests++; return { isContextLost: () => false }; } };
  class Renderer { constructor() { throw failure; } }

  assert.throws(() => createStoryRenderer(canvas, Renderer), error => {
    assert.equal(error, failure);
    assert.ok(error instanceof TypeError);
    assert.equal(error instanceof WebGLUnavailableError, false);
    return true;
  });
  assert.equal(requests, 1);
});

const bufferCases = [
  { name: 'ordinary desktop', width: 1280, height: 720, dpr: 1, expected: 1 },
  { name: 'full HD desktop', width: 1920, height: 1080, dpr: 1, expected: 1600 / 1920 },
  { name: 'high DPR tablet', width: 800, height: 600, dpr: 3, expected: 1.5 },
  { name: 'high DPR portrait phone', width: 390, height: 844, dpr: 3, expected: 1100 / 844 },
  { name: 'ultrawide desktop', width: 3440, height: 1440, dpr: 2, expected: 1600 / 3440 },
  { name: 'very tall viewport', width: 800, height: 2000, dpr: 2, expected: 1100 / 2000 },
  { name: 'low DPR viewport', width: 1280, height: 720, dpr: .75, expected: .75 },
  { name: 'zero DPR fallback', width: 1000, height: 700, dpr: 0, expected: 1 },
];

for (const { name, width, height, dpr, expected } of bufferCases) {
  test(`backbuffer keeps one uniform bounded scale for ${name}`, () => {
    const ratio = drawingPixelRatio(width, height, dpr);
    const bufferWidth = width * ratio;
    const bufferHeight = height * ratio;
    assert.ok(Math.abs(ratio - expected) < 1e-12);
    assert.ok(ratio > 0 && ratio <= 1.5);
    assert.ok(ratio <= (dpr || 1));
    assert.ok(bufferWidth <= 1600 + 1e-9);
    assert.ok(bufferHeight <= 1100 + 1e-9);
    assert.ok(Math.abs(bufferWidth / bufferHeight - width / height) < 1e-12);
  });
}

// Exercise the real entry-point control flow. Remove only its ESM import lines;
// renderer-startup and chapter data above are the actual imported modules.
const mainSource = readFileSync(new URL('../app/main.js', import.meta.url), 'utf8')
  .replace(/^import[^\r\n]*(?:\r?\n|$)/gm, '');

function runMain({ search = '?inspect=1', hash = '#lotus' } = {}) {
  const contextRequests = [];
  const registrations = [];
  const controllers = [];
  const previews = [];
  const suspensions = [];
  const historyWrites = [];
  const loggedErrors = [];
  let rendererConstructions = 0;

  class ElementStub extends EventTarget {
    constructor(tagName) {
      super();
      this.tagName = tagName;
      this.style = {};
      this.dataset = {};
      this.children = [];
      this.attributes = new Map();
    }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    append(...children) { this.children.push(...children); }
  }
  const canvas = new ElementStub('canvas');
  canvas.addEventListener = (type, handler, options) => {
    registrations.push({ type, signal: options?.signal });
    EventTarget.prototype.addEventListener.call(canvas, type, handler, options);
  };
  canvas.getContext = (type, options) => {
    contextRequests.push({ type, options });
    const failure = new Event('webglcontextcreationerror');
    Object.defineProperty(failure, 'statusMessage', { value: 'GL_VENDOR: Disabled; GL_RENDERER: Disabled' });
    canvas.dispatchEvent(failure);
    return null;
  };
  const elements = new Map([
    ['#world', canvas], ['#story-shell', new ElementStub('div')],
    ['#timeline', new ElementStub('main')], ['#chapter-rail', new ElementStub('nav')],
    ['#tracklist', new ElementStub('div')],
  ]);
  const document = {
    hidden: false,
    querySelector(selector) {
      assert.ok(elements.has(selector), `unexpected DOM access after failed startup: ${selector}`);
      return elements.get(selector);
    },
    createElement: tagName => new ElementStub(tagName),
  };
  const location = new URL(`https://example.test/005/original/${search}${hash}`);
  const history = {
    scrollRestoration: 'auto',
    replaceState(...args) { historyWrites.push(args); },
  };
  const sandbox = {
    document, location, history, URLSearchParams,
    performance: { now: () => 0 },
    matchMedia: () => ({ matches: false }),
    AbortController: class extends AbortController {
      constructor() { super(); controllers.push(this); }
    },
    THREE: {
      MathUtils: { clamp: (value, min, max) => Math.max(min, Math.min(max, value)) },
      WebGLRenderer: class {
        constructor() { rendererConstructions++; throw new Error('Renderer must not be constructed'); }
      },
    },
    createSoundscape: () => ({ suspend: value => suspensions.push(value) }),
    startStaticPreview: options => previews.push(options),
    createStoryRenderer, drawingPixelRatio, WebGLUnavailableError,
    tracks, totalUnits, locate, seasons,
    console: { error: (...args) => loggedErrors.push(args), warn: (...args) => loggedErrors.push(args) },
  };
  vm.runInNewContext(mainSource, sandbox, { filename: 'app/main.js', timeout: 1000 });
  return {
    contextRequests, registrations, controllers, previews, suspensions,
    historyWrites, loggedErrors, rendererConstructions, elements, location, history,
  };
}

test('real boot with unavailable WebGL preserves the chapter and aborts runtime listeners and sound', () => {
  const result = runMain();
  assert.equal(result.contextRequests.length, 1);
  assert.equal(result.contextRequests[0].type, 'webgl2');
  assert.equal(result.rendererConstructions, 0);
  assert.equal(result.previews.length, 1);
  assert.equal(result.previews[0].reason, 'context-unavailable');
  assert.equal(result.previews[0].stage, 'context-create');
  assert.match(result.previews[0].message, /^WebGLUnavailableError:/);
  assert.equal(result.previews[0].contextMessage, 'GL_VENDOR: Disabled; GL_RENDERER: Disabled');
  assert.equal(result.location.hash, '#lotus');
  assert.equal(result.location.search, '?inspect=1');
  assert.equal(result.historyWrites.length, 0);
  assert.equal(result.history.scrollRestoration, 'manual');
  assert.deepEqual(result.suspensions, [true]);
  assert.equal(result.controllers.length, 1);
  assert.equal(result.controllers[0].signal.aborted, true);
  assert.ok(result.registrations.length > 0);
  assert.ok(result.registrations.every(({ signal }) => signal === result.controllers[0].signal && signal.aborted));
  assert.equal(result.elements.get('#timeline').children.length, tracks.length);
  assert.equal(result.elements.get('#chapter-rail').children.length, tracks.length);
});

test('manual static preview bypasses getContext entirely and preserves its initial chapter', () => {
  const result = runMain({ search: '?preview=static&inspect=1', hash: '#enso' });
  assert.equal(result.contextRequests.length, 0);
  assert.equal(result.rendererConstructions, 0);
  assert.equal(result.previews.length, 1);
  assert.equal(result.previews[0].reason, 'manual');
  assert.equal(result.previews[0].stage, 'manual');
  assert.equal(result.location.hash, '#enso');
  assert.equal(result.historyWrites.length, 0);
  assert.deepEqual(result.suspensions, [true]);
  assert.equal(result.controllers[0].signal.aborted, true);
  assert.equal(result.elements.get('#timeline').children.length, 0);
  assert.equal(result.loggedErrors.length, 0);
});
