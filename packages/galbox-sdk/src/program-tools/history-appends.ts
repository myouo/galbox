import {parseSnapshot,ensure,canonicalWireJSON} from '../protocol/index.js';
import type {DeepReadonly,Snapshot,Program,Instruction} from '../protocol/index.js';
import {resolveRichSource,richContinuationSources,richTextSignature,validateRichText,isTextComplete} from '../protocol/text.js';

/** Rebase a history-only append marker and explicit trailing breaks, then bind separately. */
export function rebaseHistoryAppends(snapshot:DeepReadonly<Snapshot>,source:DeepReadonly<Program>,target:DeepReadonly<Program>):Snapshot {
 const out=parseSnapshot(snapshot),index=(p:DeepReadonly<Program>)=>new Map(p.functions.flatMap(f=>f.code).map(i=>[i.at,i])),before=index(source),after=index(target);
 const note=(code:DeepReadonly<Instruction>|undefined)=>code?.op==='text.rich'&&code.completion==='history'?code:null;
 for(const text of out.history){if(text.rich?.historyAppend===undefined)continue;
  const old=note(before.get(text.rich.at)),next=note(after.get(text.rich.at));ensure(old&&next,'HISTORY_APPEND_SOURCE','Both history-only sources must remain available');
  validateRichText(text,resolveRichSource(source,old),richContinuationSources(source,old));
  const {historyAppend:oldAppend,runs:oldRuns,...oldRest}=old,{historyAppend:newAppend,runs:newRuns,...newRest}=next;void oldAppend;
  const extra=newRuns.slice(oldRuns.length);
  ensure(canonicalWireJSON(oldRest)===canonicalWireJSON(newRest)&&canonicalWireJSON(oldRuns)===canonicalWireJSON(newRuns.slice(0,oldRuns.length))&&extra.length<=256&&extra.every(r=>r.kind==='break'),'HISTORY_APPEND_CHANGED','Only the append marker and trailing line breaks may change');
  ensure(isTextComplete(text),'HISTORY_APPEND_PHASE','History-only text must be complete');
  if(extra.length){text.content+='\n'.repeat(extra.length);text.revealed+=extra.length;text.rich.cursor+=extra.length;text.rich.runs.push(...extra.map(()=>({kind:'break' as const})));text.rich.revealedAt.push(...Array.from({length:extra.length},()=>text.rich!.elapsedMs));}
  text.rich.historyAppend=newAppend??false;text.rich.signature=richTextSignature(resolveRichSource(target,next));
  validateRichText(text,resolveRichSource(target,next),richContinuationSources(target,next));
 }
 return out;
}
