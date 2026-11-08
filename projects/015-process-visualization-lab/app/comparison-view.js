import {formatTime} from './real-event-data.js';

const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const shortTime=time=>formatTime(time).replace(/^\d+年/,'').replace('（北京时间 UTC+8）',' UTC+8');
const approximate=value=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:1,useGrouping:false}).format(value);
function valueMarkup(value,unit,derived=false){
 if(value===null)return '<span class="comparison-missing">未报告</span>';
 return `<span class="comparison-value">${derived?'约':''}${escape(derived?approximate(value):value)}</span><small class="comparison-unit"> ${unit}</small>`;
}
function deltaMarkup(value,unit,derived=false){
 if(value===null)return '<span class="comparison-missing">无法计算</span>';
 const label=value===0?'0':`${value>0?'+':'−'}${derived?approximate(Math.abs(value)):Math.abs(value)}`;
 return `<span class="comparison-delta">${derived?'约':''}${escape(label)}</span><small class="comparison-unit"> ${unit}</small>`;
}

/** Pure markup only; colors, layout and actions are owned by the caller. */
export function comparisonMarkup(comparison){
 const {a,b}=comparison;
 const reference=comparison.provenance?.reference?.label||'香港参照点';
 const state=comparison.elapsedHours===0?'same':comparison.elapsedHours<0?'reverse':'forward';
 const note=state==='same'?'A与B为同一时刻，请另选一个时刻比较。':state==='reverse'?'B早于A；以下仅比较数值，变化按B−A计算。':'变化按B−A计算；负值表示B小于A。';
 const row=(title,definition,av,bv,change,unit,derived=false)=>`<tr class="comparison-row"><th scope="row" class="comparison-metric">${escape(title)}<small class="comparison-definition">${escape(definition)}</small></th><td class="comparison-a">${valueMarkup(av,unit,derived)}</td><td class="comparison-b">${valueMarkup(bv,unit,derived)}</td><td class="comparison-change">${deltaMarkup(change,unit,derived)}</td></tr>`;
 return `<section class="comparison-panel" data-comparison-order="${state}" aria-label="真实记录A与B比较">
 <div class="comparison-times"><div class="comparison-time comparison-a"><span class="comparison-mark">A</span><time datetime="${escape(a.timeUtc)}">${escape(shortTime(a.timeUtc))}</time></div><div class="comparison-time comparison-b"><span class="comparison-mark">B</span><time datetime="${escape(b.timeUtc)}">${escape(shortTime(b.timeUtc))}</time></div></div>
 <p class="comparison-order-note">${note}</p>
 <div class="comparison-table-wrap"><table class="comparison-table"><thead><tr><th scope="col">指标</th><th scope="col" class="comparison-a">A</th><th scope="col" class="comparison-b">B</th><th scope="col">变化 B−A</th></tr></thead><tbody>${row('中心最大持续风速','kt · 10分钟平均',a.windKt,b.windKt,comparison.windChangeKt,'kt')}${row('中心气压','hPa',a.pressureHpa,b.pressureHpa,comparison.pressureChangeHpa,'hPa')}${row('距'+reference,'km · 坐标计算值',comparison.referenceDistanceAKm,comparison.referenceDistanceBKm,comparison.referenceDistanceChangeKm,'km',true)}</tbody></table></div>
 <div class="comparison-actions"><button type="button" class="comparison-button comparison-pin" data-compare-action="pin">将当前设为A</button><button type="button" class="comparison-button comparison-preset" data-compare-action="preset">对比9/14→9/16</button></div>
 <p class="comparison-method-note">距离由中心坐标计算，不代表香港当地风速或影响范围。</p>
 </section>`;
}
