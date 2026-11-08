/** Distance for a perspective camera aimed at a sphere's center.
 * Fits the tangent silhouette in BOTH canvas dimensions; padding is a fraction per edge. */
export function fitSphereDistance({ radius, fovDegrees, width, height, padding = .06, zoom = 1 }) {
  if (![radius, fovDegrees, width, height, padding, zoom].every(Number.isFinite) || radius <= 0 || width <= 0 || height <= 0 || zoom <= 0 || fovDegrees <= 0 || fovDegrees >= 179 || padding < 0 || padding >= .45) {
    throw new RangeError('Sphere fit requires positive dimensions, radius and zoom, a valid FOV and padding.');
  }
  const tanVertical = Math.tan(fovDegrees * Math.PI / 360) / zoom;
  const tanLimited = Math.min(tanVertical, tanVertical * width / height) * (1 - 2 * padding);
  return radius * Math.sqrt(1 + 1 / (tanLimited * tanLimited));
}
