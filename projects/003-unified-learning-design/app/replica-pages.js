import * as THREE from './vendor/three.module.js';

export const lessons=[
 {title:'目录',en:'Contents'},
 {title:'能量储存',en:'Energy stores',intro:['能量可以储存在不同的系统中。','当物体运动、升高、变热或形变，','我们可以追踪能量去了哪里。'],formula:'Eₚ = m g h',sub:'重力势能 = 质量 × 重力加速度 × 高度',terms:['系统  ·  我们正在观察的物体或物体组合。','储存  ·  能量存在于系统中的不同方式。','转移  ·  系统间通过做功或传热交换能量。'],question:'书从高处落下，能量最终去了哪里？',options:['能量消失了','进入周围物体的内能','仍全部储存在高处'],answer:'下落时，重力势能转化为动能。碰撞后，能量转移到书、地面与空气；声音也带走一小部分。',caption:'八件日常物品，对应八种能量储存。',instruction:'点选物体，看对应的能量瓶亮起。',challenge:'点亮全部八个能量瓶。'},
 {title:'上升与下落',en:'Up and down',intro:['小球沿轨道滚下时，高度降低，','速度增加。重力势能逐渐转化为动能。','有耗散阻力时，机械能转化为内能。'],formula:'Eₖ = ½mv² + ½Iω²',sub:'平移动能 + 转动动能（均匀实心球）',terms:['重力势能  ·  取球心相对最低处的高度。','动能  ·  包含球心平移与自身转动。','耗散  ·  阻力做负功，机械能转为内能。'],question:'到最低处时，小球会怎样？',options:['动能最大','完全静止','全转成内能'],answer:'最低处势能最小，平移与转动动能最大。无耗散时，总机械能不变，小球不能超过原来的释放高度。有耗散阻力时，一部分机械能变成内能，上升高度降低。',caption:'弧形轨道上的小球，能量在三瓶之间转移。',instruction:'拖动小球或调节起点，松手观察。',challenge:'比较有无耗散时的上升高度。'},
 {title:'弹簧与发射',en:'Stretch and launch',intro:['压缩弹簧时，我们对弹簧做功。','松开后，弹性势能转化为小球的动能。','小球飞起时，一部分动能转化为势能。'],formula:'Eₑ = ½ k x²',sub:'弹性势能 = ½ × 劲度系数 × 形变量的平方',terms:['弹性势能  ·  形变的物体储存的能量。','形变量  ·  弹簧相对原长的长度变化。','抛射  ·  水平方向与竖直方向同时运动。'],question:'到达最高点，小球还在运动吗？',options:['没有，它完全静止','有，它仍在向前运动','只要有重力就不能向前'],answer:'最高点的竖直速度瞬间为零，水平方向仍有速度。所以小球仍然有动能，并继续沿弧线运动。',caption:'弹簧、发射槽、真实计算轨迹与软垫。',instruction:'调节压缩量，再松开发射。',challenge:'比较两倍压缩量的弹性势能。'}
];

