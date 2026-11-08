import * as THREE from './vendor/three.module.js';

// A geographic teaching overlay. Both the cloud structure and the RMW ring
// use the same displayed arc scale; cloud shape is not weather observation.
export const TYPHOON_DISPLAY_SCALE = 8;
const EARTH_KM = 6371;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

function spherePoint(x, y, radius, height = 0) {
  const distance = Math.hypot(x, y);
  if (distance < 1e-9) return new THREE.Vector3(0, 0, height);
  const angle = distance / radius;
  const scale = Math.sin(angle) * (radius + height) / distance;
  return new THREE.Vector3(x * scale, y * scale, Math.cos(angle) * (radius + height) - radius);
}

function curvedCloudCap(radius, extent, height) {
  const geometry = new THREE.PlaneGeometry(extent * 2, extent * 2, 144, 144);
  const positions = geometry.attributes.position;
  const field = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    field[i * 2] = x; field[i * 2 + 1] = y;
    const p = spherePoint(x, y, radius, height);
    positions.setXYZ(i, p.x, p.y, p.z);
  }
  geometry.setAttribute('field', new THREE.BufferAttribute(field, 2));
  geometry.computeVertexNormals();
  return geometry;
}

const noise = `
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
float fbm(vec2 p) {
  float f=0.; mat2 turn=mat2(.8,-.6,.6,.8);
  f+=.5*noise(p);p=turn*p*2.03+13.4;
  f+=.25*noise(p);p=turn*p*2.01+9.2;
  f+=.125*noise(p);p=turn*p*2.04+4.7;
  f+=.0625*noise(p);p=turn*p*2.01+19.6;
  f+=.03125*noise(p);return f;
}
float angleDistance(float a) { return atan(sin(a),cos(a)); }
mat2 rotate(float a) { float c=cos(a),s=sin(a); return mat2(c,s,-s,c); }
`;

