import * as THREE from './vendor/three.module.js';

const DEG = Math.PI / 180;
const CACHE_LIMIT = 4; // Current plus three preloaded entries, for each texture type.
const COLS = 128;
const ROWS = 96;
const WARM_K = 285, OPAQUE_K = 240, COLD_ALPHA = 0.94, FEATHER_DEGREES = 3;
const BLUE = [0.30, 0.43, 0.56], WHITE = [0.98, 0.99, 1];
const EARLIER_EDGE = [255 / 255, 193 / 255, 119 / 255];
const NEW_COLD = [81 / 255, 230 / 255, 210 / 255];
// Display-only bump tuning. The source brightness is not interpreted as physical height.
const RELIEF_GAIN = 32, RELIEF_MAX_SLOPE = .75, RELIEF_NEAR_WEIGHT = .7;
const RELIEF_LIGHT = [-.6, .65, -.45];
const EARTH_RADIUS_KM = 6371.0088;
const clamp01 = value => Math.max(0, Math.min(1, value));
const smoothstep = (low, high, value) => { const t = clamp01((value - low) / (high - low)); return t * t * (3 - 2 * t); };

/** Approximate palette inversion, not retrieval of the separately archived radiometric data.
 * The source PNG clips 180..310 K into 255..0; sampling or quantization may give fractional bytes. */
export function brightnessTemperatureFromGray8(gray8) {
  if (!Number.isFinite(gray8)) throw new TypeError('A finite source gray value is required.');
  return 310 - 130 * clamp01(gray8 / 255);
}

/** Display-only edge attenuation in geographic degrees; never a cloud / validity mask. */
export function presentationEdgeOpacity(uv, bbox, featherDegrees = FEATHER_DEGREES) {
  const [west, south, east, north] = checkedBounds(bbox);
  if (!Array.isArray(uv) || uv.length !== 2 || !uv.every(Number.isFinite) || !Number.isFinite(featherDegrees) || featherDegrees <= 0) {
    throw new TypeError('Finite UV coordinates and a positive feather width are required.');
  }
  const [u, v] = uv;
  const edgeDegrees = Math.min(u * (east - west), (1 - u) * (east - west), v * (north - south), (1 - v) * (north - south));
  return smoothstep(0, featherDegrees, edgeDegrees);
}

function checkedFocusRegion(input) {
  if (input === null) return null;
  if (!input || ![input.lat, input.lon, input.innerKm, input.outerKm].every(Number.isFinite)) {
    throw new TypeError('A focus region requires finite lat, lon, innerKm and outerKm, or null.');
  }
  if (Math.abs(input.lat) > 90 || input.innerKm < 0 || input.outerKm <= input.innerKm || input.outerKm >= Math.PI * EARTH_RADIUS_KM) {
    throw new RangeError('Focus radii must satisfy 0 <= innerKm < outerKm < half the Earth circumference, with valid latitude.');
  }
  if (Math.cos(input.outerKm / EARTH_RADIUS_KM) >= Math.cos(input.innerKm / EARTH_RADIUS_KM)) throw new RangeError('Focus radii must be numerically distinguishable.');
  return { lat: input.lat, lon: ((input.lon + 180) % 360 + 360) % 360 - 180, innerKm: input.innerKm, outerKm: input.outerKm };
}

function geographicDirection(lat, lon) {
  const a = lat * DEG, b = lon * DEG;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)];
}

/** Display-only spherical focus. Coordinates are local to this layer's registered patch.
 * This attenuates opacity, not observations, and never identifies a physical cloud boundary. */
