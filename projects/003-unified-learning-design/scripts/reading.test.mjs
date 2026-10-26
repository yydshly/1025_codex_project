import test from 'node:test';
import assert from 'node:assert/strict';
import {readingRegion,readingSections} from '../app/replica-reading.js';

const lesson={
  title:'上升与下落',intro:['小球沿轨道滚下时，','高度降低，速度增加。'],
  formula:'Eₖ = ½mv² + ½Iω²',sub:'平移动能 + 转动动能',
  terms:['动能 · 物体运动时具有的能量。','势能 · 与相对高度有关。'],
  question:'到最低处时，小球会怎样？',options:['动能最大','完全静止','全转成内能'],
  answer:'最低处势能最小，动能最大。',challenge:'比较有无耗散时的上升高度。',
  caption:'弧形轨道上的小球。',instruction:'拖动小球或调节起点，松手观察。'
};
const at=(x,y,extra={})=>readingRegion({chapter:2,side:'left',u:x/1100,v:1-y/1500,lesson,...extra});

test('printed top and bottom use Three.js UV orientation and identify real text blocks',()=>{
  const intro=at(500,360),formula=at(500,560),terms=at(500,810);
  assert.equal(intro.region,'intro');assert.equal(intro.title,'上升与下落');
  assert.deepEqual(intro.paragraphs,['小球沿轨道滚下时，高度降低，速度增加。']);
  assert.equal(formula.region,'formula');assert.equal(formula.formula,lesson.formula);
  assert.deepEqual(formula.paragraphs,[lesson.sub]);assert.deepEqual(terms.paragraphs,lesson.terms);
  assert.equal(readingRegion({chapter:2,side:'left',u:500/1100,v:360/1500,lesson}).region,'prediction','inverted input must resolve the lower printed block, not the intro');
});

test('prediction keeps the chosen option without exposing a hidden explanation',()=>{
  const prediction=at(500,1100,{prediction:1});
  assert.equal(prediction.region,'prediction');assert.equal(prediction.selected,1);
  assert.deepEqual(prediction.options,lesson.options);assert.equal(prediction.answer,undefined);
  assert.ok(!JSON.stringify(prediction).includes(lesson.answer));
  assert.equal(at(500,1100,{prediction:99}).selected,-1);
});

test('closed flap and covered paper never leak the answer; only revealed paper supplies it',()=>{
  for(const surface of ['page','flap']){
    const closed=at(500,1300,{surface,flapOpen:false});
    assert.equal(closed.region,'explanation-cover');
    assert.equal(closed.answer,undefined);assert.ok(!JSON.stringify(closed).includes(lesson.answer));
  }
  assert.equal(at(500,1300,{surface:'answer',flapOpen:false}),null);
  for(const surface of ['page','answer']){
    const opened=at(500,1300,{surface,flapOpen:true});
    assert.equal(opened.region,'explanation');assert.equal(opened.answer,lesson.answer);
  }
  const raisedCover=at(500,1300,{surface:'flap',flapOpen:true});
  assert.equal(raisedCover.answer,undefined,'the raised cover is not the printed answer underneath');
});

test('challenge margin and right-page caption stay separate from predictions and apparatus',()=>{
  const challenge=at(150,1230,{complete:true});
  assert.equal(challenge.region,'challenge');assert.equal(challenge.completed,true);
  assert.deepEqual(challenge.paragraphs,[lesson.challenge]);
  const caption=at(500,1290,{side:'right'});
  assert.equal(caption.region,'caption');assert.deepEqual(caption.paragraphs,[lesson.caption,lesson.instruction]);
  assert.equal(at(500,560,{side:'right'}),null,'the apparatus area has no printed text card');
  assert.equal(at(500,1290,{side:'right',surface:'object'}),null,'a model hit must not expose a page caption beneath it');
  assert.equal(at(500,1290,{chapter:1,side:'right'}).region,'caption');
  assert.equal(at(500,1240,{chapter:1,side:'right'}),null,'lesson one caption is printed lower on the page');
});

test('printed block edges are stable under floating-point UV conversion',()=>{
  assert.equal(at(314,485).region,'formula');
  assert.equal(at(500,649.99).region,'formula');
  assert.equal(at(500,650),null);
  assert.equal(at(985,560),null);
  assert.equal(at(313.99,560),null);
  assert.equal(at(314,680).region,'terms');
  assert.equal(at(500,940),null);
  assert.equal(at(500,960).region,'prediction');
  assert.equal(at(500,1200).region,'explanation-cover');
});

