import {decodeWire} from 'galbox-sdk/wire';
import {createModulePlayer,createHttpModuleProvider,createHttpProvider} from 'galbox-sdk/player';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {MemoryStore} from 'galbox-sdk/testing';
export async function verifyProgramModules(mount:HTMLElement):Promise<void> {
 const manifest=decodeWire('ModuleManifest',new Uint8Array(await(await fetch('./modules/manifest.pb')).arrayBuffer())),source=createModuleProgram(manifest),base=new URL('./modules/',location.href).href,provider=createHttpModuleProvider(source,base),requests:string[]=[],store=new MemoryStore();
 if(false){
  // @ts-expect-error module factory requires its registered source, not a plain DTO
  createModulePlayer({program:{},moduleProvider:provider,provider:createHttpProvider(source,base),mount,saveCompatibilitySeries:'1'});
 }
 const player=await createModulePlayer({program:source,moduleProvider:{async acquire(r,s){requests.push(r.module.id);return provider.acquire(r,s);}},provider:createHttpProvider(source,base),mount,store,saveCompatibilitySeries:'1',graphics:{renderer:'canvas'}});
 try{await player.updatePreferences({text:{intervalMs:0}});await player.start();let w=player.capture().wait;if(w?.kind!=='text')throw new Error('Packed module intro');await player.input('advance',w.prompt,player.getSnapshot().epoch);w=player.capture().wait;if(w?.kind!=='choice')throw new Error('Packed module choice');await player.input('choose',w.prompt,player.getSnapshot().epoch,'shore');await player.save('module');w=player.capture().wait;if(w?.kind!=='text')throw new Error('Packed module shore');await player.input('advance',w.prompt,player.getSnapshot().epoch);if(player.capture().globals.n?.value!==42||source.has('interior')||requests.join(',')!=='root,sea,logic')throw new Error('Packed code demand loading failed');}finally{player.dispose();}
 const fresh=createModuleProgram(manifest),restored=await createModulePlayer({program:fresh,moduleProvider:createHttpModuleProvider(fresh,base),provider:createHttpProvider(fresh,base),mount,store,saveCompatibilitySeries:'1',graphics:{renderer:'canvas'}});try{await restored.load('module');if(restored.capture().frames.length!==2||restored.capture().text?.textId!=='shore'||fresh.has('logic')||fresh.has('interior'))throw new Error('Packed code restore loaded the wrong closure');}finally{restored.dispose();}
}