export function presentationFocusOpacity(uv, bbox, focusRegion = null) {
  const focus = checkedFocusRegion(focusRegion);
  if (focus === null) return 1;
  const [west, south, east, north] = checkedBounds(bbox);
  if (!Array.isArray(uv) || uv.length !== 2 || !uv.every(Number.isFinite)) throw new TypeError('Finite UV coordinates are required.');
  const point = geographicDirection(south + uv[1] * (north - south), west + uv[0] * (east - west));
  const center = geographicDirection(focus.lat, focus.lon);
  const cosine = Math.max(-1, Math.min(1, point.reduce((sum, value, i) => sum + value * center[i], 0)));
  return smoothstep(Math.cos(focus.outerKm / EARTH_RADIUS_KM), Math.cos(focus.innerKm / EARTH_RADIUS_KM), cosine);
}

/** CPU reference for the shader's encoded display RGB and opacity. Opacity has no physical meaning. */
export function cloudPresentationSample(gray8, { mode = 'fusion', sourceAlpha = 1, uv = [.5, .5], bbox = [-180, -90, 180, 90], focusRegion = null } = {}) {
  if (mode !== 'fusion' && mode !== 'raw') throw new RangeError('Cloud presentation must be fusion or raw.');
  if (!Number.isFinite(sourceAlpha)) throw new TypeError('Source alpha must be finite.');
  const kelvin = brightnessTemperatureFromGray8(gray8), gray = clamp01(gray8 / 255), alpha = clamp01(sourceAlpha);
  if (mode === 'raw') return { kelvin, encodedRgb: [gray, gray, gray], displayAlpha: alpha };
  const cold = clamp01((WARM_K - kelvin) / (WARM_K - 180));
  return {
    kelvin,
    encodedRgb: BLUE.map((value, i) => value + (WHITE[i] - value) * cold),
    displayAlpha: alpha * COLD_ALPHA * (1 - smoothstep(OPAQUE_K, WARM_K, kelvin)) * presentationEdgeOpacity(uv, bbox) * presentationFocusOpacity(uv, bbox, focusRegion),
  };
}

function directionComponents(value) {
  const result = Array.isArray(value) ? value.slice(0, 3) : [value?.x, value?.y, value?.z];
  if (result.length !== 3 || !result.every(Number.isFinite)) throw new TypeError('A finite local-Earth direction is required.');
  const length = Math.hypot(...result);
  if (length < 1e-12) throw new RangeError('A direction must be nonzero.');
  return result.map(component => component / length);
}
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const limitSlope = value => Math.max(-RELIEF_MAX_SLOPE, Math.min(RELIEF_MAX_SLOPE, value));

/** CPU reference for display normals / lighting from the SAME frame's 2px and 7px samples.
 * near/far contain east, west, north, south values in gray8, or {gray8, alpha}.
 * Missing / partially valid neighbors revert to the center. This never estimates cloud height.
 * gain multiplies linear display RGB; rim adds a small cool display tint, not measured emission.
 */
