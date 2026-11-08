// The waterfront is an illustration. These display coordinates amplify the vertical
// difference between samples in metres MLLW; they are not a survey of the pier.
const faceStart = [.53, .205];
const faceEnd = [1.06, .52];
const anchor = .80;
const surfaceLight = '#a0f0e0';

const lerp = (a, b, t) => a + (b - a) * t;
const fraction = x => (x - faceStart[0]) / (faceEnd[0] - faceStart[0]);
const deckAt = x => lerp(faceStart[1], faceEnd[1], fraction(x));
const perspectiveAt = x => lerp(.29, 1, fraction(x));

function lineAt(x, level) {
  const offset = Math.max(.09, Math.min(.53, .458 - .163 * level));
  return deckAt(x) + offset * perspectiveAt(x);
}

export function harborWaterlineY(level) {
  return Number.isFinite(level) ? lineAt(anchor, level) : null;
}

function hash(seed) {
  const value = Math.sin(seed * 37.714 + 11.57) * 43758.5453;
  return value - Math.floor(value);
}

export function drawHarborWaterfront(ctx, {x = 0, y = 0, width, height, level, referenceLevel = null, timeMinutes = 0, focus = null, reflectedMoonX = null}) {
  if (width <= 0 || height <= 0) return null;
  const line = harborWaterlineY(level);
  const hasLevel = line != null;
  const depthAt = at => hasLevel ? lineAt(at, level) : 1;
  const active = focus === 'peak';
  const phase = (Number.isFinite(timeMinutes) ? timeMinutes : 0) / 14;
  const X = at => at * width;
  const Y = at => at * height;

  function trace(points) {
    ctx.beginPath();
    points.forEach(([px, py], i) => i ? ctx.lineTo(X(px), Y(py)) : ctx.moveTo(X(px), Y(py)));
  }

  function shape(points, fill) {
    trace(points);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function stroke(points, style, weight) {
    trace(points);
    ctx.strokeStyle = style;
    ctx.lineWidth = weight;
    ctx.stroke();
  }

  function gradient(x0, y0, x1, y1, stops) {
    const result = ctx.createLinearGradient(X(x0), Y(y0), X(x1), Y(y1));
    for (const [stop, color] of stops) result.addColorStop(stop, color);
    return result;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  ctx.lineCap = 'round';

  ctx.fillStyle = gradient(0, 0, 0, 1, [[0, '#375466'], [.12, '#284b5b'], [.42, '#1b4555'], [.73, '#153b49'], [1, '#0a2937']]);
  ctx.fillRect(0, 0, width, height);

  // Only the foreground scene responds to the tide. The distant geometric horizon stays fixed.
  shape([[0, 0], [.16, 0], [.19, .009], [.24, .011], [.28, .022], [.32, .02], [.39, .038], [0, .038]], '#192f3e');
  shape([[.61, .037], [.68, .022], [.78, .022], [.83, .014], [.88, .016], [.95, 0], [1, 0], [1, .038]], '#213746');
  for (let i = 0; i < 31; i++) {
    const xx = i < 15 ? .39 * hash(i + 1) : .63 + .37 * hash(i + 1);
    const size = hash(i * 11 + 3);
    ctx.fillStyle = `rgba(224,196,142,${.18 + size * .44})`;
    ctx.fillRect(X(xx), Y(.03 + size * .006), .65 + size, .6 + .4 * size);
  }
  stroke([[0, .041], [.35, .042], [.72, .042], [1, .041]], '#91bdc94a', .7);

  // Sparse reflected glints, tapered and compressed toward the horizon. Their phase is tied to
  // the committed sample time so a pause or repeat seek reproduces exactly the same view.
  for (let i = 0; i < 220; i++) {
    const distance = .045 + Math.pow(hash(i + 13), 1.34) * .955;
    const seed = hash(i * 31 + 14);
    const xx = hash(i * 13 + 11) + Math.sin(seed * 11 + phase) * .015 * distance;
    const length = (.008 + seed * .052) * (.24 + distance);
    const amplitude = (.24 + seed * .8) * distance;
    ctx.beginPath();
    ctx.moveTo(X(xx - length), Y(distance));
    ctx.quadraticCurveTo(X(xx), Y(distance) - amplitude, X(xx + length), Y(distance) + amplitude * .45);
    const strength = .037 + seed * .09;
    ctx.strokeStyle = i % 4 === 0 ? `rgba(1,19,30,${strength * 2})` : `rgba(144,220,216,${strength})`;
    ctx.lineWidth = .55 + distance * (i % 6 === 0 ? 1.2 : .43);
    ctx.stroke();
  }
  if (Number.isFinite(reflectedMoonX)) {
    for (let i = 0; i < 86; i++) {
      const distance = .047 + .84 * hash(i + 401);
      const spread = .01 + .036 * distance;
      const xx = reflectedMoonX + (hash(i * 17 + 8) - .5) * spread * 2.2;
      const length = spread * (.09 + .27 * hash(i + 178));
      const alpha = (.045 + .16 * hash(i * 3 + 17)) * (1 - .8 * distance);
      stroke([[xx - length, distance], [xx + length, distance + .001]], `rgba(213,222,255,${alpha})`, .65 + distance);
    }
  }

  // Timber and masonry form a stable visual reference. Water occludes the fixed face and piles
  // along one shared level. A missing sample removes the highlighted waterline and its readout.
  const wall = [faceStart, faceEnd, [faceEnd[0], depthAt(faceEnd[0])], [faceStart[0], depthAt(faceStart[0])]];
  const wallPaint = gradient(.65, .24, .78, .93, [[0, '#535c59'], [.32, '#424f4c'], [.71, '#2a413e'], [1, hasLevel ? '#203d3a' : '#113442']]);
  shape(wall, wallPaint);
  ctx.save();
  trace(wall);
  ctx.closePath();
  ctx.clip();
  for (let row = 1; row <= 6; row++) {
    const depth = row * .081;
    const course = at => deckAt(at) + depth * perspectiveAt(at);
    stroke([[faceStart[0], course(faceStart[0])], [faceEnd[0], course(faceEnd[0])]], '#b8b8a037', .6);
    stroke([[faceStart[0], course(faceStart[0]) + .004], [faceEnd[0], course(faceEnd[0]) + .004]], '#102a2c92', 1);
    for (let column = 0; column < 10; column++) {
      const xx = lerp(faceStart[0], faceEnd[0], (column + .16 + (row % 2) * .46) / 10);
      const finish = xx + .006 * perspectiveAt(xx);
      stroke([[xx, course(xx)], [finish, course(finish) - .077 * perspectiveAt(finish)]], '#122d2e80', .7);
    }
  }
  for (let i = 0; i < 115; i++) {
    const xx = .53 + .53 * hash(i + 300);
    const yy = deckAt(xx) + .53 * perspectiveAt(xx) * hash(i + 532);
    const unit = hash(i * 3 + 81) * perspectiveAt(xx);
    ctx.fillStyle = i % 2 ? '#bbba9a35' : '#101f2366';
    ctx.fillRect(X(xx), Y(yy), (1.2 + 2.8 * unit) * unit, .8 + unit);
  }
  if (hasLevel) {
    const wetBand = [faceStart[0], faceEnd[0]];
    shape([[wetBand[0], depthAt(wetBand[0]) - .11 * perspectiveAt(wetBand[0])],
      [wetBand[1], depthAt(wetBand[1]) - .11 * perspectiveAt(wetBand[1])],
      [wetBand[1], depthAt(wetBand[1])], [wetBand[0], depthAt(wetBand[0])]], '#102f30a2');
    for (let i = 0; i < 33; i++) {
      const xx = .54 + .49 * hash(i + 19);
      const yy = depthAt(xx) - hash(i + 72) * perspectiveAt(xx) * .075;
      const size = perspectiveAt(xx);
      stroke([[xx, yy], [xx + .009 * size, yy - .005 * size]], i % 3 ? '#76a17452' : '#203d3bba', .9 + size);
    }
  }
  // The fixed marks are part of the illustration and disappear under the water.
  const staffWidth = Math.max(.008, 3.5 / width);
  const staffTop = deckAt(anchor) + .025;
  shape([[anchor - staffWidth, staffTop], [anchor, staffTop], [anchor, .93], [anchor - staffWidth, .93]], '#0d2d32');
  for (let step = -2; step <= 8; step++) {
    const tick = lineAt(anchor, step * .25);
    stroke([[anchor - staffWidth * (step % 2 === 0 ? .93 : .56), tick], [anchor, tick]], '#b8d7c6', 1);
  }
  ctx.restore();

  const deck = [faceStart, [.68, .15], [1.07, .319], faceEnd];
  shape(deck, gradient(.57, .2, 1, .5, [[0, '#67706b'], [.43, '#505b56'], [1, '#6b6f5f']]));
  for (let i = 1; i < 11; i++) {
    const t = Math.pow(i / 11, 1.6);
    stroke([[lerp(faceStart[0], faceEnd[0], t), lerp(faceStart[1], faceEnd[1], t)],
      [lerp(.68, 1.07, t), lerp(.15, .319, t)]], '#bfbba634', .66);
  }
  stroke([faceStart, faceEnd], '#bbc0ab8c', 1.25);
  stroke([[.531, .214], [1.06, .535]], '#182e32b0', 1.3);

  // Far-to-near mooring posts, their shadows and water reflections sit on the same perspective.
  const posts = [.579, .661, .779, .934];
  for (const xx of posts) {
    const p = perspectiveAt(xx);
    const top = deckAt(xx) - .065 * p;
    const water = depthAt(xx);
    const halfWidth = .009 * p + 1.5 / width;
    if (hasLevel) {
      for (let j = 0; j < 11; j++) {
        const seed = hash(j * 10 + xx * 41);
        const xx2 = xx + Math.sin(j + phase) * .012 * p;
        const yy = water + j * .014 * p;
        stroke([[xx2 - halfWidth * (1 + seed), yy], [xx2 + halfWidth * seed, yy + .001]],
          `rgba(3,24,33,${(.43 - j * .033) * seed})`, 1.2 + p);
      }
    }
    shape([[xx - halfWidth, top + .004], [xx + halfWidth, top], [xx + halfWidth * .94, water], [xx - halfWidth, water]],
      gradient(xx - halfWidth, 0, xx + halfWidth, 0, [[0, '#243535'], [.27, '#616452'], [.7, '#3a463e'], [1, '#192e30']]));
    shape([[xx - halfWidth, top + .004], [xx - halfWidth * .55, top - .007],
      [xx + halfWidth, top], [xx + halfWidth * .74, top + .008]], '#838475');
    if (hasLevel) stroke([[xx - halfWidth, water], [xx + halfWidth, water]], '#8ed7c3ac', .8 + p);
  }

  if (hasLevel) {
    const shore = [];
    for (let i = 0; i <= 42; i++) {
      const at = lerp(faceStart[0], faceEnd[0], i / 42);
      shore.push([at, depthAt(at) + Math.sin(i * 1.9 + phase) * .0035 * perspectiveAt(at)]);
    }
    stroke(shore.map(([px, py]) => [px, py + .009]), '#071f2eaf', active ? 6 : 4.5);
    stroke(shore, active ? '#96f8dfa3' : '#7cddc889', active ? 3.8 : 2.9);
    stroke(shore, active ? surfaceLight : '#a0f0e0c9', active ? 1.4 : .9);
    for (let i = 0; i < 20; i++) {
      const at = .545 + hash(i * 9 + 80) * .46;
      const p = perspectiveAt(at);
      const next = at - (.009 + hash(i + 32) * .025) * p;
      const yy = .015 + hash(i * 2 + 51) * .068;
      stroke([[next, depthAt(next) + yy * p], [at, depthAt(at) + yy * p]], '#8fe6d344', .65 + p * .3);
    }
  }

  if (hasLevel && Number.isFinite(referenceLevel)) {
    const left = .55, right = .98;
    const referenceAt = at => lineAt(at, referenceLevel);
    if (level > referenceLevel) {
      shape([[left, depthAt(left)], [right, depthAt(right)], [right, referenceAt(right)], [left, referenceAt(left)]], '#73f5dd66');
    }
    for (let i = 0; i < 14; i++) {
      const a = lerp(left, right, i / 14), b = lerp(left, right, (i + .56) / 14);
      stroke([[a, referenceAt(a)], [b, referenceAt(b)]], '#fff0c5cc', 1.35);
    }
    if (level !== referenceLevel) {
      stroke([[left, depthAt(left)], [right, depthAt(right)]], surfaceLight, 1.8);
    }
  }

  ctx.fillStyle = gradient(0, .86, 0, 1, [[0, '#06132000'], [1, '#061320b5']]);
  ctx.fillRect(0, Y(.86), width, Y(.14));
  ctx.restore();
  return hasLevel ? {x: x + X(anchor), y: y + Y(line)} : null;
}
