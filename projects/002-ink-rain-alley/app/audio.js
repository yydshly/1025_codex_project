// Original 64-beat ambient score + locally synthesized scene ambience.
// Audio is created and the score fetched only after a deliberate user click.
const scoreUrl=new URL('../assets/audio/paper-home.ogg',import.meta.url).href;
const clamp=value=>Math.max(0,Math.min(1,Number(value)||0));

export function createSoundscape(){
  let context,master,music,nature,wind,rain,water,filter,scoreSource,scorePromise,suspendTimer,listener=()=>{};
  let enabled=false,volume=.45,musicLevel=.78,natureLevel=.66,mode='score',loading=false,scoreReady=false,error='';
  let kind='cover',amount=.65,paused=false,hidden=document.hidden,season=0;
  const snapshot=()=>({enabled,volume,musicLevel,natureLevel,mode,loading,scoreReady,error,
    running:!!context&&context.state==='running'&&enabled&&!paused&&!hidden,
    contextState:context?.state||'idle',paused,hidden});
  const emit=()=>listener(snapshot());
  function ramp(node,value,seconds=.8){
    if(!context||!node)return;
    node.gain.setTargetAtTime(value,context.currentTime,Math.max(.02,seconds/3));
  }
  function initialize(){
    if(context)return;
    context=new AudioContext();
    master=context.createGain();master.gain.value=0;
    const limiter=context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=15;limiter.ratio.value=2;limiter.attack.value=.03;limiter.release.value=.6;
    master.connect(limiter);limiter.connect(context.destination);
    nature=context.createGain();nature.gain.value=natureLevel;nature.connect(master);
    music=context.createGain();music.gain.value=0;music.connect(master);
    const noiseBuffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=noiseBuffer.getChannelData(0);
    let brown=0;
    for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*5;}
    const source=context.createBufferSource();source.buffer=noiseBuffer;source.loop=true;
    filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700;
    const gust=context.createGain();gust.gain.value=.7;
    const gustLfo=context.createOscillator(),gustDepth=context.createGain();gustLfo.frequency.value=.075;gustDepth.gain.value=.25;gustLfo.connect(gustDepth);gustDepth.connect(gust.gain);gustLfo.start();
    wind=context.createGain();wind.gain.value=0;source.connect(filter);filter.connect(gust);gust.connect(wind);wind.connect(nature);source.start();
    const white=context.createBuffer(1,context.sampleRate*8,context.sampleRate),whiteData=white.getChannelData(0);
    for(let i=0;i<whiteData.length;i++)whiteData[i]=Math.random()*2-1;
    const shower=context.createBufferSource();shower.buffer=white;shower.loop=true;
    const high=context.createBiquadFilter(),soft=context.createBiquadFilter();high.type='highpass';high.frequency.value=850;soft.type='lowpass';soft.frequency.value=5600;
    rain=context.createGain();rain.gain.value=0;shower.connect(high);high.connect(soft);soft.connect(rain);rain.connect(nature);shower.start();
    const shore=context.createBufferSource();shore.buffer=white;shore.loop=true;
    const shoreFilter=context.createBiquadFilter();shoreFilter.type='bandpass';shoreFilter.frequency.value=440;shoreFilter.Q.value=.4;
    const tide=context.createGain();tide.gain.value=.55;const tideLfo=context.createOscillator(),tideDepth=context.createGain();tideLfo.frequency.value=.13;tideDepth.gain.value=.4;tideLfo.connect(tideDepth);tideDepth.connect(tide.gain);tideLfo.start();
    water=context.createGain();water.gain.value=0;shore.connect(shoreFilter);shoreFilter.connect(tide);tide.connect(water);water.connect(nature);shore.start();
    context.addEventListener('statechange',emit);mix();
  }
  function mix(){
    if(!context)return;
    const cold=kind==='seasons'&&season>2.3;
    const musicDuck=kind==='rain'?.64:kind==='roots'?.58:kind==='enso'?.66:kind==='still'?1:.84;
    ramp(music,mode==='score'?musicLevel*musicDuck:0,1.5);
    ramp(nature,natureLevel,.5);
    ramp(rain,kind==='rain'?amount*.22:kind==='roots'?.008:0,1.8);
    ramp(wind,kind==='forest'?.23:kind==='roots'?.17:cold?.15:kind==='seasons'?.075:kind==='lotus'?.045:.022,2.2);
    ramp(water,kind==='seasons'?(cold?.018:.085):kind==='lotus'?.028:0,2.2);
    filter.frequency.setTargetAtTime(kind==='forest'?480:kind==='roots'?240:cold?330:900,context.currentTime,.65);
  }
  function synchronize(){
    if(!context)return;
    clearTimeout(suspendTimer);
    const running=enabled&&!paused&&!hidden;
    if(running){context.resume().catch(()=>{error='声音未能恢复，请再点一次声音开关。';emit();});ramp(master,volume,.7);}
    else{
      ramp(master,0,.22);
      suspendTimer=setTimeout(()=>{if(!enabled||paused||hidden)context.suspend().catch(()=>{});},320);
    }
    emit();
  }
  async function ensureScore(){
    if(scoreSource)return;
    if(!scorePromise){
      loading=true;error='';emit();
      scorePromise=(async()=>{
        const response=await fetch(scoreUrl);if(!response.ok)throw new Error(`Score HTTP ${response.status}`);
        const buffer=await context.decodeAudioData(await response.arrayBuffer());
        const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(music);source.start();scoreSource=source;scoreReady=true;
      })().catch(cause=>{scorePromise=null;error='配乐加载失败，可先切换为只听环境，再重新尝试。';throw cause;}).finally(()=>{loading=false;emit();});
    }
    await scorePromise;
  }
  return {
    subscribe(callback){listener=callback;emit();},
    async toggle(){
      initialize();
      if(enabled&&context.state==='suspended'&&!paused&&!hidden){await context.resume();synchronize();return true;}
      enabled=!enabled;if(enabled)error='';synchronize();
      if(enabled&&mode==='score')await ensureScore();
      emit();return enabled;
    },
    async setMode(value){mode=value==='nature'?'nature':'score';error='';mix();emit();if(enabled&&mode==='score')await ensureScore();},
    setVolume(value){volume=clamp(value);if(context&&enabled&&!paused&&!hidden)ramp(master,volume,.35);emit();},
    setMusicLevel(value){musicLevel=clamp(value);mix();emit();},
    setNatureLevel(value){natureLevel=clamp(value);mix();emit();},
    update(nextKind,nextAmount=.65,nextPaused=false,details={}){
      const playbackChanged=paused!==nextPaused;
      kind=nextKind;amount=nextAmount;paused=nextPaused;season=details.season??season;mix();
      if(playbackChanged)synchronize();
    },
    get enabled(){return enabled;},
    get state(){return snapshot();},
    suspend(value){hidden=value;synchronize();},
  };
}
