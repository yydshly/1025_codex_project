// Visual cues for the existing three spoken terrain chapters.
const pre = [
 {at:0,mode:'pre',spot:'crater',angle:'oblique',mark:'sample',title:'斜看海底火山',detail:'青线穿过火山口。沿两侧坡面往中间看，亮圈指向同一个测深点。'},
 {at:.48,mode:'pre',spot:'crater',angle:'top',mark:'rim',title:'从上方辨认火山口的边缘',detail:'两个圈标出东西向剖面穿过的高点。'},
 {at:.77,mode:'pre',spot:'crater',angle:'oblique',mark:'sample',panel:'depth',title:'记住这个测点',detail:'左侧显示喷发前水深约 82 米。接下来会用同一个位置做比较。'},
];
const crater = [
 {at:0,mode:'change',spot:'crater',angle:'oblique',mark:'sample',panel:'colors',title:'火山口里，哪里加深了？',detail:'暖色表示加深，蓝色表示变浅。亮圈仍是刚才的测点。'},
 {at:.28,mode:'section',spot:'crater',angle:'side',mark:'span',panel:'depth',title:'侧看同一点的落差',detail:'竖线连接两期测得的高度。水深从 82.1 米增至 856.5 米。'},
 {at:.55,mode:'change',spot:'crater',angle:'oblique',mark:'sample',panel:'profile',title:'沿右图光标核对 774.4 米',detail:'剖面下的色带与三维地形用同一把色标。'},
 {at:.82,mode:'change',spot:'crater',angle:'oblique',mark:'gap',title:'灰纹是缺测区',detail:'标记处缺少喷发后测深。两期都有记录的格点才计算差值。'},
];
const slopes = [
 {at:0,mode:'section',spot:'west',angle:'side',mark:'sample',panel:'profile',title:'西坡测点，两期曲线很接近',detail:'左边是两期水深，右边的光标对准西坡。两期差值为变浅 8.1 米。'},
 {at:.46,mode:'section',spot:'east',angle:'side',mark:'sample',panel:'profile',title:'沿同一剖面移到东坡',detail:'东坡测点的两期差值为变浅 6.7 米。'},
 {at:.73,mode:'change',spot:'east',angle:'oblique',mark:'sample',title:'把坡面和火山口放在一起看',detail:'坡面小差值也可能包含测量或配准误差，火山口的加深幅度更明显。'},
];

export function hungaLessonBeat(cue,progress){
 if(cue.route!=='dynamic-volcano'||!cue.terrain)return null;
 const beats=cue.terrain==='pre'?pre:cue.spot==='crater'?crater:slopes;
 return beats.findLast(beat=>progress>=beat.at)??beats[0];
}
