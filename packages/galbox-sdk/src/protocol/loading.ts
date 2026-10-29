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
 const result=new Set<string>();if(s.scene?.mix?.rule)result.add(s.scene.mix.rule);for(const o of s.stage){result.add(o.asset);if(o.ruleTransition){result.add(o.ruleTransition.from);result.add(o.ruleTransition.rule);}for(const l of o.layers??[])result.add(l.asset);}for(const t of s.tasks)if(t.asset&&(t.status==='running'||t.status==='blocked'||t.kind==='audio'&&t.status==='completed'&&t.restore==='replay'))result.add(t.asset);
 if(s.text?.voice)result.add(s.text.voice.asset);for(const c of s.ui?.active?.screen.controls??[])if(c.kind==='image')result.add(c.asset);return [...result];
}
export function chapterAssets(p:LoadingOptions,s:DeepReadonly<Snapshot>):string[] {if(p.mode!=='chapter')return [];for(const f of [...s.frames].reverse()){const c=p.chapters?.find(c=>c.functions.includes(f.functionId));if(c)return c.assets;}return [];}
function instructionAssets(p:Program,i:Instruction):string[] {switch(i.op){case 'stage.particles':return [...new Set(i.config.styles.map(s=>s.asset))];case 'stage.put':return [i.object.asset];case 'stage.mix':return i.rule?[i.rule]:[];case 'stage.asset':case 'stage.image':case 'audio.play':case 'audio.track':case 'video.play':return [i.asset];case 'stage.transition':return [i.asset];case 'stage.rule':return [i.asset,i.rule];case 'ui.show':return p.ui?.screens.find(s=>s.id===i.screen)?.controls.flatMap(c=>c.kind==='image'?[c.asset]:[])??[];default:return [];}}
const loadingIndex=(p:Program)=>new Map(p.functions.map(f=>[f.id,{fn:f,positions:new Map(f.code.map((i,n)=>[i.at,n]))}]));
/** The Host owns its Program; rebuild if its function table is replaced. */
export function createLookahead(p:Program):(s:DeepReadonly<Snapshot>,policy:LoadingOptions)=>string[] {let source=p.functions,index=loadingIndex(p);return (s,policy)=>{if(source!==p.functions){source=p.functions;index=loadingIndex(p);}return lookaheadAssets(p,s,policy,index);};}
/** Static bounded hints only: never execute expressions, plugins or branch choices. */
export function lookaheadAssets(p:Program,s:DeepReadonly<Snapshot>,policy:LoadingOptions,index?:ReturnType<typeof loadingIndex>):string[] {
 if(policy.mode!=='balanced'||!policy.lookahead||!s.wait||!['text','delay','group','media','video'].includes(s.wait.kind))return [];
 const functions=index??loadingIndex(p);
 const top=s.frames.at(-1),first=top?functions.get(top.functionId):undefined;if(!first)return [];
 const pc=first.positions.get(top?.pc??'');if(pc===undefined)return [];
 const stack:{functionId:string;cursor:number}[]=[];
 for(let n=1;n<s.frames.length;n++){const child=s.frames[n],parent=s.frames[n-1],returnAt=child?.returnTo?.returnAt,f=parent?functions.get(parent.functionId):undefined,cursor=returnAt?f?.positions.get(returnAt):undefined;if(!parent||cursor===undefined)return [];stack.push({functionId:parent.functionId,cursor});}
 let current={functionId:first.fn.id,cursor:pc+1};const ids=new Set<string>(),visited=new Set<string>(),pages=new Set<string>();
 for(let scanned=0;scanned<512;scanned++){
  const key=JSON.stringify([stack,current]);if(visited.has(key))break;visited.add(key);const f=functions.get(current.functionId),i=f?.fn.code[current.cursor];if(!f||!i)break;
  if(i.op==='control.jump'){const target=f.positions.get(i.target);if(target===undefined)break;current.cursor=target;continue;}
  if(i.op==='control.call'){const callee=functions.get(i.function),entry=callee?.positions.get(callee.fn.entry);if(!callee||entry===undefined||stack.length>=32)break;stack.push({...current,cursor:current.cursor+1});current={functionId:callee.fn.id,cursor:entry};continue;}
  if(i.op==='control.return'){const caller=stack.pop();if(!caller)break;current=caller;continue;}
  if(i.op.startsWith('control.')||i.op==='choice'||i.op==='interaction.prompt'||i.op==='extension.invoke'||i.op==='ui.wait')break;
  for(const id of instructionAssets(p,i)){if(ids.size===16)break;ids.add(id);}
  if(i.op==='text.page'||i.op==='text.template'||i.op==='text.rich')pages.add(i.textId);
  if(pages.size>=policy.lookahead||ids.size>=16)break;current.cursor++;
 }
 return [...ids];
}
