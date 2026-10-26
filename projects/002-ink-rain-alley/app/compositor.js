export const storyFragment=/* glsl */ `
precision highp float;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uPaper;
uniform vec2 uResolution;
uniform vec4 uRainRect;
uniform float uModeA;
uniform float uModeB;
uniform float uMix;
uniform float uTime;
uniform float uSide;
uniform float uStyleA;
uniform float uStyleB;
varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=noise(p)*a;p=mat2(1.6,1.2,-1.2,1.6)*p+12.7;a*=.5;}return s;}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
vec3 paperColor(){
  vec3 fiber=texture2D(uPaper,vUv*uResolution/1024.).rgb;
  vec3 color=vec3(.919,.902,.852)+(fiber-.5)*.15+(fbm(vUv*4.)-.5)*.045;
  vec2 cells=vUv*uResolution/20.,id=floor(cells);
  float spot=(1.-smoothstep(.018,.095,length(fract(cells)-vec2(hash(id+2.),hash(id+7.)))))*step(.987,hash(id));
  vec2 sc=vUv*uResolution/43.,sid=floor(sc),s=fract(sc)-vec2(hash(sid+31.),hash(sid+77.));
  float cross=max(exp(-abs(s.x)*90.-abs(s.y)*17.),exp(-abs(s.x)*17.-abs(s.y)*90.));
  float stars=smoothstep(.2,.6,cross)*step(.982,hash(sid+13.));
  return mix(color,vec3(.14,.125,.105),max(spot*.79,stars*.55));
}
vec3 compose(vec3 raw,float mode,float style){
  vec3 paper=paperColor();
  vec3 color=paper;
  if(mode<.5){
    vec3 scene=pow(max(raw,vec3(0.)),vec3(1./2.2));
    float lum=dot(scene,vec3(.299,.587,.114));
    float paperAmount=(abs(style-4.)<.1||abs(style-5.)<.1)?.20:(.40+smoothstep(.55,.93,lum)*.70);
    color=scene+(paper-vec3(.919,.902,.852))*paperAmount;
    if(abs(style-4.)<.1){float paperWash=(1.-smoothstep(.015,.26,vUv.y+fbm(vUv*12.)*.07))*smoothstep(.08,.23,lum);color=mix(color,paper,paperWash*.92);}
    if(abs(style-7.)<.1){float mist=(1.-smoothstep(-.04,.25,vUv.y))*(.22+fbm(vec2(vUv.x*5.,vUv.y*4.+uTime*.01))*.30);color=mix(color,paper,mist);float bank=(1.-smoothstep(.01,.15,vUv.y+noise(vec2(vUv.x*9.,2.))*.07))*(.33+fbm(vec2(vUv.x*8.,vUv.y*13.))*.4);color=mix(color,vec3(.34,.35,.33),bank);}
  }else{
  vec2 uv=(vUv-uRainRect.xy)/uRainRect.zw,p=uv-.5;
  float d=box(p,vec2(.39+.018*sin(p.y*9.),.438),.08)+(fbm(uv*15.)-.5)*.048+(noise(uv*100.)-.5)*.009;
  vec3 fiber=texture2D(uPaper,vUv*uResolution/1024.).rgb;
  vec3 scene=pow(max(raw,vec3(0.)),vec3(1./2.2));
  scene=mix(scene,vec3(dot(scene,vec3(.299,.587,.114))),.22)*vec3(.97,.965,.94);
  if(uSide>.5)scene*=vec3(.76,.81,.90);
  vec3 ink=vec3(.13,.135,.128)+(fbm(uv*60.)-.5)*.07;
  scene=mix(scene,ink,smoothstep(-.038,.005,d)*.83)+(fiber-.5)*.04;
  color=mix(paper,ink,(1.-smoothstep(-.002,.028,d))*.15);
  color=mix(color,scene,1.-smoothstep(-.005,.012,d));
  float drips=min(box(p-vec2(-.2,-.463),vec2(.003,.067),.001),box(p-vec2(.23,-.46),vec2(.002,.060),.001));
  drips=min(drips,box(p-vec2(-.16,-.45),vec2(.0018,.04),.001));
  color=mix(color,ink,(1.-smoothstep(-.001,.002,drips))*.8);
  vec2 sun=(uv-vec2(.105,.867))*vec2((uRainRect.z*uResolution.x)/(uRainRect.w*uResolution.y),1.);
  float circle=length(sun)-min(.035,22./(uRainRect.w*uResolution.y))+(noise(uv*160.)-.5)*.0016;
  color=mix(color,vec3(.64,.19,.20),1.-smoothstep(-.001,.002,circle));
  }
  return color;
}
void main(){
  vec2 artUv=clamp((vUv-uRainRect.xy)/uRainRect.zw,.001,.999);
  vec2 sampleA=mix(vUv,artUv,step(.5,uModeA));
  vec2 pixel=1./uResolution;
  vec2 fiberWarp=vec2(noise(sampleA*170.),noise(sampleA*163.+19.))-.5;
  vec2 ua=sampleA+fiberWarp*pixel*1.3;
  vec3 centerA=texture2D(uA,ua).rgb;
  vec3 leftA=texture2D(uA,ua+pixel*vec2(-1.4,.5)).rgb;
  vec3 rightA=texture2D(uA,ua+pixel*vec2(1.2,-.8)).rgb;
  vec3 pigmentA=mix(centerA,(centerA+leftA+rightA)/3.,.32);
  pigmentA=mix(pigmentA,min(centerA,min(leftA,rightA)),.11);
  vec3 a=compose(pigmentA,uModeA,uStyleA);
  if(uMix>.0001){
    vec2 sampleB=mix(vUv,artUv,step(.5,uModeB));
    vec3 b=compose(texture2D(uB,sampleB).rgb,uModeB,uStyleB);
    float flow=fbm(vUv*vec2(5.,3.))+noise(vUv*95.)*.035;
    float mask=smoothstep(flow-.12,flow+.12,uMix*1.5-.22);
    a=mix(a,b,mask);
  }
  float grain=hash(floor(vUv*uResolution))-.5;
  gl_FragColor=vec4(a+grain*.009,1.);
}`;
