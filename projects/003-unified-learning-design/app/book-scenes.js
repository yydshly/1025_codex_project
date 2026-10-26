const seed = (scale = 1) => `<g class="seed-identity" transform="translate(250 310) scale(${scale})"><path d="M-16 1C-20-11-7-23 10-20 24-16 23-1 12 7 1 16-11 13-16 1Z" fill="#bd9654" stroke="#8c753d" stroke-width="1.1"/><path d="M-7-13C2-15 12-10 15-3" fill="none" stroke="#ead8a7" stroke-width="2.2" stroke-linecap="round"/><path d="M-12 4C-4 0 4-4 9-15" fill="none" stroke="#8e7b47" stroke-width=".7"/><path d="M-11 7 2 2M-5 10 7 5" fill="none" stroke="#a48545" stroke-width=".5"/></g>`;

function flower() {
  const petals = Array.from({ length: 12 }, (_, index) => `<g transform="rotate(${index * 30} 250 105)"><path d="M244 95C230 82 229 54 242 49 258 42 270 70 256 96Z" fill="${index % 2 ? '#ede0b0' : '#e8d79b'}" stroke="#a79a62" stroke-width=".9"/><path d="M249 91 245 59M252 84 254 62M243 80 238 64" stroke="#bfb075" stroke-width=".45" fill="none"/></g>`).join('');
  const dots = Array.from({ length: 28 }, (_, index) => {
    const radius = 2 + Math.sqrt(index) * 2.3;
    const angle = index * 2.399;
    return `<circle cx="${250 + Math.cos(angle) * radius}" cy="${105 + Math.sin(angle) * radius}" r=".9" fill="#735f34"/>`;
  }).join('');
  return `<g class="flower-head">${petals}<circle cx="250" cy="105" r="17.5" fill="#b68e43" stroke="#8d7a3e" stroke-width="1"/>${dots}<circle cx="244" cy="98" r="4" fill="#d6bc72" opacity=".35"/></g>`;
}

