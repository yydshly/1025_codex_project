import * as THREE from 'three';

export function random(seed = 72) {
  return () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export function paperTexture() {
  const rand = random(913);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(1024,1024);
  for (let i=0;i<pixels.data.length;i+=4) {
    const shade = 128+(rand()-.5)*84;
    pixels.data[i]=shade; pixels.data[i+1]=shade; pixels.data[i+2]=shade; pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  for (let i=0;i<8000;i++) {
    const x=rand()*1024,y=rand()*1024;
    ctx.strokeStyle=`rgba(${rand()>.5?'255,255,245':'48,40,22'},${rand()*.12})`;
    ctx.lineWidth=rand()*.6+.2;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rand()-.5)*2,y+rand()*16+2);ctx.stroke();
  }
  for (let i=0;i<480;i++) {
    ctx.fillStyle=`rgba(40,29,17,${rand()*.34})`;
    ctx.beginPath();ctx.ellipse(rand()*1024,rand()*1024,rand()*1.2+.2,rand()*2+.3,rand()*4,0,Math.PI*2);ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  return texture;
}

// This is a generated botanical drawing, never a downloaded image asset.
export function drawBranch(canvas, rect) {
  const ratio = Math.min(window.devicePixelRatio || 1,2);
  canvas.width=innerWidth*ratio;canvas.height=innerHeight*ratio;
  const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);
  const rand=random(1091);
  const mobile=innerWidth<681;
  ctx.save();ctx.beginPath();ctx.rect(0,Math.max(rect.y,74),innerWidth,innerHeight);ctx.clip();
  const startX=rect.x+rect.width*.97,startY=rect.y+rect.height*.18;
  const size=rect.width*(mobile?.36:.40);
  const ends=[];
  function twig(x,y,length,angle,weight,depth) {
    const endX=x+Math.cos(angle)*length,endY=y+Math.sin(angle)*length;
    const bend=(rand()-.5)*length*.32;
    ctx.strokeStyle=`rgba(55,49,42,${.56+rand()*.25})`;ctx.lineWidth=weight;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+endX)/2,(y+endY)/2+bend,endX,endY);ctx.stroke();
    if(depth===0) { ends.push([endX,endY]); return; }
    twig(endX,endY,length*(.62+rand()*.13),angle+(rand()-.5)*.45,weight*.64,depth-1);
    twig(x+(endX-x)*.63,y+(endY-y)*.63,length*(.45+rand()*.13),angle+(rand()>.45?1:-1)*(.44+rand()*.42),weight*.49,depth-1);
  }
  twig(startX,startY,size*.62,-2.88,2.8,4);
  for(const [x,y] of ends) {
    for(let i=0;i<3+rand()*4;i++) {
      const px=x+(rand()-.5)*27,py=y+(rand()-.5)*25;
      for(let petal=0;petal<5;petal++) {
        const a=petal*Math.PI*.4;
        ctx.fillStyle=`rgba(${158+Math.floor(rand()*32)},${96+Math.floor(rand()*27)},${99+Math.floor(rand()*27)},${.25+rand()*.35})`;
        ctx.beginPath();ctx.ellipse(px+Math.cos(a)*2.4,py+Math.sin(a)*2.4,2+rand()*1.5,1.3+rand()*.7,a,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle='#7a4b466b';ctx.fillRect(px,py,1,1);
    }
  }
  ctx.restore();
}
