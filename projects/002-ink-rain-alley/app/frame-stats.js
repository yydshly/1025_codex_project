// Optional local diagnostics. This measures frame cadence and CPU submission,
// not GPU execution time or performance guarantees for another device.
export function createFrameStats(){
  if(new URLSearchParams(location.search).get('inspect')!=='1')return {enabled:false,sample(){},reset(){}};

  const output=document.createElement('output');output.id='frame-stats';
  output.setAttribute('aria-label','本机帧性能检查');output.setAttribute('aria-live','off');
  output.style.cssText='position:fixed;right:16px;top:85px;z-index:1000;max-width:calc(100vw - 32px);padding:10px 13px;border:1px solid #ffffff35;border-radius:3px;background:#101820e8;color:#e2eced;font:11px/1.6 ui-monospace,Consolas,monospace;white-space:pre-wrap;pointer-events:none;text-align:left;letter-spacing:0;box-shadow:0 3px 20px #0003;';
  document.body.append(output);

  const windowMs=2000,warmupMs=1000,samples=[];
  let key='',lastNow=null,warmupUntil=0,lastPublish=-Infinity,status='waiting',meta=null;
  function publish(message){
    const description=meta?`${meta.scene}\nViewport ${meta.width}×${meta.height} CSS px\nRender DPR ${meta.pixelRatio.toFixed(2)}× · ${meta.bufferWidth}×${meta.bufferHeight} px\nScene target ${meta.targetWidth}×${meta.targetHeight} px`:'Waiting for a rendered frame';
    output.textContent=`LOCAL FRAME INSPECTION\n${description}\n${message}\nCPU timing only · not GPU time`;
  }
  function reset(reason='reset'){
    if(status===reason&&lastNow===null)return;
    samples.length=0;lastNow=null;warmupUntil=0;lastPublish=-Infinity;key='';status=reason;
    publish(`${reason} · sample window cleared`);
  }
  function sample(frame){
    const {now,cpuMs}=frame;
    const nextKey=`${frame.scene}|${frame.width}×${frame.height}|${frame.pixelRatio}|${frame.targetWidth}×${frame.targetHeight}`;
    meta=frame;
    if(nextKey!==key||lastNow===null){
      key=nextKey;samples.length=0;lastNow=now;warmupUntil=now+warmupMs;lastPublish=now;status='warmup';
      publish('Warmup 1.0 s · samples 0');return;
    }
    const previousNow=lastNow,interval=now-previousNow;lastNow=now;
    if(previousNow<warmupUntil){
      if(now-lastPublish>=250){lastPublish=now;publish(`Warmup ${Math.max(0,(warmupUntil-now)/1000).toFixed(1)} s · samples 0`);}
      return;
    }
    if(interval<=0||!Number.isFinite(interval)||!Number.isFinite(cpuMs))return;
    samples.push({now,interval,cpuMs});
    while(samples.length&&samples[0].now<now-windowMs)samples.shift();
    if(now-lastPublish<250)return;
    lastPublish=now;status='sampling';
    const count=samples.length,elapsed=samples.reduce((sum,item)=>sum+item.interval,0);
    const intervals=samples.map(item=>item.interval).sort((a,b)=>a-b);
    const p95=intervals[Math.max(0,Math.ceil(count*.95)-1)];
    const cpu=samples.reduce((sum,item)=>sum+item.cpuMs,0)/count;
    publish(`FPS ${(count*1000/elapsed).toFixed(1)} · p95 interval ${p95.toFixed(1)} ms\nCPU render submission avg ${cpu.toFixed(2)} ms\nSamples ${count} · rolling ${(elapsed/1000).toFixed(2)} s / 2.0 s`);
  }
  publish('Waiting · samples 0');
  return {enabled:true,sample,reset};
}