test('blank gutters, region gaps and malformed hits do not invent reading content',()=>{
  assert.equal(at(50,560),null);assert.equal(at(500,475),null);
  assert.equal(at(500,655),null);assert.equal(at(500,950),null);
  assert.equal(at(500,1450),null);
  for(const bad of [{u:-.01},{u:1.01},{v:NaN},{v:Infinity},{side:'other'},{lesson:null},{chapter:0}]){
    assert.equal(at(500,560,bad),null);
  }
  assert.equal(readingRegion(),null);
  assert.equal(at(500,560,{lesson:{title:'未提供公式'}}),null);
  assert.notEqual(at(500,560).key,at(500,560,{chapter:3}).key,'card caches must invalidate across chapters');
});

test('continuous reading follows the lesson order with usable anchors on both pages',()=>{
  const sections=readingSections({chapter:2,lesson});
  assert.deepEqual(sections.map(s=>s.label),['正文','公式','关键词','预测','解释','挑战','图注']);
  assert.deepEqual(sections.map(s=>s.region.region),['intro','formula','terms','prediction','explanation-cover','challenge','caption']);
  assert.deepEqual(sections.map(s=>s.side),['left','left','left','left','left','left','right']);
  assert.equal(new Set(sections.map(s=>s.region.key)).size,7);
  assert.ok(sections.every(({u,v})=>Number.isFinite(u)&&u>0&&u<1&&Number.isFinite(v)&&v>0&&v<1));
  assert.deepEqual(sections[0].region.paragraphs,['小球沿轨道滚下时，高度降低，速度增加。']);
  assert.equal(sections[1].region.formula,lesson.formula);
  assert.deepEqual(sections.at(-1).region.paragraphs,[lesson.caption,lesson.instruction]);
});

test('continuous reading carries chapter, prediction and exploration state',()=>{
  for(const chapter of [1,2,3]){
    const sections=readingSections({chapter,lesson,prediction:2,complete:true});
    assert.ok(sections.every(s=>s.region.key.startsWith(chapter+':')));
    assert.equal(sections.find(s=>s.label==='预测').region.selected,2);
    const challenge=sections.find(s=>s.label==='挑战').region;
    assert.equal(challenge.completed,true);assert.equal(challenge.title,'已探索 · 再试一次');
    assert.equal(sections.at(-1).region.title,'图 '+chapter+' · 上升与下落');
  }
  const idle=readingSections({chapter:2,lesson});
  assert.equal(idle.find(s=>s.label==='预测').region.selected,-1);
  assert.equal(idle.find(s=>s.label==='挑战').region.completed,false);
  assert.ok(readingSections({chapter:1,lesson}).at(-1).v<idle.at(-1).v,'the first lesson caption sits lower on its printed page');
});

test('opening and closing the explanation preserves navigation without leaking the answer',()=>{
  const closed=readingSections({chapter:2,lesson}),opened=readingSections({chapter:2,lesson,flapOpen:true});
  const navigation=sections=>sections.map(({label,side,u,v})=>({label,side,u,v}));
  assert.deepEqual(navigation(closed),navigation(opened));
  assert.ok(!JSON.stringify(closed).includes(lesson.answer));
  const explanation=opened.find(s=>s.label==='解释').region;
  assert.equal(explanation.region,'explanation');assert.equal(explanation.answer,lesson.answer);
  assert.ok(!JSON.stringify(readingSections({chapter:2,lesson,flapOpen:false})).includes(lesson.answer),'closing again must discard the revealed answer');
});

test('missing optional lesson content is skipped without leaving empty reading stops',()=>{
  const sparse={title:'简略样章',intro:[],formula:' ',sub:'没有公式的说明',terms:[],question:' ',options:['孤立选项'],challenge:'',caption:'',instruction:'只有操作提示'};
  for(const flapOpen of [false,true]){
    const sections=readingSections({chapter:2,lesson:sparse,flapOpen});
    assert.deepEqual(sections.map(s=>s.label),['图注']);
    assert.deepEqual(sections[0].region.paragraphs,['只有操作提示']);
    assert.deepEqual(readingSections({chapter:2,lesson:{title:'空章'},flapOpen}),[]);
  }
  const answerOnly={answer:'仅有解释的内容'};
  assert.deepEqual(readingSections({chapter:2,lesson:answerOnly}).map(s=>s.label),['解释']);
  assert.deepEqual(readingSections({chapter:2,lesson:answerOnly,flapOpen:true}).map(s=>s.label),['解释']);
  assert.deepEqual(readingSections(),[]);
  assert.deepEqual(readingSections({chapter:0,lesson}),[]);
  assert.deepEqual(readingSections({chapter:2,lesson:null}),[]);
});