function canvas(w=1100,h=1500){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];}
function rng(seed=42){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
export function paperCanvas(w=1100,h=1500,base='#f6f3e8'){
 const [c,g]=canvas(w,h);g.fillStyle=base;g.fillRect(0,0,w,h);const rand=rng(12);g.globalAlpha=.075;
 for(let i=0;i<32000;i++){const n=rand();g.fillStyle=n>.5?'#ffffff':'#796e55';g.fillRect(rand()*w,rand()*h,rand()*1.5+.3,rand()*2+.3);}g.globalAlpha=1;return [c,g];
}
export function tex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
function text(g,s,x,y,size=32,color='#28303a',weight='400',font='SourceSerif, SimSun, serif'){g.fillStyle=color;const chinese=/[\u3400-\u9fff]/.test(s);g.font=`${chinese?'600':weight} ${size}px ${chinese?'Microsoft YaHei, sans-serif':font}`;g.fillText(s,x,y);if(chinese){g.strokeStyle=color;g.lineWidth=.5;g.strokeText(s,x,y);}}
function line(g,x,y,w,color='#aaa18c'){g.strokeStyle=color;g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke();}
function wrap(g,s,x,y,max,size=30,leading=45){let row='';for(const char of s){g.font=`${size}px SourceSerif, SimSun, serif`;if(g.measureText(row+char).width>max){text(g,row,x,y,size);row=char;y+=leading;}else row+=char;}text(g,row,x,y,size);return y+leading;}
export function pageTexture(index,side,state={}){
 const [c,g]=paperCanvas();const d=lessons[index];text(g,'E N E R G Y   /   A   F I E L D   B O O K',95,57,12,'#9b9786');line(g,95,72,905,'#d8d1bd');
 if(index===0){
  if(side==='left'){
   text(g,'A  B O O K  A B O U T  E N E R G Y',210,290,16,'#9b5940');text(g,'Every Joule',190,420,94,'#25303a','600');text(g,'每一份能量，都有去处。',230,510,36,'#6c7068');
   line(g,240,620,540);text(g,'从纸页走进物理世界',250,710,36);['01   先作出自己的预测','02   看图示从纸上立起','03   亲手改变，观察能量','04   掀开纸片，核对解释'].forEach((s,i)=>text(g,s,250,800+i*72,30,'#555d59'));
   text(g,'3D 效果研究 · 三课样章',300,1260,22,'#8b8c7e');text(g,'视觉参照：Techartist / Every Joule',220,1320,23,'#8b8c7e');
  }else{
   text(g,'Contents',110,190,68,'#28303a','600');text(g,'点击章节，继续探索',110,255,26,'#7d8174');
   lessons.slice(1).forEach((l,i)=>{const y=415+i*170;text(g,String(i+1).padStart(2,'0'),110,y,24,'#a36c54');text(g,l.en,190,y,42);text(g,l.title,190,y+50,28,'#777c70');line(g,190,y+85,720,'#d2cdbd');text(g,String(i*2+4),940,y,25,'#7b8275');});
   text(g,'能量储存的颜色',110,1040,22,'#8d8575');['动能','重力势能','弹性势能','内能','化学能','磁场能','静电能','核能'].forEach((s,i)=>{const x=110+i%4*235,y=1110+Math.floor(i/4)*95;g.fillStyle=['#5474dc','#8d51d6','#d466ab','#ed9249','#4f9b67','#bd5363','#55a5bd','#d5b34a'][i];g.fillRect(x,y,34,34);text(g,s,x+45,y+27,22,'#5e665f');});
  }
 }else if(side==='left'){
  const x=330; text(g,`L E S S O N  ${index}`,x,140,15,'#a6644c');text(g,d.en,x,220,index===3?54:64,'#242c37','600');text(g,d.title,x,285,28,'#a1644e');d.intro.forEach((s,i)=>text(g,s,x,355+i*47,32));
  g.strokeStyle='#d7cfb9';g.strokeRect(x-16,485,650,156);text(g,d.formula,x+18,562,index===2?44:60);text(g,d.sub,x+18,612,21,'#747a70');text(g,'K E Y   I D E A S',x,700,14,'#aa725b');d.terms.forEach((s,i)=>wrap(g,s,x,748+i*60,640,25,34));
  text(g,'P R E D I C T',x,975,14,'#a6644c');text(g,d.question,x,1023,29);d.options.forEach((s,i)=>{let y=1080+i*48;g.strokeStyle='#717971';g.strokeRect(x,y-23,24,24);if(state.prediction===i){text(g,'✓',x-1,y,29,'#a34c37');}text(g,s,x+42,y,26,'#4e5951');});
  text(g,'C H A L L E N G E',72,1180,12,'#9b7257');wrap(g,d.challenge,72,1220,200,20,32);g.strokeStyle='#b3b0a066';g.setLineDash([4,5]);g.beginPath();g.arc(158,1090,68,0,Math.PI*2);g.stroke();g.setLineDash([]);
  if(state.complete){text(g,'✓',118,1110,58,'#527a54');text(g,'已探索',115,1145,19,'#527a54');}
 }else{
  const captionY=index===1?1320:1250;
  text(g,`Fig. ${index}   ${d.caption}`,90,captionY,24,'#737c70');text(g,d.instruction,90,captionY+60,29,'#48564f');text(g,'THE EXPERIMENT',90,captionY+120,14,'#8b917f');
 }
 text(g,String(index*2+(side==='left'?2:3)),side==='left'?86:1000,1445,23,'#798072');
 const crease=g.createLinearGradient(side==='left'?1100:0,0,side==='left'?980:120,0);crease.addColorStop(0,'rgba(35,37,29,.42)');crease.addColorStop(.25,'rgba(55,55,40,.12)');crease.addColorStop(.7,'rgba(55,55,40,.02)');crease.addColorStop(1,'rgba(55,55,40,0)');g.fillStyle=crease;g.fillRect(side==='left'?980:0,0,120,1500);return tex(c);
}
export function flapTexture(open=false,index=1){const[c,g]=paperCanvas(900,260,'#f0ead6');g.strokeStyle='#b5aa89';g.strokeRect(14,14,872,232);g.strokeStyle='#d0c6ad';g.strokeRect(22,22,856,216);text(g,open?'THE ANSWER':'WHY?',45,61,20,'#a46845');if(open)wrap(g,lessons[index].answer,45,105,810,28,41);else{text(g,'掀开这一页，看看为什么。',45,125,38);text(g,'先预测，再揭晓。',45,181,26,'#777b6b');text(g,'lift here ↗',680,215,28,'#74796c','400','Caveat, serif');}return tex(c);}
export function labelTexture(title,value){const[c,g]=paperCanvas(300,130);g.strokeStyle='#3c443c';g.lineWidth=3.5;g.strokeRect(5,5,290,120);g.strokeStyle='#8c897555';g.strokeRect(10,10,280,110);text(g,title,16,39,30,'#28302b');text(g,value,17,105,53,'#202b23','600','SourceSerif, serif');return tex(c);}
export function makeSurface(kind){const[c,g]=canvas(1024,1024),rand=rng(6);g.fillStyle=kind==='wood'?'#cfc8b5':'#8faaa0';g.fillRect(0,0,1024,1024);const pixels=g.getImageData(0,0,1024,1024);for(let i=0;i<pixels.data.length;i+=4){const n=(rand()-.5)*(kind==='wood'?7:32);pixels.data[i]+=n;pixels.data[i+1]+=n;pixels.data[i+2]+=n;}g.putImageData(pixels,0,0);for(let i=0;i<35000;i++){g.globalAlpha=rand()*(kind==='wood'?.05:.1);g.fillStyle=rand()>.5?'#ffffff':'#1c2924';const x=rand()*1024,y=rand()*1024;g.fillRect(x,y,kind==='wood'?rand()*110+5:rand()*2+.4,.6+rand());}g.globalAlpha=1;const t=tex(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?2:3,kind==='wood'?2:3);return t;}
