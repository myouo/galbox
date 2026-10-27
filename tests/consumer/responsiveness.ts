import {Core} from 'galbox-sdk/core';
import {createPlayer} from 'galbox-sdk/player';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {i32} from 'galbox-sdk/protocol';
import {MemoryStore} from 'galbox-sdk/testing';

export async function verifyWebResponsiveness(mount:HTMLElement):Promise<void> {
 const program=new ProgramBuilder({gameId:'packed-responsive',release:'v1',entry:'main'})
  .global({id:'n',kind:'i32',initial:i32(0)})
  .function({id:'main',entry:'intro',layout:1,params:[],locals:[],returns:'void',code:[
   instruction('text.page',{at:'intro',textId:'intro',revision:'v1',speaker:'澪',content:'开始'}),
   ...Array.from({length:3000},(_,i)=>instruction('value.set',{at:`work:${i}`,dest:'n',value:{literal:i32(i)}})),
   instruction('text.page',{at:'done',textId:'done',revision:'v1',speaker:'澪',content:'完成'}),instruction('control.end',{at:'end'})
  ]}).build();
 const player=await createPlayer({program,provider:{async acquire(){throw new Error('No assets');}},mount,store:new MemoryStore(),saveCompatibilitySeries:'responsive',graphics:{renderer:'canvas'},budget:1});
 const original=Core.prototype.run;let scheduled=false,timerDuring=false,rafDuring=false,saveRejected=false;
 try {
  await player.updatePreferences({text:{intervalMs:0}});await player.start();const wait=player.capture().wait;
  if(wait?.kind!=='text')throw new Error('Packed initial prompt missing');
  // Probe the actual packaged Core; no mock interpreter or replacement scheduler.
  Core.prototype.run=function(...args){const result=original.apply(this,args);if(result==='yield'&&!scheduled){scheduled=true;const core=this;setTimeout(()=>{timerDuring=core.view().run.status==='running';try{player.capture();}catch(e){saveRejected=String(e).includes('BUDGET_CONTINUATION');}},0);requestAnimationFrame(()=>{rafDuring=core.view().run.status==='running';});}return result;};
  await player.input('advance',wait.prompt,player.getSnapshot().epoch);
  if(!timerDuring||!rafDuring||!saveRejected||player.capture().globals.n?.value!==2999||player.capture().history.length!==1)throw new Error('Packed Web task responsiveness or semantic cut failed');
  await player.save('after-work');await player.load('after-work');
  if(player.capture().wait?.at!=='done'||player.capture().globals.n?.value!==2999)throw new Error('Packed indexed snapshot restore failed');
 }finally{Core.prototype.run=original;player.dispose();}
 if(mount.querySelector('canvas'))throw new Error('Packed responsive Player leaked canvas');
}
