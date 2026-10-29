import {stageCandidate} from './stage-candidate.js';
import {removeMotionTargets,syncMotion} from '../protocol/motion.js';
import {ensure,parseTask} from '../protocol/index.js';
import type {Program,Snapshot,ParticleTaskState,ParticleState,RngState} from '../protocol/index.js';
import {sourceSignature,validateStageGraph} from '../protocol/stage.js';
import {validateParticleConfig,particleObjects,particleIds,syncParticles,ownsParticle} from '../protocol/particles.js';
import type {ParticleInstruction} from '../protocol/particles.js';
function draw(m:{rng:RngState}):number {ensure(m.rng.draws<2147483647,'PARTICLE_RNG_LIMIT','Particle random stream exhausted');m.rng.state=(Math.imul(m.rng.state,1664525)+1013904223)>>>0;m.rng.draws++;return m.rng.state/4294967296;}
function spawn(m:ParticleTaskState,p:ParticleState){p.x=draw(m)*m.config.width;p.y=-m.config.styles[p.style]!.frames[0]!.height;p.spawned=true;}
export function executeParticles(p:Program,state:Snapshot,i:ParticleInstruction):void {
 ensure(p.capabilities.includes('stage.particles')&&state.scene,'PARTICLE_CAPABILITY','Declare stage.particles');const s=stageCandidate(state);
 if(i.op==='stage.particles'){
  const c=i.config;validateParticleConfig(c);ensure(i.prefix.length<=110,'PARTICLE_ID','Prefix too long');for(const group of c.groups)for(const id of group.parents)ensure(s.stage.some(o=>o.id===id)&&!ownsParticle(s,id),'PARTICLE_PARENT','Ordinary parent object required');ensure(s.tasks.length<256&&s.counter<2147483647,'TASK_LIMIT','Particle task bound');
  const states:ParticleState[]=[],random:{rng:RngState}={rng:{algorithm:'lcg32@1',state:c.seed,draws:0}};
  for(let n=0;n<c.count;n++){const style=Math.floor(draw(random)*c.styles.length),group=Math.floor(draw(random)*c.groups.length),v=c.styles[style]!;states.push({style,group,spawned:false,x:0,y:0,vx:0,vy:v.velocityY.min+draw(random)*(v.velocityY.max-v.velocityY.min),ax:v.initialAccelerationX.min+draw(random)*(v.initialAccelerationX.max-v.initialAccelerationX.min),frame:0,updates:0});}const [first,...rest]=states;ensure(first,'PARTICLE_COUNT','Empty emitter');const m:ParticleTaskState={signature:sourceSignature(i),prefix:i.prefix,config:c,rng:random.rng,ticks:0,particles:[first,...rest]};for(let n=0;n<c.initiallySpawned;n++)spawn(m,m.particles[n]!);
  const objects=particleObjects(m);ensure(s.stage.length+objects.length<=128,'STAGE_LIMIT','Particle mirrors count toward 128 objects');ensure(objects.every(o=>!s.stage.some(old=>old.id===o.id)),'PARTICLE_ID','Object ID already exists');s.stage.push(...objects);s.tasks.push(parseTask({id:'task:'+ ++s.counter,name:i.task,at:i.at,kind:'particles',status:'running',elapsed:0,duration:c.intervalMs,attempt:1,particleTask:m}));
 }else{const task=[...s.tasks].reverse().find(t=>t.name===i.task);ensure(task?.kind==='particles'&&task.particleTask,'PARTICLE_TASK','Declared emitter task required');if(task.status==='running'){const ids=new Set(particleIds(task.particleTask));removeMotionTargets(s,ids);s.stage=s.stage.filter(o=>!ids.has(o.id));task.status='cancelled';syncMotion(s);}}
 validateStageGraph(s.stage);const copy=stageCandidate(s);state.stage=copy.stage;state.tasks=copy.tasks;state.counter=copy.counter;
}
export function checkParticleTick(s:Snapshot,ms:number):void {for(const t of s.tasks)if(t.kind==='particles'&&t.status==='running'&&t.particleTask){const m=t.particleTask,steps=Math.floor((t.elapsed+ms)/m.config.intervalMs);ensure(m.ticks+steps<=2147483647&&m.rng.draws+steps*m.config.count*3<=2147483647,'PARTICLE_TIME_LIMIT','Emitter lifetime exhausted');}}
export function tickParticles(s:Snapshot,ms:number):void {
 for(const t of s.tasks)if(t.kind==='particles'&&t.status==='running'&&t.particleTask){const m=t.particleTask,c=m.config,steps=Math.floor((t.elapsed+ms)/c.intervalMs);t.elapsed=(t.elapsed+ms)%c.intervalMs;ensure(m.ticks+steps<=2147483647,'PARTICLE_TIME_LIMIT','Emitter lifetime exhausted');
  for(let n=0;n<steps;n++){m.ticks++;for(const state of m.particles){if(!state.spawned){if(draw(m)<c.spawnProbability)spawn(m,state);continue;}const style=c.styles[state.style]!;state.x+=state.vx;state.y+=state.vy;state.vx=Math.max(-style.velocityXLimit,Math.min(style.velocityXLimit,state.vx+state.ax));if(style.accelerationNoise)state.ax+=(draw(m)-.5)*style.accelerationNoise;state.ax=Math.max(-style.accelerationXLimit,Math.min(style.accelerationXLimit,state.ax));if(state.y>=c.height){state.y=style.wrap==='top'?-style.frames[0]!.height:-Math.floor(style.frames[0]!.height*draw(m));state.x=draw(m)*c.width;}state.updates++;state.frame=state.updates%style.frames.length;}}
 }
 syncParticles(s);
}
