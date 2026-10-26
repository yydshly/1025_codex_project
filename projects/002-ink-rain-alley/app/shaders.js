export const fullscreenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

export const paperFragment = /* glsl */ `
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uPaper;
uniform vec2 uResolution;
uniform vec4 uRect;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i=0; i<5; i++) { s += a*noise(p); p = mat2(1.6,1.2,-1.2,1.6)*p + 12.7; a *= 0.5; }
  return s;
}
float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p)-b+r;
  return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;
}
void main() {
  vec2 pixel = vUv*uResolution;
  vec3 fiber = texture2D(uPaper,pixel/1024.0).rgb;
  float broad = fbm(vUv*vec2(4.0,3.0));
  vec3 paper = vec3(0.919,0.902,0.852)+(fiber-0.5)*0.085+(broad-0.5)*0.035;
  float vignette = smoothstep(0.25,0.85,length((vUv-0.48)*vec2(0.85,0.8)));
  paper -= vignette*0.038;
  vec2 cell = vUv*uResolution/18.0;
  vec2 cellId = floor(cell);
  float dotSeed = hash(cellId+2.9);
  vec2 dotPosition = vec2(hash(cellId+17.0),hash(cellId+67.0));
  float fleck = (1.0-smoothstep(0.02,0.055+hash(cellId+8.0)*0.045,length(fract(cell)-dotPosition)))*step(0.988,dotSeed);
  paper = mix(paper,vec3(0.26,0.24,0.20),fleck*0.58);

  vec2 uv = (vUv-uRect.xy)/uRect.zw;
  vec2 p = uv-0.5;
  float wobble = (fbm(uv*15.0)-0.5)*0.047+(noise(uv*105.0)-0.5)*0.009;
  float width = 0.387 + 0.023*sin(p.y*9.0+0.5) - 0.016*p.y;
  float d = box(p, vec2(width,0.438),0.083)+wobble;
  // A few thin, uneven trails below the painted edge.
  float drip1 = box(p-vec2(-0.203,-0.461),vec2(0.0038,0.068),0.002);
  float drip2 = box(p-vec2(-0.165,-0.453),vec2(0.0022,0.043),0.001);
  float drip3 = box(p-vec2(0.231,-0.461),vec2(0.003,0.059),0.001);
  float drip = min(drip1,min(drip2,drip3))+(noise(uv*170.0)-0.5)*0.0015;

  vec3 scene = pow(max(texture2D(uScene,clamp(uv,0.001,0.999)).rgb,vec3(0.0)),vec3(1.0/2.2));
  float luminance = dot(scene,vec3(0.299,0.587,0.114));
  scene = mix(scene,vec3(luminance),0.27)*vec3(0.97,0.965,0.94);
  scene += (fiber-0.5)*0.043;
  float edge = smoothstep(-0.037,0.007,d);
  vec3 ink = vec3(0.17,0.171,0.16)+(fbm(uv*60.0)-0.5)*0.085;
  scene = mix(scene,ink,edge*0.82);
  float bleed = (1.0-smoothstep(-0.002,0.027,d))*0.14;
  vec3 color = mix(paper,ink,bleed);
  color = mix(color,scene,1.0-smoothstep(-0.005,0.012,d));
  color = mix(color,ink,(1.0-smoothstep(-0.001,0.002,drip))*0.80);

  // The vermilion seal is painted, with a slightly imperfect circumference.
  vec2 sun = (uv-vec2(0.108,0.867))*vec2((uRect.z*uResolution.x)/(uRect.w*uResolution.y),1.0);
  float sunEdge = length(sun)-0.035+(noise(uv*170.0)-0.5)*0.0017;
  color = mix(color,vec3(0.64,0.19,0.20)+(fiber-0.5)*0.07,1.0-smoothstep(-0.001,0.002,sunEdge));
  gl_FragColor = vec4(color,1.0);
}`;

export const rainVertex = /* glsl */ `
uniform float uTime;
attribute float aSpeed;
attribute float aEnd;
varying float vDepth;
varying float vEnd;
void main() {
  vec3 p = position;
  p.y = mod(p.y-uTime*aSpeed,24.0)+aEnd*(0.20+aSpeed*0.025);
  p.x += aEnd*0.04+sin(uTime*0.2)*0.12;
  vec4 mv = modelViewMatrix*vec4(p,1.0);
  vDepth = -mv.z;
  vEnd = aEnd;
  gl_Position = projectionMatrix*mv;
}`;

export const rainFragment = /* glsl */ `
varying float vDepth;
varying float vEnd;
void main() {
  float fade = (1.0-smoothstep(30.0,105.0,vDepth))*smoothstep(0.0,5.0,vDepth);
  gl_FragColor = vec4(0.72,0.74,0.72,fade*mix(0.27,0.07,vEnd));
}`;

export const rippleVertex = /* glsl */ `
attribute float aStart;
attribute float aEnd;
uniform float uTime;
varying float vAlpha;
void main() {
  float age = fract(aStart+uTime*0.44);
  vec3 p = position;
  p.xz += normal.xz*(age*0.25+0.015);
  vAlpha = pow(1.0-age,2.0)*0.18;
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;

export const rippleFragment = /* glsl */ `
uniform float uAmount;
varying float vAlpha;
void main() { gl_FragColor = vec4(0.63,0.65,0.64,vAlpha*uAmount); }
`;
