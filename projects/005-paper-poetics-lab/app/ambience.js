const musicUrl=new URL('./media/paper-home.ogg',import.meta.url).href;
export function createAmbience(theme='tea',onChange=()=>{}){
  let context,master,music,wind,water,lowpass,loaded=false,loading=false,enabled=false,paused=false,hidden=document.hidden,loadPromise,timer;
  const state=()=>({enabled,loading,loaded,paused,hidden,context:context?.state||'idle'});
  function emit(){onChange(state());}
  const ramp=(node,value,t=.5)=>node.gain.setTargetAtTime(value,context.currentTime,t/3);
  function initialize(){
    if(context)return;context=new AudioContext();master=context.createGain();master.gain.value=0;master.connect(context.destination);
    music=context.createGain();music.gain.value=.36;music.connect(master);
    const buffer=context.createBuffer(1,context.sampleRate*6,context.sampleRate),data=buffer.getChannelData(0);let brown=0;
    for(let i=0;i<data.length;i++){brown=(brown+(Math.random()*2-1)*.025)/1.025;data[i]=brown*4;}
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true;
    lowpass=context.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=theme==='tea'?800:380;
    wind=context.createGain();wind.gain.value=theme==='tea'?.13:.18;source.connect(lowpass);lowpass.connect(wind);wind.connect(master);source.start();
    const white=context.createBuffer(1,context.sampleRate*6,context.sampleRate),samples=white.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
    const flow=context.createBufferSource();flow.buffer=white;flow.loop=true;const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=theme==='tea'?560:240;filter.Q.value=.6;
    water=context.createGain();water.gain.value=.012;flow.connect(filter);filter.connect(water);water.connect(master);flow.start();context.addEventListener('statechange',emit);
  }
  async function load(){
    if(loaded)return;if(!loadPromise){loading=true;emit();loadPromise=(async()=>{const response=await fetch(musicUrl);if(!response.ok)throw new Error('Music unavailable');const buffer=await context.decodeAudioData(await response.arrayBuffer());const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(music);source.start();loaded=true;})().catch(e=>{loadPromise=null;throw e;}).finally(()=>{loading=false;emit();});}await loadPromise;
  }
  function sync(){if(!context)return;clearTimeout(timer);if(enabled&&!paused&&!hidden){context.resume().catch(()=>{});ramp(master,.45,.7);}else{ramp(master,0,.2);timer=setTimeout(()=>{if(!enabled||paused||hidden)context.suspend().catch(()=>{});},300);}emit();}
  return{
    async toggle(){initialize();enabled=!enabled;sync();if(enabled)await load();return enabled;},
    update({action=0,paused:nextPaused=false}={}){if(context)ramp(water,theme==='tea'?.012+action*.15:.022+action*.025,.3);if(paused!==nextPaused){paused=nextPaused;sync();}},
    suspend(value){hidden=value;sync();},
    get state(){return state();},
  };
}
