import {ProgramBuilder,sfxTrack,audioFadeOutAndStop,instruction} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {parseProgram} from 'galbox-sdk/protocol';
import type {Asset} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {createPlayer,createHttpProvider} from 'galbox-sdk/player';
import {prepareBackupRestore} from 'galbox-sdk/backups';

function sourceProgram(asset:Asset){
 if(asset.kind!=='audio')throw new Error('Audio asset required');
 const b=new ProgramBuilder({gameId:'packed-audio-sources',release:'v1',entry:'main'}),sound=b.asset('audio',{...asset,id:'tone'}),a=b.sfxBuffer('ambient'),other=b.sfxBuffer('effect');
 return b.function({id:'main',entry:'a',layout:1,params:[],locals:[],returns:'void',code:[sfxTrack('a','a',sound,a,{loop:true,restore:'replay'}),sfxTrack('b','b',sound,other,{gain:.8,loop:true,restore:'replay'}),audioFadeOutAndStop('fade','fade','a',1200),instruction('text.page',{at:'page',textId:'page',revision:'v1',speaker:'',content:'Packed source envelopes'}),instruction('control.end',{at:'end'})]}).build();
}
export function verifySourceCore():void {
 const p=sourceProgram({id:'tone',kind:'audio',path:'tone.wav',mime:'audio/wav',sha256:'0'.repeat(64)}),c=createCore(p);c.run(100);c.accept({type:'tick',ms:600});
 const saved=decodeWire('Snapshot',encodeWire('Snapshot',c.capture())),r=createCore(p,undefined,saved);r.accept({type:'tick',ms:600});
 if(r.capture().tasks.find(t=>t.name==='a')?.status!=='cancelled'||r.capture().tasks.find(t=>t.name==='b')?.status!=='running')throw new Error('Packed source restore crossed buffers');
}
export async function verifySourcePlayer(mount:HTMLElement,input:unknown):Promise<void> {
 const asset=parseProgram(input).assets.find(a=>a.kind==='audio');if(!asset)throw new Error('Packed sound fixture');const p=sourceProgram(asset),player=await createPlayer({program:p,provider:createHttpProvider(p,location.href),mount,saveCompatibilitySeries:'source-consumer',graphics:{renderer:'canvas'}});
 async function until(predicate:()=>boolean){const end=performance.now()+4000;while(!predicate()){if(performance.now()>end)throw new Error('Packed source envelope timeout');await new Promise<void>(resolve=>setTimeout(resolve,20));}}
 try{await player.start();await until(()=>(player.capture().tasks.find(t=>t.name==='a')?.gain??1)<.95);player.setPaused(true);await player.save('mid');const saved=player.capture();await player.load('mid');const restored=player.capture(),old=saved.tasks.find(t=>t.name==='a'),fresh=restored.tasks.find(t=>t.name==='a');if(!old||!fresh||old.id!==fresh.id||fresh.attempt!==old.attempt+1||fresh.gain!==old.gain||player.getSnapshot().media.active!==2)throw new Error('Packed source activation identity');
  const plan=prepareBackupRestore(await player.exportBackup(),{program:p,series:'source-consumer'}),receipt=await player.commitBackupRestore(plan),slot=receipt.slots[0];if(!slot)throw new Error('Packed source backup slot');await player.load(slot.restoredSlot);if(player.getSnapshot().media.active!==2||player.capture().tasks.find(t=>t.name==='fade')?.sourceFade?.source!==old.id)throw new Error('Packed source backup closure');
  player.setPaused(false);await until(()=>player.capture().tasks.find(t=>t.name==='a')?.status==='cancelled');if(player.getSnapshot().media.active!==1||player.capture().tasks.find(t=>t.name==='b')?.status!=='running')throw new Error('Packed bound stop affected peer source');}finally{player.dispose();}
 if(mount.querySelector('canvas')||player.getSnapshot().media.active)throw new Error('Packed source cleanup');
}
