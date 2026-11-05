import {createCore} from 'galbox-sdk/core';
import {historyPolicy} from 'galbox-sdk/player';
import {HistoryJournal,MemoryStore} from 'galbox-sdk/testing';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import type {Program} from 'galbox-sdk/protocol';
export function verifyBacklogDisplay(program:Program){
 const c=createCore(program);c.accept({type:'history.session',id:'packed-backlog'});c.accept({type:'text.preferences',value:{intervalMs:0}});for(let n=0;n<2100;n++){c.run(100);const w=c.view().run.wait;if(w?.kind!=='text'||w.at!=='body')throw new Error('packed backlog body');c.accept({type:'advance',prompt:w.prompt,inputId:'packed-'+n});}c.run(100);const cut=c.capture(),cold=createCore(program,c.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))),policy=historyPolicy({maxEntries:8,maxDisplayEntries:2048,rollback:false}),journal=new HistoryJournal(policy,{revision:0,entries:[]},'main',null,'packed',new MemoryStore()),rows=journal.items(cold.view().run.history,true,null);
 if(rows.length!==2048||rows[0]?.text.content!=='Entry 52'||rows.at(-1)?.text.content!=='Entry 2099'||rows.some(r=>r.canRollback))throw new Error('packed backlog display');if(decodeWire('HistoryPolicy',encodeWire('HistoryPolicy',policy)).maxDisplayEntries!==2048)throw new Error('packed backlog wire');let refused=false;try{historyPolicy({maxEntries:65,maxDisplayEntries:2048});}catch{refused=true;}if(!refused)throw new Error('packed checkpoint bound');return rows.length;
}
