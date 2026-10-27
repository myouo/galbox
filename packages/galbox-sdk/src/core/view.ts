import {parseSnapshot,ensure} from '../protocol/index.js';
import type {Snapshot,DeepReadonly} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {wireBudget,ownedWireFootprint} from '../protocol/budget.js';
import type {WireFootprint} from '../protocol/budget.js';
/** Only the Core owns the source. Sealed history is replaced, never edited. */
export class SnapshotProjection {
 private history:{source:Snapshot['history'];view:DeepReadonly<Snapshot['history']>;size:WireFootprint}|null=null;
 read(source:Snapshot):DeepReadonly<Snapshot> {
  if(!this.history||this.history.source!==source.history){const copy=parseSnapshot(source),view=freezeJson(copy.history);this.history={source:source.history,view,size:ownedWireFootprint(view)};freezeJson(source.history);return freezeJson(copy);}
  const hot=parseSnapshot({...source,history:[]}),size=ownedWireFootprint(hot),history=this.history;
  ensure(size.nodes+history.size.nodes-1<=wireBudget.nodes&&Math.max(size.depth,history.size.depth+1)<=wireBudget.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');
  ensure(size.characters-2+history.size.characters<=wireBudget.characters,'INPUT_SIZE','At most 4 MB of finite JSON');
  return freezeJson({...hot,history:history.view});
 }
}