export function cloudReliefSample(gray8, { near = {}, far = {}, sourceAlpha = 1, mode = 'fusion', enabled = true, lat = 0, lon = 0, lightDirection = RELIEF_LIGHT, viewDirection = null } = {}) {
  if (mode !== 'fusion' && mode !== 'raw') throw new RangeError('Cloud presentation must be fusion or raw.');
  if (!Number.isFinite(gray8) || !Number.isFinite(sourceAlpha) || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90) throw new TypeError('Finite source and geographic values are required.');
  const a = lat * DEG, b = lon * DEG;
  const normal = [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)];
  const unshaded = { gradient: [0, 0], normal, cavity: 0, gain: 1, rim: 0, bypass: true };
  // Raw and nodata never inspect neighbors, so missing pixels cannot create artificial relief.
  if (mode === 'raw' || !enabled || sourceAlpha < .999 || brightnessTemperatureFromGray8(gray8) >= WARM_K) return unshaded;
  const center = clamp01(gray8 / 255);
  const read = value => {
    const gray = typeof value === 'number' ? value : value?.gray8;
    const alpha = typeof value === 'number' ? 1 : value?.alpha ?? 1;
    return Number.isFinite(gray) && Number.isFinite(alpha) && alpha >= .999 ? clamp01(gray / 255) : center;
  };
  const samples = stencil => ['east', 'west', 'north', 'south'].map(key => read(stencil[key]));
  const small = samples(near), broad = samples(far);
  const gx = limitSlope(RELIEF_GAIN * (RELIEF_NEAR_WEIGHT * (small[0] - small[1]) / 4 + (1 - RELIEF_NEAR_WEIGHT) * (broad[0] - broad[1]) / 14));
  const gy = limitSlope(RELIEF_GAIN * (RELIEF_NEAR_WEIGHT * (small[2] - small[3]) / 4 + (1 - RELIEF_NEAR_WEIGHT) * (broad[2] - broad[3]) / 14));
  const east = [-Math.sin(b), 0, -Math.cos(b)], north = [-Math.sin(a) * Math.cos(b), Math.cos(a), Math.sin(a) * Math.sin(b)];
  const bumped = directionComponents(normal.map((component, i) => component - gx * east[i] - gy * north[i]));
  const light = directionComponents(lightDirection), base = dot3(normal, light), lit = dot3(bumped, light);
  const cavity = Math.max(0, Math.min(.2, [...small, ...broad].reduce((sum, value) => sum + value, 0) / 8 - center));
  const gain = Math.max(.64, Math.min(1.2, .9 + .16 * Math.max(base, 0) + .9 * (lit - base) - .35 * cavity));
  const view = viewDirection == null ? null : directionComponents(viewDirection);
  const rim = view ? .055 * (1 - clamp01(dot3(bumped, view))) ** 2 * (.3 + .7 * clamp01(-dot3(light, view))) : 0;
  return { gradient: [gx, gy], normal: bumped, cavity, gain, rim, bypass: false };
}

