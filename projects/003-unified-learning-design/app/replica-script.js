export const tourSteps = [
 {id:'types',chapter:1,title:'先看这杯热饮',shot:'cup',action:'cup',auto:true,text:'先不用找按钮，跟着镜头看这杯热饮。它比周围温度高，可以通过传热把能量传给环境。我们用橙色，标记内能这一种储存方式。',cta:'继续认识能量瓶'},
 {id:'legend',chapter:1,title:'瓶子是图例，不是真容器',shot:'jars',text:'这一页的瓶子只表示能量的类型。没有质量、速度和温度等条件，我们不能随意给物体填写多少焦耳。下面让小球动起来，看看可以计算的能量变化。',cta:'去做小球实验'},
 {id:'ramp-ready',chapter:2,title:'先预测，再松手',shot:'ramp',action:'ramp-clean',text:'小球已经放在高处。这次忽略耗散，让实心球无滑动地滚动。先选一个预测：到最低处时，小球会怎样？再松开验证。',question:{prompt:'最低处的小球会怎样？',options:['动能最大','完全静止','全转成内能'],correct:0},cta:'松开，验证我的预测'},
 {id:'ramp-bottom',chapter:2,title:'最低处，动能最大',shot:'ramp-ball',action:'ramp-release-clean',checkpoint:'bottom',text:'小球下降时，重力势能变成动能。到最低点，动能最大。小球既在前进，也在转动。忽略耗散时，势能与动能的总量保持不变。',cta:'加入耗散，再做一次',cues:[
  {id:'ramp-bottom-1',text:'先看小球滚下来。下降时，它的重力势能减少，运动逐渐变快。我们在最低点附近停住。',shot:'ramp-ball',target:'ball',nextLabel:'看动能瓶'},
  {id:'ramp-bottom-2',text:'现在看蓝色的动能瓶。到最低处，动能最大。小球既在前进，也在转动，蓝色数值包含这两部分。',shot:'ramp-energy',target:'kinetic',waitFor:'bottom',nextLabel:'核对能量总量'},
  {id:'ramp-bottom-3',text:'再看能量总量。紫色的势能转成蓝色的动能，总量没有变。把这个结果与你刚才的预测对照一下。',shot:'ramp-total',target:'total',waitFor:'bottom'}
 ]},
 {id:'ramp-loss',chapter:2,title:'加入耗散，重新对照',shot:'ramp-ball',action:'ramp-loss',checkpoint:'loss',text:'回到相同起点，加入速度正比阻力。机械能减少，内能增加，包含内能的总量保持不变。理想无滑动滚动所需的静摩擦不等于这份耗散。',cta:'去看弹簧发射',cues:[
  {id:'ramp-loss-1',text:'回到同一个起点。这次加入随速度增大的阻力，再让小球滚动。看看它还能回到同样的高度吗？',shot:'ramp-ball',target:'ball',nextLabel:'看能量去了哪里'},
  {id:'ramp-loss-2',text:'看橙色的内能瓶。小球越滚越低，减少的机械能进入内能。这里的阻力是耗散项，不能把理想静摩擦直接当作损失。',shot:'ramp-energy',target:'thermal',waitFor:'loss',nextLabel:'再次核对总量'},
  {id:'ramp-loss-3',text:'把势能、动能和内能一起计算，总量仍保持一致。改变的是能量存放的方式，并不是能量消失了。',shot:'ramp-total',target:'total',waitFor:'loss'}
 ]},
 {id:'spring-ready',chapter:3,title:'压缩，意味着先做功',shot:'spring',target:'elastic',action:'spring-ready',text:'现在压缩弹簧。弹性势能与压缩量的平方成正比。松开后，弹簧先在槽内推动小球；离开发射口后，小球才做抛体运动。按下松开发射。',cta:'松开发射'},
 {id:'spring-apex',chapter:3,title:'最高点，也没有完全静止',shot:'spring',action:'spring-release',checkpoint:'apex',text:'先看弹簧推动小球，再看它离开发射口。我们停在最高点附近。此时竖直速度接近零，水平方向仍有速度，所以动能还没有变成零。这里忽略空气阻力。',cta:'继续下落'},
 {id:'spring-land',chapter:3,title:'落地之后，能量去了哪里？',shot:'spring',action:'resume',checkpoint:'landed',auto:true,text:'继续观察下落。小球落到软垫后，着地动能转成内能。软垫还高于底座，所以仍保留一小部分重力势能。这里按完全非弹性接触处理，忽略单独的声能分配。',cta:'完成这次观察'},
 {id:'outro',chapter:3,title:'用一个小实验，检验你的理解',shot:'spring',target:'elastic',action:'spring-challenge-small',text:'先以零点一八米为起点。把压缩量加倍到零点三六米，初始弹性势能会变成几倍？请先选择，再对照能量瓶的变化。',question:{prompt:'压缩量加倍，弹性势能变几倍？',options:['2倍','4倍','8倍'],correct:1,resetOnEnter:true,reveal:true,compareAction:'spring-challenge-large'},cta:'自己改变条件，再试一次'}
];

// Voice generation uses this list so each short cue has its own local WAV.
export const narrationClips = tourSteps.flatMap(step=>step.cues||[{id:step.id,text:step.text}]);

export const storeDescriptions=[
 '运动的物体具有动能；车轮的转动也具有转动动能。',
 '抬高的书与地球组成的系统具有重力势能，取决于质量和相对高度。',
 '被压缩或拉伸的弹簧具有弹性势能；未形变时不能凭空标注这份能量。',
 '热饮可以向更冷的环境传热。温度并不等于内能的数值。',
 '电池中化学变化可以向外提供能量；单凭外观不能知道剩余能量。',
 '磁体及磁场构成的系统可以储存能量，具体数值取决于状态与配置。',
 '这里表示带电气球及周围电场。普通未带电气球不能直接当作静电能的例子。',
 '太阳的能量主要来自核聚变；这只是来源示意，不是可操作的核反应模拟。'
];
