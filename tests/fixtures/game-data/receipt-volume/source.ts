import {databaseState,commitProgress} from '../../../../packages/galbox-sdk/src/runtime/durable.js';
import {i32} from '../../../../packages/galbox-sdk/src/protocol/index.js';
export function volumeBatch(n:number){return {id:'session-7e77702d-e2ce-44e7-ac43-8de292cbabf6:p'+n,baseRevision:n,through:n+1,changes:[{seq:n+1,type:'set' as const,key:'count',value:i32(n)}]};}
/** Reachable production-reducer state; generating it does not bypass public-store mutations under test. */
export function receiptVolume(count:number,readCount=0){const state=databaseState();for(let n=0;n<count;n++)commitProgress(state,volumeBatch(n),null);let seq=count;for(let n=0;n<readCount;n+=1000){const changes=Array.from({length:Math.min(1000,readCount-n)},(_,i)=>({seq:++seq,type:'read' as const,unit:'historical-'+String(n+i).padStart(6,'0')+'-'+'x'.repeat(32)+'@revision-v1'}));commitProgress(state,{id:'history-'+n,baseRevision:state.profile.revision,through:seq,changes},null);}return state;}
