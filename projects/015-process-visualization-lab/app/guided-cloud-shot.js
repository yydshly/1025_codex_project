const RAD = Math.PI / 180;
export const GUIDED_CLOUD_CLEARANCE = .17;

// Camera windows only. Tonga windows bracket the observed cold features in
// observed-change-features.json as they expand around the volcano. Hinnamnor
// keeps the main cold band in view across the native scans around Korea.
// The Mangkhut window covers the cold bands west and south of Hong Kong on
// the archived 03:20–05:00 UTC B13 scans. No box denotes a cloud boundary.
const shots = {
  'volcano-early': { kind: 'volcano', bounds: [183.85, -21.35, 185.70, -20.03] },
  'volcano-expand': { kind: 'volcano', bounds: [181.9, -22.9, 187.3, -18.3] },
  'volcano-late': { kind: 'volcano', bounds: [181.65, -23.25, 187.15, -18.25] },
  'storm-band': { kind: 'storm', bounds: [121.2, 27, 133.8, 37.4] },
  'storm-korea': { kind: 'storm', bounds: [123.4, 29.9, 131.3, 36.5] },
  'mangkhut-band': { kind: 'mangkhut', bounds: [110, 17.8, 118.6, 25.1] },
  'mangkhut-harbor': { kind: 'mangkhut', bounds: [113.55, 21.95, 114.65, 22.72] },
  'quake-tohoku-map': { kind: 'quake', bounds: [136, 34.2, 144.6, 40.6] },
  'quake-hualien-map': { kind: 'quake', bounds: [119.5, 22.4, 123.4, 26.3] },
  'quake-matsushiro': { kind: 'quake', bounds: [136.7, 35.2, 139.7, 37.9] },
  'quake-taipei': { kind: 'quake', bounds: [120.1, 23.6, 122.9, 26.3] },
  'quake-incheon': { kind: 'quake', bounds: [125.1, 36.1, 128.1, 38.8] },
};

const mid = (a, b) => (a + b) / 2;
const normalizeLongitude = value => ((value + 180) % 360 + 360) % 360 - 180;

export function guidedCloudShot(key, kind) {
  const shot = Object.hasOwn(shots, key) ? shots[key] : null;
  if (!shot || shot.kind !== kind) return null;
  const [west, south, east, north] = shot.bounds;
  const lat = mid(south, north);
  const lon = normalizeLongitude(mid(west, east));
  const samples = [south, lat, north].flatMap(latitude =>
    [west, mid(west, east), east].map(longitude => ({ lat: latitude, lon: normalizeLongitude(longitude) }))
  );
  return { lat, lon, samples };
}

/** Radial perspective fit. The visible margins leave room for callouts and
 * viewport controls without introducing a pan/zoom on each observation. */
export function fitGuidedCloudDistance(shot, { radius, fovDegrees, aspect, zoom = 1 }) {
  const tan = Math.tan(fovDegrees * RAD / 2) / zoom;
  const halfWidth = tan * aspect * (aspect >= 2 ? .62 : .88);
  const halfHeight = tan * .68;
  const centerLat = shot.lat * RAD;
  let distance = radius + GUIDED_CLOUD_CLEARANCE;
  for (const sample of shot.samples) {
    const lat = sample.lat * RAD;
    const lon = (sample.lon - shot.lon) * RAD;
    const radial = radius * (Math.sin(lat) * Math.sin(centerLat) + Math.cos(lat) * Math.cos(centerLat) * Math.cos(lon));
    const horizontal = radius * Math.cos(lat) * Math.sin(lon);
    const vertical = radius * (Math.sin(lat) * Math.cos(centerLat) - Math.cos(lat) * Math.sin(centerLat) * Math.cos(lon));
    distance = Math.max(distance, radial + Math.max(Math.abs(horizontal) / halfWidth, Math.abs(vertical) / halfHeight));
  }
  return distance;
}