export function botanical(stage = 0, light = 60) {
  const ratio = light / 100;
  const stemScale = stage === 0 ? 0 : stage === 1 ? .66 : .42 + ratio * .58;
  const bloomScale = stage < 2 ? 0 : .12 + ratio * .88;
  const leafScale = stage === 1 ? .78 : .52 + ratio * .48;
  const ghost = stage === 0 ? `<g class="ghost-plant"><path d="M250 306C235 269 258 236 248 202 240 171 257 146 250 105"/><path d="M249 246C222 247 203 230 197 207 228 208 244 219 249 246ZM249 205C272 206 300 181 305 157 277 161 256 178 249 205Z"/><circle cx="250" cy="105" r="40"/><circle cx="250" cy="105" r="22"/></g>` : '';
  let callouts;
  if (stage === 0) callouts = `<path d="M288 292 332 255H392" fill="none" stroke="#b4b397" stroke-width=".9"/><circle cx="289" cy="292" r="2" fill="#ae9463"/><text x="334" y="244" class="diagram-serif">一颗想法</text><text x="334" y="272" class="diagram-text">贯穿全书的主题</text><text x="98" y="127" class="diagram-text">故事会从这里，慢慢展开</text><path d="M153 145C119 195 155 257 209 288" class="ghost-plant"/>`;
  else if (stage === 1) callouts = `<path d="M242 309 177 330H104" fill="none" stroke="#b4b397" stroke-width=".8"/><text x="104" y="347" class="diagram-text">上一页的种子，仍然在这里</text><path d="M283 215 332 181H403" fill="none" stroke="#b4b397" stroke-width=".8"/><circle cx="283" cy="215" r="2" fill="#91a16c"/><text x="337" y="169" class="diagram-serif">新的联系</text><text x="337" y="197" class="diagram-text">沿着同一个主题生长</text>`;
  else callouts = `<g opacity="${.3 + ratio * .7}"><circle cx="391" cy="67" r="16" fill="#dcc68e" opacity=".25"/><circle cx="391" cy="67" r="9" fill="none" stroke="#b59a5b" stroke-width=".9"/><path d="M391 42V35M391 92V99M366 67H359M416 67H423M373 49 368 44M409 49 414 44M373 85 368 90M409 85 414 90" class="seed-ray"/></g><text x="357" y="124" class="diagram-text">光照 · ${light}%</text><path d="M289 289 350 266H405" fill="none" stroke="#b4b397" stroke-width=".8"/><text x="352" y="255" class="diagram-text">同一颗种子</text>`;
  return `<svg class="botanical-scene" viewBox="0 0 500 400" role="img" aria-label="${stage === 0 ? '一颗金色种子，与尚未展开的植物轮廓' : stage === 1 ? '同一颗金色种子长出幼芽，连接上一页与新的关系' : `同一株植物随光照 ${light}% 展开叶片和花朵`}">
    <path d="M73 325 251 247 429 325 251 388Z" fill="#e6e1cb" opacity=".4"/>
    <path d="m82 324 169-69 167 69-167 59Z" fill="none" stroke="#c4c7aa" stroke-width=".65"/><path d="M82 324v5l169 59v-5m167-59v5l-167 59" fill="none" stroke="#bdc0a4" stroke-width=".6"/>
    <ellipse cx="250" cy="323" rx="88" ry="20" class="ground-shadow"/>
    <g fill="none" stroke="#bfc3a7" stroke-width=".5"><ellipse cx="250" cy="316" rx="104" ry="32"/><ellipse cx="250" cy="316" rx="73" ry="22"/><path d="m162 348 175-66m-174-2 174 67" stroke-dasharray="2 5"/></g>
    <path d="M244 323c-10 9-21 17-30 22m32-20 7 29m3-33 24 19" fill="none" stroke="#9c9d79" stroke-width=".6"/>
    ${ghost}
    <g class="botanical-stem" style="--stem:${stemScale};--bloom:${bloomScale};--leaf:${leafScale}">
      <path d="M249 310C238 282 253 251 246 218 240 186 256 155 250 121" fill="none" stroke="#68794c" stroke-width="4" stroke-linecap="round"/><path d="M251 305C245 274 255 251 249 219 245 188 258 154 253 124" fill="none" stroke="#a8ae79" stroke-width="1.3"/>
      <g class="leaf-cluster" fill="#93a472" stroke="#64764a" stroke-width="1.1"><path d="M246 264C220 264 188 239 183 215 215 215 242 235 246 264Z"/><path d="M249 230C278 233 312 205 318 173 283 177 255 200 249 230Z"/><path d="M248 193C225 191 204 169 203 146 230 149 245 166 248 193Z"/><path d="M252 158C273 156 288 140 291 119 271 123 256 137 252 158Z"/><g stroke="#61764c" stroke-width=".6" fill="none"><path d="m245 262-54-39m59 7 59-49m-62 9-35-34m42 1 29-29"/><path d="m224 246-2-13m-12 5-1-12m24 26-4-17m44-26 18-3m-5-10 16-3m-3-9 15-1m-77-8-10-1m-1-10-9-3m41-20 12-2"/></g><path d="M246 264C216 257 199 237 188 219" fill="none" stroke="#d2d6b0" stroke-width="1.3"/><path d="M251 228C274 220 297 197 313 178" fill="none" stroke="#c1cda0" stroke-width="1.2"/></g>
      ${flower()}
    </g>
    ${seed(stage === 0 ? 1.9 : 1)}${callouts}
    <text x="75" y="371" class="figure-number">FIG. 0${stage + 1}</text><path d="M395 352h12m-6-6v12" fill="none" stroke="#a8b18d" stroke-width=".7"/>
  </svg>`;
}

