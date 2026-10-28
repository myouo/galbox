import {canonicalWireJSON,ensure} from './index.js';
import type {Program,Snapshot,Task} from './index.js';
import {ease} from './stage.js';

export function audioSlot(task:Pick<Task,'channel'|'buffer'>):string {
 return task.buffer===undefined?task.channel??'':`${task.channel}:${task.buffer}`;
}
export function audioSourcesSignature(program:Program):string {
 return canonicalWireJSON({version:1,buffers:program.sfxBuffers??[]});
}
export function settleSourceFades(snapshot:Snapshot):void {
 if(snapshot.audioSourcesSignature===undefined)return;
 for(const fade of snapshot.tasks)if(fade.kind==='audio-source-fade'&&fade.status==='running'){
  const source=snapshot.tasks.find(t=>t.id===fade.sourceFade?.source);
  ensure(source?.kind==='media','AUDIO_SOURCE','Missing bound source');
  if(source.status==='superseded'||source.status==='failed')fade.status=source.status;
  else if(source.status==='completed'||source.status==='cancelled')fade.status='cancelled';
 }
}
export function supersedeSourceFades(snapshot:Snapshot,channel:Task['channel']):void {
 const ids=new Set(snapshot.tasks.filter(t=>t.channel===channel).map(t=>t.id));
 for(const t of snapshot.tasks)if(t.kind==='audio-source-fade'&&t.status==='running'&&t.sourceFade&&ids.has(t.sourceFade.source))t.status='superseded';
}
export function tickSourceFades(snapshot:Snapshot,ms:number):Task[] {
 if(snapshot.audioSourcesSignature===undefined)return [];
 settleSourceFades(snapshot);const stopped:Task[]=[];
 for(const task of snapshot.tasks)if(task.kind==='audio-source-fade'&&task.status==='running'){
  const fade=task.sourceFade,source=snapshot.tasks.find(t=>t.id===fade?.source);
  ensure(fade&&source?.mediaTask,'AUDIO_SOURCE','Missing source envelope');
  task.elapsed=Math.min(task.duration,task.elapsed+ms);const fraction=ease(fade.easing,task.elapsed/task.duration);
  source.gain=fraction===1?fade.to:fade.from+(fade.to-fade.from)*fraction;
  if(task.elapsed===task.duration){task.status='completed';if(fade.stop){source.status='cancelled';source.mediaTask.phase='cancelled';stopped.push(source);}}
 }
 return stopped;
}
