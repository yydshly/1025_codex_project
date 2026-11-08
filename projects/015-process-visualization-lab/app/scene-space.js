import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';

// The NASA Earth is a cube-sphere UV atlas. Keep its original geometry and UVs;
// applying the extracted 4:3 atlas to a latitude/longitude sphere is incorrect.
const EARTH_RADIUS = 1.55;
const MOON_RADIUS = 0.36;
const ORBIT_RADIUS = 3.4;
const TAU = Math.PI * 2;
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, value));

function orbitPosition(angle, radius, inclination, target = new THREE.Vector3()) {
  return target.set(
    radius * Math.cos(angle),
    radius * Math.sin(angle) * Math.cos(inclination),
    radius * Math.sin(angle) * Math.sin(inclination),
  );
}

function line(points, color, opacity = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}

function atmosphereMaterial(sunDirection) {
  return new THREE.ShaderMaterial({
    uniforms: {
      sunDirection: { value: sunDirection },
      color: { value: new THREE.Color('#438dd5') },
    },
    vertexShader: `
      varying vec3 worldNormal;
      varying vec3 worldPosition;
      void main() {
        vec4 p = modelMatrix * vec4(position, 1.0);
        worldPosition = p.xyz;
        worldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * p;
      }
    `,
    fragmentShader: `
      uniform vec3 sunDirection;
      uniform vec3 color;
      varying vec3 worldNormal;
      varying vec3 worldPosition;
      void main() {
        vec3 n = normalize(worldNormal);
        vec3 v = normalize(cameraPosition - worldPosition);
        float rim = pow(1.0 - abs(dot(n, v)), 3.1);
        float daylight = 0.22 + 0.78 * smoothstep(-0.28, 0.55, dot(n, sunDirection));
        gl_FragColor = vec4(color * (1.0 + rim * 0.6), rim * daylight * 0.62);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      resolve(texture);
    }, undefined, error => reject(new Error(`无法加载月面纹理：${url}`, { cause: error })));
  });
}

function prepareEarth(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) throw new Error('NASA Earth模型没有可见网格。');
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const diameter = Math.max(size.x, size.y, size.z);
  if (!(diameter > 0)) throw new Error('NASA Earth模型尺寸无效。');

  // A neutral wrapper applies uniform size and centering, leaving node transforms,
  // original UVs, texture orientation and normal-map coordinates intact.
  const wrapper = new THREE.Group();
  root.position.sub(center);
  wrapper.add(root);
  wrapper.scale.setScalar(EARTH_RADIUS * 2 / diameter);
  root.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      if (material.map) {
        material.map.colorSpace = THREE.SRGBColorSpace;
        material.map.anisotropy = 8;
      }
      if (material.normalMap) {
        material.normalMap.colorSpace = THREE.NoColorSpace;
        material.normalMap.anisotropy = 8;
        material.normalScale?.set(0.4, 0.4);
      }
      material.roughness = 0.93;
      material.metalness = 0.025;
      material.envMapIntensity = 0.06;
      material.needsUpdate = true;
    }
  });
  return wrapper;
}

export function createOrbital() {
  const group = new THREE.Group();
  group.name = 'NASA Earth–Moon teaching geometry';
  group.userData.modelScope = '天体尺寸、轨道距离分别缩放；展示几何照明与相对潮汐作用，不计算日月食。';

  // Model convention: orbit lies in the XY plane before inclination, +Z north.
  // Both lighting and the Earth-view phase camera use this same convention.
  const sunDirection = new THREE.Vector3(1, 0, 0);
  const sunlight = new THREE.DirectionalLight('#fff1dc', 3.2);
  sunlight.position.set(12, 0, 0);
  sunlight.target.position.set(0, 0, 0);
  // Exaggerated Earth/Moon sizes would create fictitious eclipses if shadows were
  // enabled. Phase illumination is shown without those artificial occultations.
  sunlight.castShadow = false;
  group.add(sunlight, sunlight.target);

  const earthTilt = new THREE.Group();
  earthTilt.rotation.y = THREE.MathUtils.degToRad(23.44);
  group.add(earthTilt);
  const earthSpin = new THREE.Group();
  earthTilt.add(earthSpin);
  const earthOrientation = new THREE.Group();
  // glTF is Y-up; rotate the north pole to model +Z before axial tilt/spin.
  earthOrientation.rotation.x = Math.PI / 2;
  earthSpin.add(earthOrientation);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.035, 128, 80),
    atmosphereMaterial(sunDirection),
  );
  atmosphere.renderOrder = 4;
  group.add(atmosphere);

  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 112, 80);
  const moonMaterial = new THREE.MeshStandardMaterial({ color: '#d6d4cb', roughness: 1, metalness: 0, envMapIntensity: 0 });
  const moonBody = new THREE.Mesh(moonGeometry, moonMaterial);
  moonBody.rotation.x = Math.PI / 2;
  const moonLock = new THREE.Group();
  moonLock.add(moonBody);
  const moonPosition = new THREE.Group();
  moonPosition.add(moonLock);
  group.add(moonPosition);

  const orbitGeometry = new THREE.BufferGeometry();
  const orbit = new THREE.LineLoop(orbitGeometry, new THREE.LineBasicMaterial({ color: '#739aab', transparent: true, opacity: 0.44, depthWrite: false }));
  group.add(orbit);
  const tickGeometry = new THREE.BufferGeometry();
  const ticks = new THREE.LineSegments(tickGeometry, new THREE.LineBasicMaterial({ color: '#527485', transparent: true, opacity: 0.5 }));
  group.add(ticks);

  const trailPositions = new Float32Array(49 * 3);
  const trailColors = new Float32Array(49 * 3);
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
  for (let i = 0; i < 49; i++) {
    const color = new THREE.Color('#88e4de').multiplyScalar(0.15 + i / 49 * 0.85);
    trailColors.set([color.r, color.g, color.b], i * 3);
  }
  trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
  const trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  trail.frustumCulled = false;
  group.add(trail);

  const tidalGroup = new THREE.Group();
  const outwardA = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(EARTH_RADIUS + 0.22, 0, 0), 0.45, '#6ae0d7', 0.12, 0.065);
  const outwardB = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-EARTH_RADIUS - 0.22, 0, 0), 0.45, '#6ae0d7', 0.12, 0.065);
  for (const arrow of [outwardA, outwardB]) {
    arrow.line.material.transparent = true;
    arrow.line.material.opacity = 0.65;
    arrow.cone.material.transparent = true;
    arrow.cone.material.opacity = 0.8;
    tidalGroup.add(arrow);
  }
  group.add(tidalGroup);

  const sunlightArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(3.9, 0, 0.8), 0.85, '#e9ca91', 0.12, 0.08);
  sunlightArrow.line.material.transparent = true;
  sunlightArrow.line.material.opacity = 0.55;
  group.add(sunlightArrow);
  const referenceLine = line([new THREE.Vector3(-1.7, 0, 0), new THREE.Vector3(1.7, 0, 0)], '#486575', 0.25);
  group.add(referenceLine);

  const labels = [
    { text: 'NASA地球模型', position: new THREE.Vector3(-0.25, -EARTH_RADIUS - 0.48, 0.25), color: '#b6d0db' },
    { text: '月球', position: new THREE.Vector3(3.4, 0.5, 0.2), color: '#cbd7d7' },
    { text: '太阳光方向', position: new THREE.Vector3(3.5, 0.25, 1.1), color: '#d9bd88' },
  ];

  // Optional inset for the engine: this is the Moon as viewed from the Earth,
  // independent of the main exploratory camera. Its visible lit fraction agrees
  // with models.js; the main camera can legitimately show a different fraction.
  const phaseScene = new THREE.Scene();
  phaseScene.background = new THREE.Color('#07131c');
  const phaseCamera = new THREE.PerspectiveCamera(28, 1, 0.05, 20);
  phaseCamera.up.set(0, 0, 1);
  const phaseMoonLock = new THREE.Group();
  const phaseMoon = new THREE.Mesh(moonGeometry, moonMaterial);
  phaseMoon.rotation.x = Math.PI / 2;
  phaseMoonLock.add(phaseMoon);
  phaseScene.add(phaseMoonLock);
  const phaseSunlight = new THREE.DirectionalLight('#fff1dc', 3.2);
  const phaseAmbient = new THREE.AmbientLight('#7e98ae', 0.025);
  phaseScene.add(phaseSunlight, phaseSunlight.target, phaseAmbient);
  const phaseView = { scene: phaseScene, camera: phaseCamera, title: '从地球看月球', illumination: 0 };

  const earthReady = new Promise((resolve, reject) => {
    new GLTFLoader().load('./assets/earth.glb', gltf => {
      try {
        const surface = prepareEarth(gltf.scene);
        earthOrientation.add(surface);
        resolve(surface);
      } catch (error) { reject(error); }
    }, undefined, error => reject(new Error('无法加载NASA地球模型。', { cause: error })));
  });
  const moonReady = loadTexture('./assets/moon-color.jpg').then(texture => {
    moonMaterial.map = texture;
    moonMaterial.color.set('#ffffff');
    moonMaterial.needsUpdate = true;
    return texture;
  });
  const ready = Promise.all([earthReady, moonReady]);

  const position = new THREE.Vector3();
  const xAxis = new THREE.Vector3();
  const yAxis = new THREE.Vector3();
  const zAxis = new THREE.Vector3();
  const orientation = new THREE.Matrix4();
  const trailPoint = new THREE.Vector3();
  let lastRadius = NaN;
  let lastInclination = NaN;

  function update(data, progress = 0, params = {}, clock = 0) {
    const state = data?.scene || data || {};
    const angle = finite(state.angle, finite(progress) * TAU);
    const inclination = finite(state.inclination, finite(params.inclination, 5) * Math.PI / 180);
    const radius = ORBIT_RADIUS * clamp(finite(state.distance, finite(params.distance, 1)), 0.8, 1.2);
    const sunAngle = finite(state.sunAngle);
    sunDirection.set(Math.cos(sunAngle), Math.sin(sunAngle), 0).normalize();
    sunlight.position.copy(sunDirection).multiplyScalar(12);
    sunlightArrow.position.copy(sunDirection).multiplyScalar(3.9);
    sunlightArrow.position.z += 0.8;
    sunlightArrow.setDirection(sunDirection.clone().negate());
    labels[2].position.copy(sunDirection).multiplyScalar(3.5);
    labels[2].position.z += 1.1;

    orbitPosition(angle, radius, inclination, position);
    moonPosition.position.copy(position);
    earthSpin.rotation.z = finite(state.rotation);
    labels[1].position.copy(position).add(new THREE.Vector3(0, 0.54, 0.2));

    // Local +X on the Moon's standard longitude map points to Earth; local +Z
    // stays normal to the orbit. This expresses synchronous rotation, not a
    // texture that is fixed relative to the exploratory camera.
    xAxis.copy(position).normalize().negate();
    zAxis.set(0, -Math.sin(inclination), Math.cos(inclination));
    yAxis.crossVectors(zAxis, xAxis).normalize();
    orientation.makeBasis(xAxis, yAxis, zAxis);
    moonLock.quaternion.setFromRotationMatrix(orientation);
    phaseMoonLock.quaternion.copy(moonLock.quaternion);

    if (Math.abs(radius - lastRadius) > 1e-8 || Math.abs(inclination - lastInclination) > 1e-8) {
      const points = [];
      for (let i = 0; i < 256; i++) points.push(orbitPosition(i / 256 * TAU, radius, inclination));
      orbitGeometry.setFromPoints(points);
      orbitGeometry.computeBoundingSphere();
      const tickPositions = [];
      for (let i = 0; i < 48; i++) {
        const a = i / 48 * TAU;
        for (const r of [radius - 0.035, radius + (i % 4 === 0 ? 0.10 : 0.045)]) {
          const p = orbitPosition(a, r, inclination);
          tickPositions.push(p.x, p.y, p.z);
        }
      }
      tickGeometry.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
      tickGeometry.computeBoundingSphere();
      lastRadius = radius;
      lastInclination = inclination;
    }
    for (let i = 0; i < 49; i++) {
      orbitPosition(angle - (1 - i / 48) * 0.85, radius, inclination, trailPoint);
      trailPositions.set([trailPoint.x, trailPoint.y, trailPoint.z], i * 3);
    }
    trailGeometry.attributes.position.needsUpdate = true;

    const tideDirection = position.clone().normalize();
    tidalGroup.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tideDirection);
    const tideLength = 0.24 + 0.18 * clamp(finite(state.tideIndex, 1) / 2.5);
    outwardA.setLength(tideLength, 0.10, 0.065);
    outwardB.setLength(tideLength, 0.10, 0.065);

    phaseCamera.position.copy(tideDirection).multiplyScalar(-1.65);
    phaseCamera.lookAt(0, 0, 0);
    phaseCamera.updateMatrixWorld(true);
    phaseSunlight.position.copy(sunDirection).multiplyScalar(10);
    phaseView.illumination = clamp(finite(state.illumination));
  }

  update({ scene: { angle: 1.42, rotation: 0.25, distance: 1, inclination: 5 * Math.PI / 180, sunAngle: 0.1, illumination: 0.38, tideIndex: 0.8 } });

  return {
    group,
    // At fov 36 and a 592×380 viewport, the 3.1-unit globe spans roughly
    // 220 px. The shallower orbit angle keeps the orbital ellipse in frame.
    camera: { position: [2.6, -6.5, 3.4], target: [0, 0, 0], up: [0, 0, 1] },
    labels,
    phaseView,
    ready,
    update,
  };
}