function cloudMaterial(layer, shadow = false) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: true, side: THREE.DoubleSide,
    uniforms: {
      uRmw: { value: .25 }, uPhase: { value: 0 },
      uIntensity: { value: .7 }, uLayer: { value: layer }, uShadow: { value: shadow ? 1 : 0 },
    },
    vertexShader: `attribute vec2 field;varying vec2 vField;
      void main(){vField=field;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      varying vec2 vField;uniform float uRmw,uPhase,uIntensity,uLayer,uShadow;
      ${noise}
      void main(){
        vec2 p=vField/max(.001,uRmw);
        // A small projected shadow separates the raised cloud canopy from
        // the ocean. Its offset is illustrative, not a sun ephemeris.
        if(uShadow>.5)p+=vec2(.055,-.075);
        float radius=length(p);
        if(radius>4.1)discard;
        // Northern-hemisphere counter-clockwise advection. The broad cloud
        // canopy turns coherently with no wall-clock input.
        // Keep the broad spiral coherent. Applying a phase-dependent radial
        // rotation to the whole density field winds it into false rings.
        // Small cloud billows below advect independently within this pattern.
        vec2 q=rotate(-uPhase*.55)*p;
        q+=vec2(uLayer*.011,-uLayer*.009);
        float theta=atan(q.y,q.x);
        vec2 warp=vec2(fbm(q*1.55+vec2(2.4,7.1)),fbm(q*1.55+vec2(8.7,3.6)))-.5;
        vec2 billow=q+warp*.24;
        vec2 cellUv=billow*5.4+vec2(0.,uPhase*.055);
        float broad=fbm(cellUv);
        float fine=fbm(billow*22.-uPhase*.025);
        float shapeNoise=fbm(q*1.6+4.1);
        float azimuth=theta+.13*sin(theta*3.+.7)+.25*(shapeNoise-.5);
        // The eye is a small clear aperture within a dense central overcast.
        // A ragged edge and unequal cloud height prevent a geometric torus.
        // A gently elliptical eye with only sub-pixel irregularity. Periodic
        // azimuth modulation here creates a conspicuous five-sided aperture.
        float eyeDistance=length(q*vec2(1.045,.957));
        float eyeRadius=.275+.006*(noise(q*17.3+2.6)-.5)+.004*(noise(q*31.7+7.2)-.5);
        float eye=smoothstep(eyeRadius,eyeRadius+.065,eyeDistance);
        float eyewallRadius=.46+.012*(broad-.5);
        float eyewall=exp(-pow((eyeDistance-eyewallRadius)/.19,2.));
        float shieldRadius=1.36+.18*sin(theta+.8)+.12*sin(theta*3.-.4);
        float canopy=exp(-pow(radius/shieldRadius,2.))*(.90+.14*sin(theta+.8));
        float spiral=azimuth-2.10*log(max(.58,radius));
        float armA=exp(-pow(angleDistance(spiral-.35)/(.29+.055*radius),2.));
        float armB=.73*exp(-pow(angleDistance(spiral-3.35)/(.23+.04*radius),2.));
        float armC=.28*exp(-pow(angleDistance(spiral-5.25)/(.15+.025*radius),2.));
        float outer=smoothstep(.78,1.35,radius)*(1.-smoothstep(3.0,4.0,radius));
        float arms=(armA+armB+armC)*outer;
        float clusters=smoothstep(.24,.69,broad);
        float billows=.48+.94*clusters+.30*(fine-.45);
        float shape=canopy*1.35+eyewall*.22+arms*.91;
        float edgeBreakup=(1.-smoothstep(.12,.60,shape))*(.11+.19*fine);
        float structure=max(0.,shape*billows-edgeBreakup-uLayer*.045);
        float density=(1.-exp(-structure*2.05))*eye;
        density*=1.-smoothstep(3.65,4.1,radius);
        // Fine sun-facing cloud tops, a cooler lower layer, and a shaded
        // inner eye wall give depth without increasing global opacity.
        float relief=fbm(cellUv+vec2(-.20,.27))-broad;
        float illumination=clamp(.64+4.4*relief+.38*(broad-.45)+.30*(fine-.45)+uLayer*.035,.25,1.);
        float eyeEdge=exp(-pow((eyeDistance-eyeRadius-.065)/.08,2.));
        illumination*=1.-eyeEdge*(.18+.16*sin(theta+.6));
        vec3 color=mix(vec3(.30,.38,.46),vec3(1.0,.995,.98),illumination);
        float alpha=density*(.30+.055*uIntensity);
        if(uShadow>.5){color=vec3(.008,.016,.031);alpha=density*.28;}
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/** All positions are local tangent coordinates: x east, y north, z radial. */
export function createTyphoonLayer(radius = 2) {
  const group = new THREE.Group();
  group.name = 'typhoon-clouds-and-wind';
  const maximumRmw = radius * 200 / EARTH_KM * TYPHOON_DISPLAY_SCALE;
  const extent = maximumRmw * 4.3;
  const clouds = [];
  const shadow = new THREE.Mesh(curvedCloudCap(radius, extent, radius * .0025), cloudMaterial(0, true));
  shadow.name = 'cloud-shadow'; shadow.renderOrder = 19;
  group.add(shadow); clouds.push(shadow);
  for (let k = 0; k < 4; k++) {
    const mesh = new THREE.Mesh(curvedCloudCap(radius, extent, radius * (.008 + k * .0045)), cloudMaterial(k));
    mesh.name = `cloud-shell-${k}`;
    mesh.renderOrder = 20 + k;
    group.add(mesh); clouds.push(mesh);
  }

  // RMW annotation is a dashed geographic small circle at precisely the
  // displayed radius, never a fictional claim about cloud or damage extent.
  const ringPositions = new Float32Array(128 * 3);
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  const ring = new THREE.LineLoop(ringGeometry, new THREE.LineDashedMaterial({
    color: '#7de9ee', transparent: true, opacity: .25,
    dashSize: radius * .018, gapSize: radius * .014, depthWrite: false,
  }));
  ring.name = 'maximum-wind-radius'; ring.renderOrder = 28; group.add(ring);

  // Short trails and their luminous tips show direction, not an unlabelled
  // measured wind speed. Speeds follow the same ideal Rankine profile.
  const traceCount = 64;
  const traces = new Float32Array(traceCount * 6);
  const traceGeometry = new THREE.BufferGeometry();
  traceGeometry.setAttribute('position', new THREE.BufferAttribute(traces, 3));
  const streamlines = new THREE.LineSegments(traceGeometry, new THREE.LineBasicMaterial({
    color: '#92bbc7', transparent: true, opacity: .14, depthWrite: false,
  }));
  streamlines.name = 'counterclockwise-wind-trails'; streamlines.renderOrder = 29; group.add(streamlines);
  const tipsGeometry = new THREE.BufferGeometry();
  const tipPositions = new Float32Array(traceCount * 3);
  tipsGeometry.setAttribute('position', new THREE.BufferAttribute(tipPositions, 3));
  const tips = new THREE.Points(tipsGeometry, new THREE.PointsMaterial({
    color: '#b6dbe4', size: radius * .002, sizeAttenuation: true,
    transparent: true, opacity: .20, depthWrite: false,
  }));
  tips.renderOrder = 30; group.add(tips);

  function update(data, progress = 0) {
    const s = data.scene;
    const rmw = radius * s.radius / EARTH_KM * TYPHOON_DISPLAY_SCALE;
    const wind = clamp(s.wind, 0, 100);
    const t = clamp(progress);
    // Integrate the model's 0.68 + 0.32 sin(pi*t) intensity envelope, rather
    // than multiplying elapsed time by instantaneous wind. This preserves
    // counter-clockwise motion even while the ideal storm weakens.
    // Decorative speed compresses the 24 h model; it is not a time estimate.
    const peakWind = wind / (.68 + .32 * Math.sin(Math.PI * t));
    const windIntegral = .68 * t + .32 / Math.PI * (1 - Math.cos(Math.PI * t));
    const phase = TAU * 3.4 * (.62 * t + peakWind / 70 * windIntegral);
    clouds.forEach(mesh => {
      mesh.material.uniforms.uRmw.value = rmw;
      mesh.material.uniforms.uPhase.value = phase;
      mesh.material.uniforms.uIntensity.value = wind / 70;
    });
    for (let i = 0; i < 128; i++) {
      const a = i / 128 * TAU;
      ringPositions.set(spherePoint(Math.cos(a) * rmw, Math.sin(a) * rmw, radius, radius * .024).toArray(), i * 3);
    }
    ringGeometry.attributes.position.needsUpdate = true;
    ringGeometry.computeBoundingSphere(); ring.computeLineDistances();
    for (let i = 0; i < traceCount; i++) {
      const fractional = (i * .61803398875) % 1;
      const rho = .68 + fractional * 3.15;
      const radialSpeed = rho <= 1 ? rho : 1 / rho;
      const angularSpeed = radialSpeed / rho;
      const a = i * 2.3999632297 + phase * angularSpeed;
      const length = .012 + .03 * radialSpeed * (.4 + wind / 70);
      const height = radius * .025;
      const begin = spherePoint(Math.cos(a - length) * rmw * rho, Math.sin(a - length) * rmw * rho, radius, height);
      const end = spherePoint(Math.cos(a) * rmw * rho, Math.sin(a) * rmw * rho, radius, height);
      traces.set(begin.toArray(), i * 6); traces.set(end.toArray(), i * 6 + 3);
      tipPositions.set(end.toArray(), i * 3);
    }
    traceGeometry.attributes.position.needsUpdate = true;
    tipsGeometry.attributes.position.needsUpdate = true;
    traceGeometry.computeBoundingSphere(); tipsGeometry.computeBoundingSphere();
  }
  return { group, update };
}
