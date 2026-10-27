import {createPlayer,createHttpProvider} from 'galbox-sdk/player';
import {loadingPolicy} from 'galbox-sdk/port-kit';
import {parseProgram} from 'galbox-sdk/protocol';
import {MemoryStore} from 'galbox-sdk/testing';
export async function verifyLoadingPolicies(mount:HTMLElement,input:unknown,release:unknown):Promise<void> {
 const p=parseProgram(input);
 if(false){
  // @ts-expect-error the packed factory exposes a finite policy union
  loadingPolicy({mode:'offline-install'});
 }
 for(const mode of ['eager','demand','balanced','chapter'] as const){const player=await createPlayer({program:p,release,mount,provider:createHttpProvider(p,location.href),store:new MemoryStore(),saveCompatibilitySeries:'consumer',graphics:{renderer:'canvas'},loading:loadingPolicy({mode,concurrency:2,maxResidentBytes:33554432,lookahead:1,...(mode==='chapter'?{chapters:[{id:'sample',functions:[p.entry,...p.functions.filter(f=>f.id!==p.entry).map(f=>f.id)],assets:p.assets.map(a=>a.id)}]}:{})})});
  try{if(mode!=='eager'&&player.getSnapshot().resources.assets!==0)throw new Error('Packed deferred creation fetched the entire story');await player.updatePreferences({text:{intervalMs:0}});await player.start();const w=player.capture().wait;if(w?.kind!=='text')throw new Error('Packed loading prompt');await player.input('advance',w.prompt,player.getSnapshot().epoch);const before=player.capture();await player.save('loading');await player.load('loading');const after=player.capture();if(after.text?.textId!==before.text?.textId||JSON.stringify(after.globals)!==JSON.stringify(before.globals)||player.getSnapshot().loading.phase!=='idle')throw new Error('Packed loading restore changed the cut');}finally{player.dispose();}
 }
 if(mount.querySelector('canvas'))throw new Error('Packed loading resources leaked');
}
