export const tracks = [
  { id:'cover', number:'00', name:'序 · 尚未', en:'NOT YET', span:1.15, kind:'cover', title:'NOT<br>YET', subtitle:'A small story about finding your way back.', chinese:'一些还没说完的话，\n和一段慢慢回来的路。' },
  { id:'rain', number:'01', name:'雨巷', en:'THE LONG WAY HOME', span:1.6, kind:'rain', title:'Let the rain<br>do the crying<br><em>for me.</em>', subtitle:'把心事，交给这场雨。', chinese:'有些路，慢一点也没关系。' },
  { id:'tape', number:'02', name:'口袋里的回声', en:'THINGS I KEPT', span:1.6, kind:'tape', title:'Small things.<br><em>Long echoes.</em>', subtitle:'把那天的声音，放进口袋。', chinese:'一张车票，一段录音，一场没有下完的雨。' },
  { id:'rose', number:'03', name:'尚未盛开', en:'NOT YET', span:1.5, kind:'rose', title:'NOT<br>YET', subtitle:'There is a season for becoming.', chinese:'还没有，也是一种正在发生。' },
  { id:'forest', number:'04', name:'抬头', en:'LOOK UP', span:1.5, kind:'forest', title:'I forgot<br><em>the sky was there.</em>', subtitle:'后来，我终于抬起头。', chinese:'树影很长，天空很近。' },
  { id:'seasons', number:'05', name:'四季来信', en:'LET YOURSELF BE SEEN', span:3.8, kind:'seasons', title:'SPRING', subtitle:'Everything begins quietly.', chinese:'春 · 让新的事情发生。' },
  { id:'roots', number:'06', name:'在暗处生长', en:'ROOTS GROW IN THE DARK', span:1.5, kind:'roots', title:'Even here,<br><em>something grows.</em>', subtitle:'那些无人看见的日子，也算数。', chinese:'根在暗处，慢慢认出方向。' },
  { id:'lotus', number:'07', name:'泥中之莲', en:'OUT OF THE MUD', span:1.8, kind:'lotus', title:'泥中の蓮', subtitle:'Softness is a way of surviving.', chinese:'穿过淤泥，也可以干净地盛开。' },
  { id:'enso', number:'08', name:'一笔，归来', en:'ONE STROKE', span:1.6, kind:'enso', title:'A way back<br><em>to yourself.</em>', subtitle:'不必完整，也可以圆满。', chinese:'一笔，慢慢画回自己。' },
  { id:'still', number:'09', name:'仍在这里', en:'STILL HERE', span:1.4, kind:'still', title:'STILL HERE<span> :)</span>', subtitle:'You made it this far.', chinese:'你已经走了这么远。' },
];

let start=0;
for(const track of tracks) { track.start=start; start+=track.span; }
export const totalUnits=start;
export const seasons=[
  {name:'SPRING',cn:'春 · 让新的事情发生。',line:'Everything begins quietly.'},
  {name:'SUMMER',cn:'夏 · 让自己被看见。',line:'Stay in the light a little longer.'},
  {name:'AUTUMN',cn:'秋 · 把握不住的，轻轻放下。',line:'There is grace in letting go.'},
  {name:'WINTER',cn:'冬 · 在暗处，继续生长。',line:'Rest. The roots are still growing.'},
];

export function locate(units) {
  const index=tracks.findIndex((track,i)=>units < track.start+track.span || i===tracks.length-1);
  const track=tracks[Math.max(0,index)];
  return { index:Math.max(0,index), progress:Math.max(0,Math.min(1,(units-track.start)/track.span)) };
}
