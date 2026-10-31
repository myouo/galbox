import {ensure,parseRasterEffect,parseRasterTaskState,parseTask,canonicalWireJSON} from './index.js';
import type {Instruction,RasterEffect,RasterTaskState,Snapshot,Program,DeepReadonly,Task} from './index.js';
import {sourceSignature,taskLocks} from './stage.js';
import {freezeJson} from './codecs.js';
export type RasterInstruction=Extract<Instruction,{op:'stage.raster'|'stage.raster.stop'}>;
export function isRasterInstruction(i:Instruction):i is RasterInstruction{return i.op==='stage.raster'||i.op==='stage.raster.stop';}
export function rasterDuration(effect:DeepReadonly<RasterEffect>,delayMs:number,loop:boolean):number {
 ensure(!loop||effect.kind==='film','RASTER_LOOP','Only film has a bounded repeating phase');
 const duration=effect.kind==='film'?effect.periodSteps*effect.intervalMs:Math.ceil(effect.durationMs/effect.intervalMs)*effect.intervalMs;
 ensure(duration>0&&duration+delayMs<=3600000,'RASTER_DURATION','Raster duration exceeds task bound');return duration+delayMs;
}
function clock(m:DeepReadonly<RasterTaskState>,age:number){const cycle=rasterDuration(m.effect,0,false),duration=cycle+m.delayMs;return {elapsed:age<m.delayMs?age:m.loop?m.delayMs+(age-m.delayMs)%cycle:Math.min(age,duration),ended:!m.loop&&age>=duration};}
export function rasterStep(t:DeepReadonly<Task>):number {const m=t.rasterTask;ensure(t.kind==='raster'&&m,'RASTER_STATE','Raster task missing');return m.effect.kind==='film'?Math.max(-1,Math.min(m.effect.kind==='film'?m.effect.periodSteps-1:0,Math.floor((t.elapsed-m.delayMs)/m.effect.intervalMs))):Math.max(0,Math.floor((t.elapsed-m.delayMs)/m.effect.intervalMs));}
export function syncRasters(s:Snapshot):void {for(const t of s.tasks)if(t.kind==='raster'&&t.status==='running'){ensure(t.rasterTask,'RASTER_STATE','Raster task missing');const next=clock(t.rasterTask,s.logicalTime-t.rasterTask.startedAt);t.elapsed=next.elapsed;if(next.ended)t.status='completed';}}
export function pruneRasters(s:Snapshot):void {const ids=new Set(s.stage.flatMap(o=>o.rasterRef?[o.rasterRef]:[]));for(const t of s.tasks)if(t.kind==='raster'&&t.status==='running'&&!ids.has(t.id))t.status='cancelled';}
export function executeRaster(p:Program,s:Snapshot,i:RasterInstruction):void {
 ensure(p.capabilities.includes('stage.raster')&&s.scene,'RASTER_CAPABILITY','Declare raster/stage capabilities');
 if(i.op==='stage.raster.stop'){const t=[...s.tasks].reverse().find(t=>t.name===i.task);ensure(t?.kind==='raster','RASTER_TASK',i.task);if(t.status==='running')t.status='cancelled';return;}
 const effect=parseRasterEffect(i.effect),duration=rasterDuration(effect,i.delayMs,i.loop),objects=i.targets.map(id=>s.stage.find(o=>o.id===id));ensure(objects.every(o=>o),'RASTER_TARGET','All targets must exist');ensure(p.assets.some(a=>a.id===i.asset&&a.kind==='image'),'RASTER_ASSET',i.asset);
 ensure(i.policy==='replace'||objects.every(o=>!o?.rasterRef),'RASTER_BUSY','A raster image already owns the target');
 ensure(!s.tasks.some(t=>t.status==='running'&&taskLocks(t).some(k=>i.targets.some(id=>k==='object:'+id+':asset'||k==='object:'+id+':frame'))),'RASTER_BUSY','An active image writer owns the target');
 ensure(s.tasks.length<256&&s.counter<2147483647,'TASK_LIMIT','Raster task bound');const id='task:'+(s.counter+1),rasterTask=parseRasterTaskState({signature:sourceSignature(i),startedAt:s.logicalTime,asset:i.asset,effect,delayMs:i.delayMs,loop:i.loop}),task=parseTask({id,name:i.task,at:i.at,kind:'raster',status:'running',elapsed:0,duration,attempt:1,rasterTask});if(task.rasterTask)freezeJson(task.rasterTask);
 const previous=new Set(objects.flatMap(o=>o?.rasterRef?[o.rasterRef]:[]));for(const o of objects){ensure(o,'RASTER_TARGET','Target absent');o.asset=i.asset;o.rasterRef=id;delete o.frame;delete o.layers;delete o.ruleTransition;}
 for(const old of previous)if(!s.stage.some(o=>o.rasterRef===old)){const t=s.tasks.find(t=>t.id===old);if(t?.status==='running')t.status='superseded';}
 s.counter++;s.tasks.push(task);pruneRasters(s);syncRasters(s);
}
export function validateRasters(p:Program,s:Snapshot):void {
 const code=new Map(p.functions.flatMap(f=>f.code).map(i=>[i.at,i]));
 for(const t of s.tasks){if(t.kind!=='raster'){ensure(!t.rasterTask,'RESTORE_RASTER','Mixed raster payload');continue;}const m=t.rasterTask,i=t.at?code.get(t.at):undefined;
  ensure(m&&i?.op==='stage.raster'&&p.capabilities.includes('stage.raster')&&m.signature===sourceSignature(i)&&i.task===t.name&&m.asset===i.asset&&m.loop===i.loop&&m.delayMs===i.delayMs&&canonicalWireJSON(m.effect)===canonicalWireJSON(i.effect),'RESTORE_RASTER_SOURCE','Raster source/config changed');
  ensure(!t.sequenceTask&&!t.stageTask&&!t.motionTask&&!t.particleTask&&!t.mediaTask&&!t.audioFade&&!t.sourceFade&&!t.videoTask&&!t.asset&&!t.target&&!t.from&&!t.to&&!t.channel&&t.gain===undefined&&t.loop===undefined&&t.buffer===undefined&&t.restore===undefined&&t.attempt===1&&['running','completed','cancelled','superseded'].includes(t.status)&&t.duration===rasterDuration(m.effect,m.delayMs,m.loop)&&m.startedAt<=s.logicalTime&&t.elapsed<=t.duration,'RESTORE_RASTER','Invalid raster task/clock');
  const phase=clock(m,s.logicalTime-m.startedAt);if(t.status==='running')ensure(!phase.ended&&phase.elapsed===t.elapsed&&s.stage.some(o=>o.rasterRef===t.id),'RESTORE_RASTER_CLOCK','Invalid live phase/owner');if(t.status==='completed')ensure(!m.loop&&phase.ended&&t.elapsed===t.duration,'RESTORE_RASTER_CLOCK','Invalid completion');
 }
 for(const o of s.stage)if(o.rasterRef){const t=s.tasks.find(t=>t.id===o.rasterRef);ensure(t?.kind==='raster'&&t.rasterTask&&t.status!=='superseded'&&o.asset===t.rasterTask.asset&&!o.frame&&!o.layers&&!o.ruleTransition,'RESTORE_RASTER_REFERENCE','Missing or incompatible raster image');}
}
export interface FilmSample {fill:{color:string;alpha:number};lines:{x:number;alpha:number}[];noise:{x:number;y:number;width:number;height:number}[];sway:number;}
/** Bounded numeric plan, never pixels or a second clock. */
export function rasterFilmSample(input:DeepReadonly<RasterEffect>,step:number):FilmSample {
 const c=parseRasterEffect(input);ensure(c.kind==='film'&&Number.isInteger(step)&&step>=0&&step<c.periodSteps,'RASTER_FILM_PHASE','Invalid film phase');let state=c.seed>>>0,sway=0,moving=true;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;},line=(direction:boolean)=>({x:Math.floor(random()*c.width),speed:Math.floor(random()*c.lineSpeed)*(direction?-1:1)}),lines=Array.from({length:c.lineCount},(_,n)=>line(n%2===0));
 let result:FilmSample={fill:{color:'#000000',alpha:0},lines:[],noise:[],sway:0};
 for(let n=0;n<=step;n++){if(!(random()>=c.swayChance&&moving)){sway+=moving?1:-1;moving=!moving;}result={fill:{color:n%2===0?c.lightColor:c.darkColor,alpha:c.flicker?(n%2===0?c.lightAlpha:c.darkAlpha):0},lines:[],noise:[],sway};
  for(let j=0;j<lines.length;j++){const l=lines[j]!;if(random()<c.lineChance){result.lines.push({x:l.x,alpha:c.lineAlpha});l.x+=l.speed;if(l.x<=0||l.x>=c.width||random()>c.linePersistence)lines[j]=line(l.speed>=0);}}
  for(let j=0;j<c.noiseCount;j++)result.noise.push({x:Math.floor(random()*c.width),y:Math.floor(random()*c.height),width:Math.floor(random()*2)+1,height:Math.floor(random()*2)+1});
 }return result;
}
