import {ensure} from '../protocol/index.js';
import type {Snapshot,DeepReadonly} from '../protocol/index.js';
import {validateSnapshot} from '../protocol/generated/validators.js';
import {freezeJson,isDeeplyFrozenJSON} from '../protocol/codecs.js';
import {wireBudget} from '../protocol/budget.js';
import type {WireFootprint} from '../protocol/budget.js';
const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
/** Core-owned, normalized JSON only. Never accepts an external input or caches a mutable alias. */
function reconcile(source:unknown,previous:unknown,depth:number):unknown {
 ensure(depth<=wireBudget.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');
 if(source===null||typeof source!=='object')return source;
 if(isDeeplyFrozenJSON(source))return source;
 if(Array.isArray(source)){
  const old:readonly unknown[]=Array.isArray(previous)?previous:[];let out:unknown[]|undefined=Array.isArray(previous)&&old.length===source.length?undefined:[];
  for(let i=0;i<source.length;i++){const child=reconcile(source[i],old[i],depth+1);if(!out&&child!==old[i])out=old.slice();if(out)out[i]=child;}
  return out??previous;
 }
 ensure(record(source),'OWNERSHIP','Expected Core JSON');const old=record(previous)?previous:{},keys=Object.keys(source),oldKeys=Object.keys(old);let out:Record<string,unknown>|undefined=record(previous)&&keys.length===oldKeys.length?undefined:{};
 for(const key of keys){const child=reconcile(source[key],old[key],depth+1);if(!out&&(!Object.hasOwn(old,key)||child!==old[key]))out={...old};if(out)Object.defineProperty(out,key,{value:child,enumerable:true,configurable:true,writable:true});}
 if(out)for(const key of oldKeys)if(!Object.hasOwn(source,key))delete out[key];return out??previous;
}
/** Exact JSON footprint; immutable subtrees can reuse their measured size. */
class FrozenFootprints {
 private readonly sizes=new WeakMap<object,WireFootprint>();
 read(value:unknown):WireFootprint {
  if(value===null||typeof value!=='object'){const encoded=JSON.stringify(value);ensure(encoded!==undefined,'INPUT_JSON','Expected JSON');return {nodes:1,depth:0,characters:encoded.length};}
  const cached=this.sizes.get(value);if(cached)return cached;
  let nodes=1,depth=0,characters=2;const entries=Object.entries(value);
  for(const [key,child]of entries){const size=this.read(child);nodes+=size.nodes;depth=Math.max(depth,size.depth+1);characters+=size.characters+(Array.isArray(value)?0:JSON.stringify(key).length+1);ensure(nodes<=wireBudget.nodes&&depth<=wireBudget.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');}
  characters+=Math.max(0,entries.length-1);ensure(characters<=wireBudget.characters,'INPUT_SIZE','At most 4 MB of finite JSON');const result={nodes,depth,characters};this.sizes.set(value,result);return result;
 }
}
export class SnapshotProjection {
 private previous:DeepReadonly<Snapshot>|undefined;
 private readonly sizes=new FrozenFootprints();
 read(source:Snapshot):DeepReadonly<Snapshot> {
  // Sealed history is replaced, never edited, by the Core. Other branches are compared by value.
  freezeJson(source.history);const view=reconcile(source,this.previous,0);
  const checked=(value:unknown):value is Snapshot=>validateSnapshot(this.previous?.history===source.history&&record(value)?{...value,history:[]}:value);
  ensure(checked(view),'SCHEMA_SNAPSHOT',JSON.stringify(validateSnapshot.errors));
  const frozen=freezeJson(view);this.sizes.read(frozen);this.previous=frozen;return frozen;
 }
}
