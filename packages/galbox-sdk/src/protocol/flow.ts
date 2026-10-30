import {moduleContext} from './module-context.js';
import {ensure,parseFlowProgress,parseFlowRun,parseProgram,parseFlowchart,parseExpression,parseValue,canonicalWireJSON} from './index.js';
import type {Program,Profile,FlowProgress,FlowNode,FlowRun,DeepReadonly,BoolExpression} from './index.js';
import {wireDigest,programClosureDigest} from './digest.js';
import {validateExpressionTree,evaluateExpression} from './expressions.js';
export function flowSignature(p:DeepReadonly<Program>):string|null {if(!p.flowchart)return null;const context=moduleContext(p);return context?wireDigest({version:2,graph:p.flowchart,module:context.identity}):programClosureDigest({graph:p.flowchart,globals:p.globals,functions:p.functions,assets:p.assets,rng:p.rng??null});}
export function flowchartProgressFingerprint(input:unknown):string {return wireDigest(parseFlowchart(input));}
export function flowchartFingerprint(input:unknown):string|null {return flowSignature(parseProgram(input));}
export function validateFlowchart(p:Program,imports:readonly import('./index.js').ModuleFunction[]=[]):void {
 const graph=p.flowchart;ensure(!!graph===p.capabilities.includes('flowchart'),'FLOW_CAPABILITY','Declare both flowchart and its capability');if(!graph)return;ensure(p.capabilities.includes('expressions'),'FLOW_CAPABILITY','Flow conditions require expressions');
 const unique=(ids:string[],code:string)=>ensure(new Set(ids).size===ids.length,code,'Duplicate graph identity');unique(graph.chapters.map(c=>c.id),'FLOW_CHAPTER_DUPLICATE');unique(graph.nodes.map(n=>n.id),'FLOW_NODE_DUPLICATE');unique(graph.edges.map(e=>`${e.from}\0${e.to}`),'FLOW_EDGE_DUPLICATE');unique(graph.nodes.map(n=>`${n.column}:${n.row}`),'FLOW_POSITION_DUPLICATE');
 ensure(canonicalWireJSON(graph).length<=131072,'FLOW_SIZE','Graph exceeds 128 KiB JSON characters');
 for(const node of graph.nodes){ensure(graph.chapters.some(c=>c.id===node.chapter),'FLOW_CHAPTER',node.id);ensure(new Set(node.requires).size===node.requires.length&&node.requires.every(id=>graph.nodes.some(n=>n.id===id)),'FLOW_REQUIREMENT',node.id);validateExpressionTree(node.unlock,()=>undefined);validateExpressionTree(node.gate,()=>undefined);
  if(node.entry!==null){const loaded=p.functions.find(f=>f.id===node.entry),f=loaded??imports.find(f=>f.id===node.entry),first=loaded?.code.find(i=>i.at===loaded.entry),declaration=imports.find(f=>f.id===node.entry);ensure(f&&!f.params.length&&f.returns==='void'&&(loaded?first?.op==='flow.node'&&first.node===node.id:declaration?.entryMarker?.kind==='flow'&&declaration.entryMarker.id===node.id),'FLOW_ENTRY','Entry must be a zero-argument void function beginning with this node marker');}
 }
 for(const edge of graph.edges)ensure(graph.nodes.some(n=>n.id===edge.from)&&graph.nodes.some(n=>n.id===edge.to),'FLOW_EDGE','Unknown edge endpoint');
 for(const f of p.functions)for(const i of f.code)if(i.op==='flow.node'||i.op==='flow.unlock')ensure(graph.nodes.some(n=>n.id===i.node),'FLOW_NODE_UNKNOWN',i.node);
}
export function flowProgress(p:DeepReadonly<Program>,profile:DeepReadonly<Profile>):FlowProgress|null {
 const graph=p.flowchart;if(!graph)return null;const signature=wireDigest(graph),progress=profile.flow?parseFlowProgress(profile.flow):parseFlowProgress({graphId:graph.id,revision:graph.revision,signature,visited:[],unlocked:[]});
 ensure(progress.graphId===graph.id&&progress.revision===graph.revision&&progress.signature===signature,'FLOW_PROGRESS_VERSION','Flow definition changed; use explicit profile migration');ensure([...progress.visited,...progress.unlocked].every(id=>graph.nodes.some(n=>n.id===id)),'FLOW_PROGRESS_NODE','Progress refers to an unknown node');return progress;
}
function condition(input:DeepReadonly<BoolExpression>,profile:DeepReadonly<Profile>):boolean {const result=evaluateExpression(parseExpression(input),{slot:()=>undefined,profile:key=>{const value=Object.hasOwn(profile.values,key)?profile.values[key]:undefined;return value?parseValue(value):undefined;},read:unit=>profile.read.includes(unit)});ensure(result.kind==='bool','FLOW_CONDITION','Expected boolean condition');return result.value;}
export function flowEligibility(p:DeepReadonly<Program>,profile:DeepReadonly<Profile>,id:string):{node:DeepReadonly<FlowNode>;visited:boolean;unlocked:boolean;gate:boolean} {
 const node=p.flowchart?.nodes.find(n=>n.id===id),progress=flowProgress(p,profile);ensure(node&&progress,'FLOW_NODE_UNKNOWN',id);return flowNodeStatus(node,profile,progress);
}
export function flowEntry(p:DeepReadonly<Program>,profile:DeepReadonly<Profile>,id:string):string {
 const status=flowEligibility(p,profile,id);ensure(status.unlocked,'FLOW_LOCKED','Node is locked');ensure(status.gate,'FLOW_GATE','Current durable profile does not satisfy the entry gate');ensure(status.node.entry,'FLOW_NO_ENTRY','Node has no declared entry');return status.node.entry;
}
export function initialFlow(p:Program,entryNode:string|null):FlowRun|undefined {const signature=flowSignature(p);return signature?parseFlowRun({signature,entryNode,current:null}):undefined;}
export function validateFlowRun(p:Program,run:DeepReadonly<import('./index.js').Snapshot>):string {
 if(!p.flowchart){ensure(!run.flow,'RESTORE_FLOW','Unexpected flow state');return p.entry;}ensure(run.flow&&run.flow.signature===flowSignature(p),'RESTORE_FLOW_DEFINITION','Flow/entry definition changed; explicit full migration required');const state=run.flow;if(state.current!==null)ensure(p.flowchart.nodes.some(n=>n.id===state.current),'RESTORE_FLOW_NODE','Unknown current node');if(state.entryNode===null)return p.entry;ensure(state.current!==null,'RESTORE_FLOW_ENTRY','A declared root must retain a reached node');const node=p.flowchart.nodes.find(n=>n.id===state.entryNode);ensure(node?.entry,'RESTORE_FLOW_ENTRY','Unknown declared root');return node.entry;
}

export function flowNodeStatus(node:DeepReadonly<FlowNode>,profile:DeepReadonly<Profile>,progress:DeepReadonly<FlowProgress>):{node:DeepReadonly<FlowNode>;visited:boolean;unlocked:boolean;gate:boolean}{const visited=progress.visited.includes(node.id),unlocked=progress.unlocked.includes(node.id)||(node.requires.every(id=>progress.visited.includes(id))&&condition(node.unlock,profile));return {node,visited,unlocked,gate:condition(node.gate,profile)};}
