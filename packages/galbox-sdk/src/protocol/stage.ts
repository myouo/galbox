import {mixState} from './composition.js';
import {ensure,canonicalWireJSON,parseStagePose,parseStageFilters,parseStageCamera} from './index.js';
import type {StageObject,StagePose,StageFilters,StageCamera,StageScene,StageLayer,StageTaskState,StageTarget,Task,Snapshot,Instruction,DeepReadonly,Expression} from './index.js';
export type StageInstruction=Extract<Instruction,{op:'stage.image'|'stage.pose'|'stage.filter'|'stage.camera'|'stage.fade'|'stage.transition'|'stage.rule'|'stage.shake'|'stage.style'|'stage.asset'|'stage.mix'|'task.cancel'|'task.finish'}>;
export function isStageInstruction(i:Instruction):i is StageInstruction {return ['stage.image','stage.pose','stage.filter','stage.camera','stage.fade','stage.transition','stage.rule','stage.shake','stage.style','stage.asset','stage.mix','task.cancel','task.finish'].includes(i.op);}
export function stageExpressions(i:StageInstruction):Expression[] {
 const out:Expression[]=[];if('duration'in i)out.push(i.duration);if('pose'in i)out.push(...Object.values(i.pose).filter((e):e is NonNullable<typeof e>=>e!==undefined));if('to'in i&&typeof i.to==='object')out.push(...Object.values(i.to).filter((e):e is NonNullable<typeof e>=>e!==undefined));if('style'in i&&i.style?.z)out.push(i.style.z);if(i.op==='stage.fade')out.push(i.alpha);if(i.op==='stage.shake')out.push(i.amplitudeX,i.amplitudeY,i.periodMs);return out;
}
export const poseKeys=['x','y','alpha','scaleX','scaleY','rotation','skewX','skewY','pivotX','pivotY','anchorX','anchorY'] as const;
export const filterKeys=['blur','brightness','grayscale'] as const;
export const cameraKeys=['x','y','zoom','rotation'] as const;
export const identityPose:Readonly<StagePose>=Object.freeze({x:0,y:0,alpha:1,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0,pivotX:0,pivotY:0,anchorX:0,anchorY:0});
export const identityFilters:Readonly<StageFilters>=Object.freeze({blur:0,brightness:1,grayscale:0});
export function initialScene():StageScene {return {version:1,camera:{x:640,y:360,zoom:1,rotation:0},filters:{...identityFilters},overlay:{color:'#000000',alpha:0}};}
export function objectPose(o:DeepReadonly<StageObject>):StagePose {return parseStagePose({...identityPose,...o.transform,...o.position});}
export function setObjectPose(o:StageObject,p:StagePose):void {o.position={x:p.x,y:p.y,alpha:p.alpha};const {x:_x,y:_y,alpha:_alpha,...transform}=p;o.transform=transform;}
export function ease(name:StageTaskState['easing'],ratio:number):number {return name==='ease-in'?ratio*ratio:name==='ease-out'?1-(1-ratio)*(1-ratio):name==='ease-in-out'?ratio*ratio*(3-2*ratio):ratio;}
export function lerp(a:number,b:number,p:number):number {return p===1?b:p===0?a:a+(b-a)*p;}
export function blendedLayers(from:readonly DeepReadonly<StageLayer>[],to:string,p:number):[StageLayer,...StageLayer[]] {const entries=from.map(l=>({asset:l.asset,weight:l.weight*(1-p)})),existing=entries.find(l=>l.asset===to);if(existing)existing.weight+=p;else entries.push({asset:to,weight:p});const [first,...rest]=entries.filter(l=>l.weight>0);ensure(first&&rest.length<4,'STAGE_LAYERS','A transition supports at most four live image layers');return [first,...rest];}
export function currentLayers(o:DeepReadonly<StageObject>):[StageLayer,...StageLayer[]] {ensure(!o.ruleTransition,'STAGE_RULE_BASE','Finish or replace a frozen rule image before starting another transition');const [first,...rest]=(o.layers??[{asset:o.asset,weight:1}]).map(l=>({...l}));ensure(first,'STAGE_LAYERS','No visible image layer');return [first,...rest];}
function targetKey(target:DeepReadonly<StageTarget>):string {return target.kind==='camera'?'camera':`object:${target.id}`;}
export function taskLocks(t:DeepReadonly<Task>):string[] {
 if(t.kind==='animation')return ['x','y','alpha'].map(k=>`object:${t.target}:pose:${k}`);const v=t.stageTask;if(t.kind!=='stage'||!v)return [];
 switch(v.type){case 'mix':return ['scene:mix'];case 'pose':return v.fields.map(k=>`object:${v.target}:pose:${k}`);case 'filter':return v.fields.map(k=>`${targetKey(v.target)}:filter:${k}`);case 'camera':return v.fields.map(k=>`camera:pose:${k}`);case 'fade':return ['scene:overlay'];case 'rule':case 'transition':return [`object:${v.target}:asset`];case 'shake':return [`${targetKey(v.target)}:shake`];}
}
export function taskObject(t:DeepReadonly<Task>):string|undefined {if(t.kind==='animation')return t.target;const v=t.stageTask;if(!v)return;return v.type==='pose'||v.type==='transition'||v.type==='rule'?v.target:(v.type==='filter'||v.type==='shake')&&v.target.kind==='object'?v.target.id:undefined;}
export function sourceSignature(i:DeepReadonly<Instruction>):string {const value=canonicalWireJSON(i);ensure(value.length<=65536,'STAGE_SOURCE_SIZE','Stage source signature exceeds 65536 characters');return value;}
export function stageRatio(t:DeepReadonly<Task>):number {return ease(t.stageTask?.easing??'linear',t.elapsed/t.duration);}
function triangle(phase:number):number {const p=phase%1;return p<.25?p*4:p<.75?2-p*4:p*4-4;}
export function shakeOffset(t:DeepReadonly<Task>,v:Extract<DeepReadonly<StageTaskState>,{type:'shake'}>){if(v.samples)return {...v.samples[Math.min(v.samples.length-1,Math.floor(t.elapsed/v.periodMs))]!};const envelope=1-stageRatio(t);return {x:triangle(t.elapsed/v.periodMs)*v.amplitudeX*envelope,y:triangle(t.elapsed/v.periodMs*2)*v.amplitudeY*envelope};}
export function applyStageTask(s:Snapshot,t:Task):void {
 const v=t.stageTask;ensure(t.kind==='stage'&&v&&s.scene,'STAGE_TASK','Missing stage task/scene');const p=stageRatio(t),object=(id:string)=>{const o=s.stage.find(o=>o.id===id);ensure(o,'STAGE_OBJECT',id);return o;};
 switch(v.type){
  case 'mix':{if(t.elapsed===t.duration){for(const id of v.sourceRoots)object(id).visible=false;delete s.scene.mix;}else s.scene.mix=mixState(v,p);break;}
  case 'pose':{const o=object(v.target),pose=objectPose(o);for(const k of v.fields)pose[k]=lerp(v.from[k],v.to[k],p);setObjectPose(o,parseStagePose(pose));break;}
  case 'filter':{const out=v.target.kind==='camera'?s.scene.filters:object(v.target.id).filters??{...identityFilters};for(const k of v.fields)out[k]=lerp(v.from[k],v.to[k],p);const value=parseStageFilters(out);if(v.target.kind==='camera')s.scene.filters=value;else object(v.target.id).filters=value;break;}
  case 'camera':{for(const k of v.fields)s.scene.camera[k]=lerp(v.from[k],v.to[k],p);s.scene.camera=parseStageCamera(s.scene.camera);break;}
  case 'fade':s.scene.overlay={color:v.color,alpha:lerp(v.from,v.to,p)};break;
  case 'transition':{const o=object(v.target);o.asset=v.to;if(t.elapsed===t.duration)delete o.layers;else o.layers=blendedLayers(v.from,v.to,p);break;}
  case 'rule':{const o=object(v.target);o.asset=v.to;if(t.elapsed===t.duration)delete o.ruleTransition;else o.ruleTransition={from:v.from,rule:v.rule,vague:v.vague,progress:p};break;}
  case 'shake':{const target=v.target.kind==='camera'?s.scene:object(v.target.id);if(t.elapsed===t.duration)delete target.shake;else target.shake=shakeOffset(t,v);break;}
 }
}
export function clearShake(s:Snapshot,t:Task):void {const v=t.stageTask;if(v?.type!=='shake')return;if(v.target.kind==='camera'){if(s.scene)delete s.scene.shake;}else {const id=v.target.id;const o=s.stage.find(o=>o.id===id);if(o)delete o.shake;}}
export function validateStageGraph(stage:readonly DeepReadonly<StageObject>[]):void {
 ensure(new Set(stage.map(o=>o.id)).size===stage.length,'STAGE_DUPLICATE','Duplicate stage object');
 for(const o of stage){ensure(!o.ruleTransition||!o.layers,'STAGE_RULE_STATE','Rule and weighted layers cannot coexist');const visited=new Set([o.id]);let parent=o.parent;while(parent){ensure(!visited.has(parent),'STAGE_PARENT_CYCLE',o.id);visited.add(parent);ensure(visited.size<=8,'STAGE_PARENT_DEPTH','At most 8 hierarchy levels');const found=stage.find(p=>p.id===parent);ensure(found,'STAGE_PARENT','Missing parent');parent=found.parent;}if(o.layers)ensure(new Set(o.layers.map(l=>l.asset)).size===o.layers.length&&Math.abs(o.layers.reduce((n,l)=>n+l.weight,0)-1)<1e-9,'STAGE_LAYERS','Layer weights must be unique and total one');}
}
