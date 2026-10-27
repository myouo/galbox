import {ensure,parseLoadingOptions} from './index.js';
import type {LoadingOptions,Program,Snapshot,DeepReadonly,Instruction} from './index.js';
export function loadingPolicy(input:LoadingOptions):LoadingOptions {
 const p=parseLoadingOptions(input);ensure(p.mode!=='chapter'||p.chapters?.length,'LOADING_CHAPTERS','Chapter mode needs declared resource groups');
 const ids=new Set<string>(),functions=new Set<string>();for(const c of p.chapters??[]){ensure(!ids.has(c.id),'LOADING_CHAPTERS','Duplicate chapter');ids.add(c.id);for(const f of c.functions){ensure(!functions.has(f),'LOADING_CHAPTERS','A function can belong to only one chapter');functions.add(f);}}
 return {...p,concurrency:p.concurrency??(p.mode==='eager'?1:3),maxResidentBytes:p.maxResidentBytes??268435456,lookahead:p.lookahead??2};
}
export function validateLoading(program:Program,policy:LoadingOptions,functions:readonly string[]=[]):void {for(const c of policy.chapters??[]){for(const f of c.functions)ensure(program.functions.some(fn=>fn.id===f)||functions.includes(f),'LOADING_FUNCTION',f);for(const a of c.assets)ensure(program.assets.some(asset=>asset.id===a),'LOADING_ASSET',a);}}
export function startupAssets(p:Program):string[] {return [...new Set([...p.assets.filter(a=>a.kind==='font').map(a=>a.id),...[p.presentation?.title.background,p.presentation?.title.logo].filter((id):id is string=>!!id),...(p.extras?.entries??[]).flatMap(e=>e.kind==='achievement'&&e.icon?[e.icon]:[])])];}
export function snapshotAssets(s:DeepReadonly<Snapshot>):string[] {
 const result=new Set<string>();for(const o of s.stage){result.add(o.asset);if(o.ruleTransition){result.add(o.ruleTransition.from);result.add(o.ruleTransition.rule);}for(const l of o.layers??[])result.add(l.asset);}for(const t of s.tasks)if(t.asset&&(t.status==='running'||t.status==='blocked'||t.kind==='audio'&&t.status==='completed'&&t.restore==='replay'))result.add(t.asset);
 if(s.text?.voice)result.add(s.text.voice.asset);for(const c of s.ui?.active?.screen.controls??[])if(c.kind==='image')result.add(c.asset);return [...result];
}
export function chapterAssets(p:LoadingOptions,s:DeepReadonly<Snapshot>):string[] {if(p.mode!=='chapter')return [];for(const f of [...s.frames].reverse()){const c=p.chapters?.find(c=>c.functions.includes(f.functionId));if(c)return c.assets;}return [];}
function instructionAssets(p:Program,i:Instruction):string[] {switch(i.op){case 'stage.put':return [i.object.asset];case 'stage.image':case 'audio.play':case 'audio.track':case 'video.play':return [i.asset];case 'stage.transition':return [i.asset];case 'stage.rule':return [i.asset,i.rule];case 'ui.show':return p.ui?.screens.find(s=>s.id===i.screen)?.controls.flatMap(c=>c.kind==='image'?[c.asset]:[])??[];default:return [];}}
/** Static bounded hints only: never execute expressions, plugins or branch choices. */
export function lookaheadAssets(p:Program,s:DeepReadonly<Snapshot>,policy:LoadingOptions):string[] {
 if(policy.mode!=='balanced'||!policy.lookahead||!s.wait||!['text','delay','group','media','video'].includes(s.wait.kind))return [];const f=s.frames.at(-1),fn=p.functions.find(fn=>fn.id===f?.functionId);if(!fn)return [];const at=fn.code.findIndex(i=>i.at===f?.pc);if(at<0)return [];const ids=new Set<string>();let pages=0;
 for(const i of fn.code.slice(at+1,at+129)){if(i.op.startsWith('control.')||i.op==='choice'||i.op==='interaction.prompt'||i.op==='extension.invoke'||i.op==='ui.wait')break;for(const id of instructionAssets(p,i))ids.add(id);if(['text.page','text.template','text.rich'].includes(i.op)&&++pages>=policy.lookahead)break;if(ids.size>=16)break;}return [...ids].slice(0,16);
}
