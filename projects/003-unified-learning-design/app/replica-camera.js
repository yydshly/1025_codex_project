import * as T from './vendor/three.module.js';

// Fit the actual subject into the available screen, including the persistent controls.
// The distance includes the depth of each corner, so portrait framing cannot clip it.
export function frameBounds(camera, min, max, direction, viewport, margins = {}) {
  const box = new T.Box3(new T.Vector3(...min), new T.Vector3(...max));
  const target = margins.target ? new T.Vector3(...margins.target) : box.getCenter(new T.Vector3());
  const outward = new T.Vector3(...direction).normalize();
  const right = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), outward).normalize();
  const up = new T.Vector3().crossVectors(outward, right).normalize();
  const { width, height } = viewport;
  const top = margins.top ?? 66, bottom = margins.bottom ?? 90;
  const side = margins.side ?? 30;
  const left = margins.left ?? side, rightMargin = margins.right ?? side;
  const tanY = Math.tan(T.MathUtils.degToRad(camera.fov / 2));
  const tanX = tanY * width / height;
  const usableX = Math.max(.25, 1 - (left + rightMargin) / width);
  const usableY = Math.max(.25, 1 - (top + bottom) / height);
  let distance = 0;
  const points = margins.points ?? [box.min.x,box.max.x].flatMap(x=>[box.min.y,box.max.y].flatMap(y=>[box.min.z,box.max.z].map(z=>[x,y,z])));
  for (const [x,y,z] of points) {
    const offset = new T.Vector3(x, y, z).sub(target);
    distance = Math.max(distance, offset.dot(outward) + Math.abs(offset.dot(right)) / (tanX * usableX), offset.dot(outward) + Math.abs(offset.dot(up)) / (tanY * usableY));
  }
  return { target, position: target.clone().addScaledVector(outward, distance * 1.025), offsetY: (bottom - top) / 2, offsetX:(rightMargin-left)/2 };
}

export function viewPreset(mode, chapter, camera, width, height, extra = {}) {
  const mobile = width < 650;
  const margins = { top: mobile ? 70 : 55, bottom: mobile ? (chapter > 1 && mode !== 'reading' ? 172 : 120) : (chapter > 1 && mode !== 'reading' ? 135 : 86), side: mobile ? 15 : 40, ...extra };
  let min, max, direction;
  if (mode === 'reading') {
    min = [-4.45, .18, -3.35]; max = [-.32, .6, 3.55]; direction = [0, 1, .27];
  } else if (mode === 'experiment' && chapter) {
    min = [.28, .18, -3.05]; max = [5.8, chapter === 1 ? 3.7 : 3.05, 3.65]; direction = [-.44, .88, 1.35];
    margins.target = [3.05, 1.05, .2];
    margins.points = [.28,5.8].flatMap(x=>[-3.05,3.65].map(z=>[x,.32,z])).concat([.6,5.8].flatMap(x=>[-2.7,-.5].map(z=>[x,chapter===1?3.55:3.05,z])),[[1,1.6,2.8],[5.6,1.6,2.8]]);
  } else {
    min = [-6.13, -.32, -4.13]; max = [6.13, 3.55, 4.22]; direction = [-.40, 1.02, 1.38];
    margins.target = [.1,.82,.1];
    margins.points = [-6.13,6.13].flatMap(x=>[-4.13,4.22].map(z=>[x,.38,z])).concat([[.6,3.6,-2],[5.8,3.6,-2],[5.8,2.5,-.3],[1,1.5,2.8],[5.6,1.5,2.8]]);
  }
  return frameBounds(camera, min, max, direction, { width, height }, margins);
}
