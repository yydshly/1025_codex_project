import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../app/vendor/three.module.js';
import { fitSphereDistance } from '../app/camera-fit.js';

test('perspective tangent silhouette fits both canvas axes with the requested border', () => {
  for (const [width, height] of [[1600, 500], [632, 455], [800, 800], [340, 660], [240, 1200]]) {
    for (const zoom of [1, 1.7]) {
      const radius = 2.12, padding = .06;
      const distance = fitSphereDistance({ radius, fovDegrees: 39, width, height, padding, zoom });
      const camera = new THREE.PerspectiveCamera(39, width / height, .04, distance * 3);
      camera.zoom = zoom; camera.position.set(0, 0, distance); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      const tangentZ = radius * radius / distance, tangentRadius = radius * Math.sqrt(1 - radius * radius / (distance * distance));
      const extents = [0, 0];
      for (let i = 0; i < 360; i++) {
        const angle = i * Math.PI / 180;
        const point = new THREE.Vector3(tangentRadius * Math.cos(angle), tangentRadius * Math.sin(angle), tangentZ).project(camera);
        extents[0] = Math.max(extents[0], Math.abs(point.x)); extents[1] = Math.max(extents[1], Math.abs(point.y));
      }
      assert.ok(extents.every(value => value <= 1 - 2 * padding + 1e-10), `${width}×${height} zoom ${zoom}`);
      assert.ok(Math.abs(Math.max(...extents) - (1 - 2 * padding)) < 1e-10, 'uses available limiting axis rather than excessive padding');
    }
  }
});

test('fit scales with sphere radius, shrinks for wider FOV, and reserves padding', () => {
  const options = { radius: 2, fovDegrees: 39, width: 500, height: 800 };
  const base = fitSphereDistance(options);
  assert.equal(fitSphereDistance({ ...options, radius: 4 }), 2 * base);
  assert.ok(fitSphereDistance({ ...options, fovDegrees: 60 }) < base);
  assert.ok(fitSphereDistance({ ...options, padding: .12 }) > base);
  assert.ok(fitSphereDistance({ ...options, width: 1000 }) < base);
});

test('invalid camera and viewport inputs cannot silently produce a clipped or NaN view', () => {
  const options = { radius: 2, fovDegrees: 39, width: 500, height: 800 };
  for (const invalid of [{ radius: 0 }, { width: 0 }, { height: NaN }, { fovDegrees: 0 }, { fovDegrees: 180 }, { zoom: 0 }, { padding: -.1 }, { padding: .5 }]) {
    assert.throws(() => fitSphereDistance({ ...options, ...invalid }), RangeError);
  }
});
