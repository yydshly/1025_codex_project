// Semantic reading regions for the independently drawn 1100 × 1500 book pages.
// Input UVs are Three.js texture UVs: v=1 is the top of the printed page.
// This module has no DOM or renderer dependency.
const WIDTH=1100,HEIGHT=1500;
// Ray UV interpolation may put an exact printed boundary a few ulps either side.
const EPS=1e-7;
const inBox=(x,y,left,top,right,bottom)=>x>=left-EPS&&x<right-EPS&&y>=top-EPS&&y<bottom-EPS;
const strings=value=>Array.isArray(value)?value.filter(s=>typeof s==='string'&&s.trim()):typeof value==='string'&&value.trim()?[value]:[];

export function readingRegion({chapter,side,u,v,lesson,flapOpen=false,surface='page',prediction=-1,complete=false}={}){
  if(!Number.isInteger(chapter)||chapter<1||!lesson||typeof lesson!=='object')return null;
  if(!['left','right'].includes(side)||!Number.isFinite(u)||!Number.isFinite(v)||u<0||u>1||v<0||v>1)return null;
  if(!['page','flap','answer'].includes(surface))return null;
  const title=typeof lesson.title==='string'?lesson.title:'第 '+chapter+' 课';
  const make=(region,data)=>({key:chapter+':'+region,region,eyebrow:'第 '+chapter+' 课',title,paragraphs:[],...data});
  const explanation=()=>{
    const paragraphs=strings(lesson.answer);
    return flapOpen&&paragraphs.length?make('explanation',{eyebrow:'核对解释',title:'为什么会这样？',paragraphs,answer:paragraphs.join('\n')}):null;
  };
  const cover=()=>make('explanation-cover',{
    eyebrow:'先预测，再揭晓',title:flapOpen?'解释纸片已展开':'解释藏在纸片下面',
    paragraphs:[flapOpen?'解释显示在下方书页上。':'先作出自己的预测，再掀开纸片核对原因。']
  });
  if(surface==='flap')return side==='left'?cover():null;
  if(surface==='answer')return side==='left'?explanation():null;

  const x=u*WIDTH,y=(1-v)*HEIGHT;
  if(side==='right'){
    const captionY=chapter===1?1320:1250;
    if(!inBox(x,y,75,captionY-35,1040,captionY+120))return null;
    const paragraphs=[...strings(lesson.caption),...strings(lesson.instruction)];
    return paragraphs.length?make('caption',{eyebrow:'图示与操作',title:'图 '+chapter+' · '+title,paragraphs}):null;
  }
  // The physical flap covers the lower main column; the challenge is beside it.
  if(inBox(x,y,300,1200,1020,1415))return flapOpen?explanation():cover();
  if(inBox(x,y,60,1010,292,1370)){
    const paragraphs=strings(lesson.challenge);
    return paragraphs.length?make('challenge',{eyebrow:'动手试一试',title:complete?'已探索 · 再试一次':'本页挑战',paragraphs,completed:Boolean(complete)}):null;
  }
  if(inBox(x,y,314,110,1030,470)){
    const intro=strings(lesson.intro);
    return intro.length?make('intro',{paragraphs:[intro.join('')]}):null;
  }
  if(inBox(x,y,314,485,985,650)){
    const formula=strings(lesson.formula)[0];
    return formula?make('formula',{eyebrow:'看清这个关系',title:'公式',formula,paragraphs:strings(lesson.sub)}):null;
  }
  if(inBox(x,y,314,680,1030,940)){
    const paragraphs=strings(lesson.terms);
    return paragraphs.length?make('terms',{eyebrow:'关键词',title:'把概念连起来',paragraphs}):null;
  }
  if(inBox(x,y,314,960,1030,1200)){
    const paragraphs=strings(lesson.question),options=strings(lesson.options);
    if(!paragraphs.length)return null;
    const selected=Number.isInteger(prediction)&&prediction>=0&&prediction<options.length?prediction:-1;
    return make('prediction',{eyebrow:'先作出预测',title:'你认为会怎样？',paragraphs,options,selected});
  }
  return null;
}

// Section anchors stay inside each printed block and use the same Three.js UVs.
// A covered explanation keeps its place in the reading order without revealing it.
export function readingSections({chapter,lesson,flapOpen=false,prediction=-1,complete=false}={}){
  const captionY=chapter===1?1320:1250;
  const anchors=[
    ['正文','left',672,290],
    ['公式','left',649.5,567.5],
    ['关键词','left',672,810],
    ['预测','left',672,1080],
    ...(strings(lesson?.answer).length?[['解释','left',660,1307.5]]:[]),
    ['挑战','left',176,1190],
    ['图注','right',557.5,captionY+42.5]
  ];
  return anchors.flatMap(([label,side,x,y])=>{
    const u=x/WIDTH,v=1-y/HEIGHT;
    const region=readingRegion({chapter,side,u,v,lesson,flapOpen,prediction,complete});
    return region?[{label,side,u,v,region}]:[];
  });
}
