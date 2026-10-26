const contextOptions = Object.freeze({
  alpha: false,
  antialias: false,
  powerPreference: 'default',
  failIfMajorPerformanceCaveat: false,
});

export class WebGLUnavailableError extends Error {
  constructor(message = 'WebGL 2 context could not be created') {
    super(message);
    this.name = 'WebGLUnavailableError';
  }
}

// Ask once. Passing the successful context prevents Three.js from probing again.
export function createStoryRenderer(canvas, Renderer) {
  let context;
  try { context = canvas.getContext('webgl2', contextOptions); }
  catch (cause) { throw new WebGLUnavailableError(cause.message); }
  if (!context || context.isContextLost()) throw new WebGLUnavailableError();
  return new Renderer({ canvas, context, ...contextOptions });
}

export function drawingPixelRatio(width, height, pixelRatio = 1) {
  return Math.min(pixelRatio || 1, 1.5, 1600 / Math.max(1, width), 1100 / Math.max(1, height));
}