function gear(cx, cy, radius, teeth, className, rotation = 0) {
  const points = Array.from({ length: teeth * 4 }, (_, index) => {
    const angle = index * Math.PI * 2 / (teeth * 4) + rotation;
    const r = index % 4 === 0 || index % 4 === 3 ? radius * .84 : radius;
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(' ');
  return `<g class="${className}" style="transform-origin:${cx}px ${cy}px"><polygon points="${points}" fill="#d4c492" stroke="#7c8465" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${radius * .66}" fill="#dce1cd" stroke="#929a78" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${radius * .15}" fill="#b9924f" stroke="#817344"/><path d="M${cx - radius * .55} ${cy}h${radius * 1.1}M${cx} ${cy - radius * .55}v${radius * 1.1}" stroke="#a2a787" stroke-width=".8"/></g>`;
}

export function worldScene(world, light = 85) {
  if (world === 'botanical') return botanical(2, light);
  if (world === 'mechanical') return `<svg class="botanical-scene mechanical-scene" viewBox="0 0 500 400" role="img" aria-label="机械手稿：一个金色机芯连接三个齿轮，延续核心对象与关联关系"><g fill="none" stroke="#a8b5a1" stroke-width=".5"><path d="M60 280H440M90 90v234m320-234v234M80 200h340" stroke-dasharray="4 6"/><circle cx="250" cy="210" r="130"/><ellipse cx="250" cy="330" rx="139" ry="18"/></g>${gear(250, 218, 79, 14, 'gear-large')}${gear(346, 149, 44, 9, 'gear-small', .1)}${gear(151, 142, 52, 10, 'gear-small reverse', .16)}<g fill="none" stroke="#8a987b" stroke-width=".8"><path d="M251 218 251 302H330M151 142 114 85H65M346 149l38-36h51"/></g><text x="315" y="319" class="diagram-text">同一个核心，连接不同部件</text><text x="66" y="74" class="diagram-text">章节一 · 认识部件</text><text x="361" y="96" class="diagram-text">章节二 · 理解联动</text><circle cx="250" cy="218" r="15" fill="#bc9654" stroke="#877344"/><path d="m243 215 10-7" stroke="#ead8a7" stroke-width="2" stroke-linecap="round"/></svg>`;
  const stars = [[90,100,2],[130,65,1],[178,119,1.8],[314,80,1],[372,96,2],[403,174,1],[332,225,2.4],[388,310,1],[118,291,1.7],[215,330,1],[74,226,1],[275,47,1],[418,70,1],[62,340,1],[295,309,1.8]];
  return `<svg class="botanical-scene cosmos-scene" viewBox="0 0 500 400" role="img" aria-label="星图漫游：同一个金色核心成为星点，连接不同星座与探索路径"><g fill="#d4d6ae">${stars.map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><g fill="none" stroke="#b1bea180" stroke-width=".7"><ellipse cx="250" cy="205" rx="146" ry="101" transform="rotate(-24 250 205)"/><ellipse cx="250" cy="205" rx="108" ry="151" transform="rotate(32 250 205)"/><circle cx="250" cy="205" r="74" stroke-dasharray="2 5"/><path d="m90 100 88 19 72 86 82 20 56 85m-270-19 60-172m154 106 40-129"/></g><g fill="#c7bd83" stroke="#decf94" stroke-width=".7"><circle cx="178" cy="119" r="4"/><circle cx="332" cy="225" r="4"/><circle cx="118" cy="291" r="3"/><circle cx="372" cy="96" r="3"/></g><circle cx="250" cy="205" r="22" fill="#d6bf79" opacity=".1"/><circle cx="250" cy="205" r="11" fill="#c6a660"/><path d="M250 184v-9m0 51v9m-21-30h-9m51 0h9" stroke="#c9b77a" stroke-width=".8"/><g class="star-orbit" style="transform-origin:250px 205px"><circle cx="250" cy="131" r="3" fill="#e1d6a1"/></g><g font-family="serif" font-size="11" fill="#bcc9ad"><text x="152" y="96">认识星点</text><text x="338" y="251">连接星座</text><text x="76" y="321">继续探索</text></g></svg>`;
}
