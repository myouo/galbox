import {compositionMembers,validateComposition} from '../protocol/composition.js';
import {ownsParticle} from '../protocol/particles.js';
import {ensure,parseSnapshot,parseTask} from '../protocol/index.js';
import type {Snapshot,Task,Program} from '../protocol/index.js';
import {sourceSignature,taskObject,validateStageGraph} from '../protocol/stage.js';
import {motionDuration,syncMotion,removeMotionTargets,motionTargets,motionBudget} from '../protocol/motion.js';
import type {MotionInstruction} from '../protocol/motion.js';
export function executeMotion(p:Program,state:Snapshot,i:MotionInstruction):void {
 ensure(p.capabilities.includes('stage.motion')&&state.scene,'MOTION_CAPABILITY','Declare stage.motion');const s=parseSnapshot(state);
 if(i.op==='stage.motion'){
  ensure(i.targets.every(id=>s.stage.some(o=>o.id===id)),'MOTION_TARGET','Target absent');const duration=motionDuration(i.tracks,i.loop,i.intervalMs),targets=new Set(i.targets),conflicts=s.tasks.filter(t=>t.kind==='motion'&&t.status==='running'&&t.motionTask?.key===i.key&&t.motionTask.targets.some(id=>targets.has(id)));ensure(i.policy==='replace'||!conflicts.length,'MOTION_CONFLICT','Same-key motion is active');ensure(s.tasks.length<256&&s.counter<2147483647,'TASK_LIMIT','Motion task bound');
  for(const t of conflicts){const m=t.motionTask!;const next=m.targets.filter(id=>!targets.has(id));if(next.length)m.targets=motionTargets(next);else t.status='superseded';}
  s.tasks.push(parseTask({id:'task:'+ ++s.counter,name:i.task,kind:'motion',at:i.at,status:'running',elapsed:0,duration,attempt:1,motionTask:{signature:sourceSignature(i),key:i.key,targets:i.targets,tracks:i.tracks,loop:i.loop,intervalMs:i.intervalMs}}));
 }else if(i.op==='stage.motion.stop'){for(const t of s.tasks)if(t.kind==='motion'&&t.status==='running'&&t.motionTask&&(i.key===undefined||t.motionTask.key===i.key)){const next=t.motionTask.targets.filter(id=>!i.targets.includes(id));if(next.length)t.motionTask.targets=motionTargets(next);else t.status='cancelled';}}else {
  const mapping=new Map(i.mapping.map(v=>[v.from,v.to])),targets=new Set(mapping.values());ensure(mapping.size===i.mapping.length&&targets.size===mapping.size&&[...mapping.keys()].every(id=>!targets.has(id)),'STAGE_CLONE_MAP','Source and target sets must be disjoint and unique');
  ensure([...mapping.keys(),...targets].every(id=>!compositionMembers(s).has(id)),'STAGE_CLONE_BUSY','Finish the composition before copying its members');ensure([...mapping.keys(),...targets].every(id=>!ownsParticle(s,id)),'PARTICLE_OWNERSHIP','Particle mirrors are not ordinary copies');const source=s.stage.filter(o=>mapping.has(o.id));ensure(source.length===mapping.size,'STAGE_CLONE_SOURCE','Source absent');for(const o of s.stage)if(o.parent&&mapping.has(o.parent))ensure(mapping.has(o.id),'STAGE_CLONE_SUBTREE','Copy the complete child subtree');for(const o of s.stage)if(o.parent&&targets.has(o.parent))ensure(targets.has(o.id),'STAGE_CLONE_SUBTREE','Replace complete target subtree');
  ensure(!s.tasks.some(t=>t.status==='running'&&taskObject(t)!==undefined&&(mapping.has(taskObject(t)!)||targets.has(taskObject(t)!))),'STAGE_CLONE_BUSY','Wait for ordinary pose/filter/image animation before copying');
  const motions=s.tasks.filter(t=>t.kind==='motion'&&t.status==='running'&&t.motionTask).map(t=>({task:t,targets:t.motionTask!.targets.flatMap(id=>mapping.has(id)?[mapping.get(id)!]:[])}));removeMotionTargets(s,targets);
  s.stage=s.stage.filter(o=>!targets.has(o.id));for(const o of source){const copy={...o,id:mapping.get(o.id)!};if(copy.parent&&mapping.has(copy.parent))copy.parent=mapping.get(copy.parent)!;s.stage.push(copy);}ensure(s.stage.length<=128,'STAGE_LIMIT','At most 128 objects');
  for(const {task,targets:copies}of motions)if(copies.length){const m=task.motionTask!;m.targets=motionTargets([...new Set([...m.targets.filter(id=>s.stage.some(o=>o.id===id)),...copies])]);task.status='running';}
 }
 motionBudget(s);syncMotion(s);validateStageGraph(s.stage);validateComposition(s);const committed=parseSnapshot(s);state.stage=committed.stage;state.tasks=committed.tasks;state.counter=committed.counter;
}
export function finishMotion(s:Snapshot,t:Task,finish:boolean):void {ensure(t.motionTask,'MOTION_STATE','Missing motion');if(t.status==='running'){t.status=finish?'completed':'cancelled';if(finish)t.elapsed=t.duration;syncMotion(s);}}
export function tickMotion(s:Snapshot,ms:number):void {for(const t of s.tasks)if(t.kind==='motion'&&t.status==='running'&&t.motionTask){if(t.motionTask.loop)t.elapsed=(t.elapsed+ms)%t.duration;else{t.elapsed=Math.min(t.duration,t.elapsed+ms);if(t.elapsed===t.duration)t.status='completed';}}syncMotion(s);}