const glslNumber = value => Number(value).toFixed(8);
const presentationShader = `
uniform float syncFusion;
uniform vec2 syncSpanDegrees;
uniform vec2 syncWestSouthDegrees;
uniform vec2 syncSourceTexel;
uniform float syncRelief;
uniform vec3 syncLightDirection;
uniform vec3 syncViewDirection;
uniform float syncHasView;
uniform float syncFocusEnabled;
uniform vec3 syncFocusCenter;
uniform vec2 syncFocusCosRadii;
uniform sampler2D syncComparisonMap;
uniform float syncComparisonVisible;
float syncFocusOpacity(vec2 uv) {
  if (syncFocusEnabled < 0.5) return 1.0;
  vec2 lonLat = radians(syncWestSouthDegrees + uv * syncSpanDegrees);
  vec3 radial = vec3(cos(lonLat.y) * cos(lonLat.x), sin(lonLat.y), -cos(lonLat.y) * sin(lonLat.x));
  float cosine = clamp(dot(radial, syncFocusCenter), -1.0, 1.0);
  return smoothstep(syncFocusCosRadii.x, syncFocusCosRadii.y, cosine);
}
vec3 syncDisplayToLinear(vec3 encoded) {
  return mix(pow((encoded + vec3(0.055)) / 1.055, vec3(2.4)), encoded / 12.92,
    vec3(lessThanEqual(encoded, vec3(0.04045))));
}
float syncNeighborGray(sampler2D sourceMap, vec2 uv, float center) {
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return center;
  vec4 samplePixel = texture2D(sourceMap, uv);
  return samplePixel.a >= 0.999 ? clamp(samplePixel.r, 0.0, 1.0) : center;
}
vec3 syncReliefLighting(sampler2D sourceMap, vec2 uv, float center, vec3 linearRgb) {
  vec2 closeStep = 2.0 * syncSourceTexel;
  vec2 broadStep = 7.0 * syncSourceTexel;
  float e2 = syncNeighborGray(sourceMap, uv + vec2(closeStep.x, 0.0), center);
  float w2 = syncNeighborGray(sourceMap, uv - vec2(closeStep.x, 0.0), center);
  float n2 = syncNeighborGray(sourceMap, uv + vec2(0.0, closeStep.y), center);
  float s2 = syncNeighborGray(sourceMap, uv - vec2(0.0, closeStep.y), center);
  float e7 = syncNeighborGray(sourceMap, uv + vec2(broadStep.x, 0.0), center);
  float w7 = syncNeighborGray(sourceMap, uv - vec2(broadStep.x, 0.0), center);
  float n7 = syncNeighborGray(sourceMap, uv + vec2(0.0, broadStep.y), center);
  float s7 = syncNeighborGray(sourceMap, uv - vec2(0.0, broadStep.y), center);
  vec2 gradient = ${glslNumber(RELIEF_GAIN)} * (${glslNumber(RELIEF_NEAR_WEIGHT)} * vec2(e2 - w2, n2 - s2) / 4.0
    + ${glslNumber(1 - RELIEF_NEAR_WEIGHT)} * vec2(e7 - w7, n7 - s7) / 14.0);
  gradient = clamp(gradient, vec2(-${glslNumber(RELIEF_MAX_SLOPE)}), vec2(${glslNumber(RELIEF_MAX_SLOPE)}));
  vec2 lonLat = radians(syncWestSouthDegrees + uv * syncSpanDegrees);
  float ca = cos(lonLat.y), sa = sin(lonLat.y), cb = cos(lonLat.x), sb = sin(lonLat.x);
  vec3 radial = vec3(ca * cb, sa, -ca * sb);
  vec3 east = vec3(-sb, 0.0, -cb), north = vec3(-sa * cb, ca, sa * sb);
  vec3 displayNormal = normalize(radial - gradient.x * east - gradient.y * north);
  float base = dot(radial, syncLightDirection), lit = dot(displayNormal, syncLightDirection);
  float cavity = clamp((e2 + w2 + n2 + s2 + e7 + w7 + n7 + s7) / 8.0 - center, 0.0, 0.2);
  float gain = clamp(0.9 + 0.16 * max(base, 0.0) + 0.9 * (lit - base) - 0.35 * cavity, 0.64, 1.2);
  float facing = clamp(dot(displayNormal, syncViewDirection), 0.0, 1.0);
  float rim = syncHasView * 0.055 * pow(1.0 - facing, 2.0)
    * (0.3 + 0.7 * clamp(-dot(syncLightDirection, syncViewDirection), 0.0, 1.0));
  // Broad diffuse / subtle cool rim only: no specular plastic, displacement, noise or time input.
  return linearRgb * gain + vec3(0.32, 0.49, 0.72) * rim;
}
`;
const presentationMap = `
#ifdef USE_MAP
  // NoColorSpace texture: gray is the original display byte / 255, NOT sRGB-decoded radiance.
  vec4 sourcePixel = texture2D(map, vMapUv);
  vec3 displayRgb = sourcePixel.rgb;
  float displayAlpha = sourcePixel.a;
  if (syncFusion > 0.5) {
    float kelvin = 310.0 - 130.0 * clamp(sourcePixel.r, 0.0, 1.0);
    float cold = clamp((${glslNumber(WARM_K)} - kelvin) / ${glslNumber(WARM_K - 180)}, 0.0, 1.0);
    displayRgb = mix(vec3(${BLUE.map(glslNumber).join(',')}), vec3(${WHITE.map(glslNumber).join(',')}), cold);
    vec2 edgeDegrees = min(vMapUv, vec2(1.0) - vMapUv) * syncSpanDegrees;
    float feather = smoothstep(0.0, ${glslNumber(FEATHER_DEGREES)}, min(edgeDegrees.x, edgeDegrees.y));
    displayAlpha *= ${glslNumber(COLD_ALPHA)} * (1.0 - smoothstep(${glslNumber(OPAQUE_K)}, ${glslNumber(WARM_K)}, kelvin)) * feather;
    // Optional display ROI only. Raw bypasses this entire branch, preserving the complete frame.
    displayAlpha *= syncFocusOpacity(vMapUv);
  }
  // Both modes enter Three's linear working space before its normal output color conversion.
  vec3 linearRgb = syncDisplayToLinear(displayRgb);
  if (syncFusion > 0.5 && syncRelief > 0.5 && sourcePixel.a >= 0.999 && displayAlpha > 0.01) {
    linearRgb = syncReliefLighting(map, vMapUv, clamp(sourcePixel.r, 0.0, 1.0), linearRgb);
  }
  if (syncFusion > 0.5 && syncComparisonVisible > 0.5) {
    // Exact masks from two registered source scans. Linear sampling softens display edges only.
    vec2 masks = texture2D(syncComparisonMap, vMapUv).rg;
    vec2 edgeDegrees = min(vMapUv, vec2(1.0) - vMapUv) * syncSpanDegrees;
    float visibility = sourcePixel.a * syncFocusOpacity(vMapUv)
      * smoothstep(0.0, ${glslNumber(FEATHER_DEGREES)}, min(edgeDegrees.x, edgeDegrees.y));
    float earlierEdge = 0.94 * masks.r * visibility;
    float newlyCold = 0.62 * masks.g * visibility * (1.0 - earlierEdge);
    float baseAlpha = displayAlpha * (1.0 - earlierEdge - newlyCold);
    displayAlpha = baseAlpha + earlierEdge + newlyCold;
    linearRgb = (linearRgb * baseAlpha
      + syncDisplayToLinear(vec3(${EARLIER_EDGE.map(glslNumber).join(',')})) * earlierEdge
      + syncDisplayToLinear(vec3(${NEW_COLD.map(glslNumber).join(',')})) * newlyCold) / max(displayAlpha, 0.0001);
  }
  diffuseColor *= vec4(linearRgb, displayAlpha);
#endif
`;

