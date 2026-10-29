import {ensure,canonicalWireJSON} from './index.js';
import type {Snapshot,DeepReadonly,StageMixState,StageTaskState} from './index.js';
export function mixState(v:Extract<DeepReadonly<StageTaskState>,{type:'mix'}>,progress:number):StageMixState{return {sourceRoots:[v.sourceRoots[0],...v.sourceRoots.slice(1)],targetRoots:[v.targetRoots[0],...v.targetRoots.slice(1)],method:v.method,vague:v.vague,...(v.rule?{rule:v.rule}:{}),progress};}
export function compositionMembers(s:DeepReadonly<Snapshot>):Set<string>{const roots=new Set([...(s.scene?.mix?.sourceRoots??[]),...(s.scene?.mix?.targetRoots??[])]),members=new Set(roots);let changed=true;while(changed){changed=false;for(const o of s.stage)if(o.parent&&members.has(o.parent)&&!members.has(o.id)){members.add(o.id);changed=true;}}return members;}
export function validateComposition(s:DeepReadonly<Snapshot>):void {
 const m=s.scene?.mix;if(!m)return;const roots=[...m.sourceRoots,...m.targetRoots],objects=roots.map(id=>s.stage.find(o=>o.id===id));ensure(new Set(roots).size===roots.length&&objects.every(o=>o&&!o.parent),'STAGE_MIX_ROOT','Mix needs distinct world roots');ensure((m.method==='rule')===!!m.rule,'STAGE_MIX_RULE','Rule image required only for rule mix');
 const zs=objects.map(o=>o!.z),low=Math.min(...zs),high=Math.max(...zs);for(const o of s.stage)if(!o.parent&&o.visible!==false&&!roots.includes(o.id))ensure(o.z<low||o.z>high,'STAGE_MIX_ORDER','Visible external root interleaves the composition');
 const active=s.tasks.filter(t=>t.status==='running'&&t.stageTask?.type==='mix');ensure(active.length===1,'STAGE_MIX_TASK','Exactly one composition task required');
}
export function sameMix(a:DeepReadonly<StageMixState>,b:DeepReadonly<StageMixState>):boolean{return canonicalWireJSON(a)===canonicalWireJSON(b);}
