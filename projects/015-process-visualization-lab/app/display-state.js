import {compute} from './models.js';
// A shared, deterministic presentation cursor. Each theme keeps its own units.
export const OVERVIEW_LOOPS={volcano:[.68,1],quake:[.55,1.65],typhoon:[.5,.7],river:[.46,1.2]};
export function getOverviewStates(progress=0){
 const p=Math.max(0,Math.min(1,Number(progress)||0));
 return Object.fromEntries(Object.entries(OVERVIEW_LOOPS).map(([id,[offset,cycles]])=>{const t=(offset+p*cycles)%1;return [id,{id,progress:t,data:compute(id,t)}];}));
}