function checkedBounds(input) {
  if (!Array.isArray(input) || input.length !== 4 || !input.every(Number.isFinite)) {
    throw new TypeError('Cloud image bounds must be [west, south, east, north] in degrees.');
  }
  const [west, south, east, north] = input;
  if (west < -180 || east > 180 || west >= east || south < -90 || north > 90 || south >= north) {
    throw new RangeError('Cloud image bounds must be an ordered EPSG:4326 rectangle; split dateline-crossing imagery first.');
  }
  return input.slice();
}

function patchGeometry(bbox, radius) {
  const [west, south, east, north] = bbox;
  const positions = [], normals = [], uvs = [], indices = [];
  for (let row = 0; row <= ROWS; row++) {
    const v = row / ROWS;
    const lat = (north - v * (north - south)) * DEG;
    for (let column = 0; column <= COLS; column++) {
      const u = column / COLS;
      const lon = (west + u * (east - west)) * DEG;
      // Same geographic convention as latLonToVector: +X at 0E, -Z eastward.
      const x = Math.cos(lat) * Math.cos(lon);
      const y = Math.sin(lat);
      const z = -Math.cos(lat) * Math.sin(lon);
      positions.push(radius * x, radius * y, radius * z);
      normals.push(x, y, z);
      // TextureLoader's normal flipY=true: image north/top is texture v=1.
      uvs.push(u, 1 - v);
      if (row < ROWS && column < COLS) {
        const a = row * (COLS + 1) + column;
        const b = a + COLS + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Shared registered patch geometry. radius is the actual surface radius, with no added offset. */
export function createObservationPatchGeometry(bbox, radius) {
  if (!Number.isFinite(radius) || radius <= 0) throw new RangeError('A positive surface radius is required.');
  return patchGeometry(checkedBounds(bbox), radius);
}

/**
 * An already-georeferenced EPSG:4326 observation image on the existing globe.
 * It neither downloads scientific source files nor reprojects, synthesizes or animates clouds.
 * `radius` is the host globe radius; the patch surface is radius + 0.006 (2.006 by default).
 * setFrame returns true only if that request became the selected loaded frame; false means
 * failed, superseded or disposed. Invalid arguments reject after hiding the previous image.
 * clear invalidates selection while retaining the bounded cache; dispose releases everything.
 * Fusion (default) is a declared temperature-based display overlay with a 3-degree edge feather;
 * its opacity is neither observed cloud fraction nor optical depth. Raw displays the original
 * opaque grayscale PNG without feathering; both preserve source nodata alpha. No temporal blending.
 * Optional relief uses same-frame spatial gradients as display normals, never cloud height.
 * Optional focus region applies only in fusion, in registered local-Earth coordinates.
 * It hides peripheral display pixels without changing source data or any scientific statistics.
 */
export function createSyncCloudLayer(radius = 2) {
  if (!Number.isFinite(radius) || radius <= 0) throw new RangeError('A positive globe radius is required.');
  const group = new THREE.Group();
  group.name = 'synchronized-observed-cloud-imagery';
  group.visible = false;
  const material = new THREE.MeshBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 1, toneMapped: false,
    alphaTest: .01, depthTest: true, depthWrite: false, side: THREE.FrontSide,
  });
  const presentationUniforms = {
    syncFusion: { value: 1 }, syncSpanDegrees: { value: new THREE.Vector2(360, 180) },
    syncWestSouthDegrees: { value: new THREE.Vector2(-180, -90) }, syncSourceTexel: { value: new THREE.Vector2(1, 1) },
    syncRelief: { value: 1 }, syncLightDirection: { value: new THREE.Vector3(...directionComponents(RELIEF_LIGHT)) },
    syncViewDirection: { value: new THREE.Vector3(0, 0, 1) }, syncHasView: { value: 0 },
    syncFocusEnabled: { value: 0 }, syncFocusCenter: { value: new THREE.Vector3(1, 0, 0) },
    syncFocusCosRadii: { value: new THREE.Vector2(-1, 1) },
    syncComparisonMap: { value: null }, syncComparisonVisible: { value: 0 },
  };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, presentationUniforms);
    shader.fragmentShader = presentationShader + shader.fragmentShader.replace('#include <map_fragment>', presentationMap);
  };
  material.customProgramCacheKey = () => 'sync-cloud-presentation-observed-comparison';
  group.userData.presentation = 'fusion';
  group.userData.relief = true;
  group.userData.focusRegion = null;
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
  mesh.name = 'epsg4326-observation-patch';
  mesh.renderOrder = 1;
  group.add(mesh);

  const loader = new THREE.TextureLoader();
  const cache = new Map(), comparisonCache = new Map();
  const pending = new Map();
  const released = new WeakSet();
  let disposed = false;
  let requestedVisible = true;
  let requestId = 0;
  let requestedUrl = null;
  let activeUrl = null;
  let activeComparisonUrl = null, requestedComparisonUrl = null;
  let comparison = null, comparisonStatus = 'unavailable', comparisonSuppressed = false;
  let geometryKey = '';

  function release(texture) {
    if (texture && !released.has(texture)) {
      released.add(texture);
      texture.dispose();
    }
  }

  function touch(url, textures = cache) {
    const texture = textures.get(url);
    if (!texture) return null;
    textures.delete(url);
    textures.set(url, texture);
    return texture;
  }

  function trimCache() {
    for (const [textures, active, requested] of [[cache, activeUrl, requestedUrl], [comparisonCache, activeComparisonUrl, requestedComparisonUrl]]) {
      while (textures.size > CACHE_LIMIT) {
        const candidate = [...textures.keys()].find(url => url !== active && url !== requested);
        if (candidate === undefined) break;
        release(textures.get(candidate));
        textures.delete(candidate);
      }
    }
  }

  function loadTexture(url, textures = cache) {
    const cached = touch(url, textures);
    if (cached) return Promise.resolve(cached);
    if (pending.has(url)) return pending.get(url).promise;
    let settle;
    const entry = { texture: null, promise: new Promise(resolve => { settle = resolve; }) };
    pending.set(url, entry);
    const finish = texture => {
      if (pending.get(url) === entry) pending.delete(url);
      settle(texture);
    };
    try {
      entry.texture = loader.load(url, texture => {
        if (disposed) {
          release(texture);
          finish(null);
          return;
        }
        // These PNG bytes encode a numeric temperature palette, not linear radiance / sRGB color.
        // Decode only the chosen display RGB in the shader, after the temperature threshold.
        texture.colorSpace = THREE.NoColorSpace;
        texture.flipY = true;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        textures.set(url, texture);
        trimCache();
        finish(texture);
      }, undefined, () => {
        release(entry.texture);
        finish(null);
      });
    } catch {
      release(entry.texture);
      finish(null);
    }
    return entry.promise;
  }

  function hideSelection() {
    activeUrl = null;
    activeComparisonUrl = null;
    comparison = null; comparisonStatus = 'unavailable';
    presentationUniforms.syncComparisonMap.value = null;
    presentationUniforms.syncComparisonVisible.value = 0;
    group.visible = false;
    if (material.map) { material.map = null; material.needsUpdate = true; }
    delete group.userData.frame;
    delete group.userData.bbox;
  }

  async function setFrame(frame, bbox, pair = null) {
    const token = ++requestId;
    requestedUrl = null;
    requestedComparisonUrl = null;
    if (disposed) { hideSelection(); return false; }
    let bounds;
    try {
      bounds = checkedBounds(bbox);
      if (!frame || typeof frame.url !== 'string' || !frame.url.trim()) throw new TypeError('An observed frame with a non-empty URL is required.');
    } catch (error) { hideSelection(); throw error; }
    const url = frame.url;
    requestedUrl = url;
    requestedComparisonUrl = pair?.url ?? null;
    const cached = touch(url);
    const cachedMask = pair ? touch(pair.url, comparisonCache) : null;
    // Bind before the first await: a ready next frame never flashes the historical base map.
    if (cached && (!pair || cachedMask)) { bindFrame(cached, frame, bounds, pair, cachedMask); return true; }
    hideSelection();
    comparison = pair;
    comparisonStatus = 'loading';
    const [texture, mask] = await Promise.all([
      cached ?? loadTexture(url),
      cachedMask ?? (pair ? loadTexture(pair.url, comparisonCache) : null),
    ]);
    if (disposed || token !== requestId) return false;
    if (!texture || released.has(texture)) {
      requestedUrl = null;
      requestedComparisonUrl = null;
      comparisonStatus = 'failed';
      return false;
    }
    bindFrame(texture, frame, bounds, pair, mask);
    return true;
  }

  function bindFrame(texture, frame, bounds, pair, mask) {
    const nextKey = bounds.join(',');
    if (nextKey !== geometryKey) {
      const nextGeometry = patchGeometry(bounds, radius + 0.006);
      mesh.geometry.dispose();
      mesh.geometry = nextGeometry;
      geometryKey = nextKey;
    }
    presentationUniforms.syncSpanDegrees.value.set(bounds[2] - bounds[0], bounds[3] - bounds[1]);
    presentationUniforms.syncWestSouthDegrees.value.set(bounds[0], bounds[1]);
    const image = texture.image;
    const width = image?.width || frame.width || 1, height = image?.height || frame.height || 1;
    presentationUniforms.syncSourceTexel.value.set(1 / Math.max(1, width), 1 / Math.max(1, height));
    activeUrl = frame.url;
    requestedUrl = null;
    requestedComparisonUrl = null;
    const readyMask = mask && !released.has(mask) && mask.image?.width === width && mask.image?.height === height;
    activeComparisonUrl = readyMask ? pair.url : null;
    comparison = pair;
    comparisonStatus = !pair ? 'unavailable' : readyMask ? 'visible' : 'failed';
    presentationUniforms.syncComparisonMap.value = readyMask ? mask : null;
    presentationUniforms.syncComparisonVisible.value = readyMask && !comparisonSuppressed ? 1 : 0;
    touch(frame.url);
    const hadMap = Boolean(material.map);
    material.map = texture;
    if (!hadMap) material.needsUpdate = true;
    group.userData.frame = { ...frame };
    group.userData.bbox = bounds;
    group.visible = requestedVisible;
    trimCache();
  }

  function setPresentation(mode) {
    if (mode !== 'fusion' && mode !== 'raw') throw new RangeError('Cloud presentation must be fusion or raw.');
    if (disposed || group.userData.presentation === mode) return;
    group.userData.presentation = mode;
    presentationUniforms.syncFusion.value = mode === 'fusion' ? 1 : 0;
    material.transparent = mode === 'fusion';
    material.depthWrite = mode === 'raw';
    // FrontSide + depthTest retain Earth occlusion even when the overlay does not write depth.
    material.needsUpdate = true;
  }

  function setRelief(enabled) {
    if (disposed) return;
    group.userData.relief = Boolean(enabled);
    presentationUniforms.syncRelief.value = enabled ? 1 : 0;
  }

  function setComparisonSuppressed(value) {
    comparisonSuppressed = Boolean(value);
    presentationUniforms.syncComparisonVisible.value = activeComparisonUrl && !comparisonSuppressed ? 1 : 0;
  }

  function getComparison() {
    const status = !requestedVisible || comparisonSuppressed ? 'off' : group.userData.presentation === 'raw' ? 'raw' : comparisonStatus;
    return { ...comparison, status };
  }

  function setFocusRegion(input) {
    if (disposed) return;
    const focus = checkedFocusRegion(input);
    group.userData.focusRegion = focus;
    presentationUniforms.syncFocusEnabled.value = focus ? 1 : 0;
    if (focus) {
      presentationUniforms.syncFocusCenter.value.set(...geographicDirection(focus.lat, focus.lon));
      presentationUniforms.syncFocusCosRadii.value.set(Math.cos(focus.outerKm / EARTH_RADIUS_KM), Math.cos(focus.innerKm / EARTH_RADIUS_KM));
    }
  }

  function setLightDirection(direction) {
    if (disposed) return;
    presentationUniforms.syncLightDirection.value.set(...directionComponents(direction));
  }

  function setViewDirection(direction = null) {
    if (disposed) return;
    if (direction == null) { presentationUniforms.syncHasView.value = 0; return; }
    presentationUniforms.syncViewDirection.value.set(...directionComponents(direction));
    presentationUniforms.syncHasView.value = 1;
  }

  async function preload(frames, bbox, pairs = []) {
    if (disposed) return [];
    checkedBounds(bbox);
    if (!Array.isArray(frames)) throw new TypeError('Preload expects an array of future frames.');
    return Promise.all(frames.slice(0, 3).map(async (frame, index) => {
      if (!frame || typeof frame.url !== 'string' || !frame.url.trim()) return false;
      const [texture] = await Promise.all([loadTexture(frame.url), pairs[index] ? loadTexture(pairs[index].url, comparisonCache) : null]);
      return Boolean(texture);
    }));
  }

  function clear() {
    ++requestId;
    requestedUrl = null;
    requestedComparisonUrl = null;
    hideSelection();
    setFocusRegion(null);
  }

  function setVisible(value) {
    requestedVisible = Boolean(value);
    group.visible = !disposed && requestedVisible && activeUrl !== null;
  }

  function dispose() {
    if (disposed) return;
    setFocusRegion(null);
    disposed = true;
    clear();
    for (const texture of cache.values()) release(texture);
    cache.clear();
    for (const texture of comparisonCache.values()) release(texture);
    comparisonCache.clear();
    for (const entry of pending.values()) release(entry.texture);
    // A late ImageLoader callback only disposes its image; it cannot revive this layer.
    mesh.geometry.dispose();
    material.dispose();
  }

  return { group, setFrame, preload, clear, setVisible, setPresentation, setRelief, setFocusRegion, setLightDirection, setViewDirection, setComparisonSuppressed, getComparison, dispose };
}
