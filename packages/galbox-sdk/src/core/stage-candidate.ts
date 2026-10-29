import {parseSnapshot,ensure} from '../protocol/index.js';
import type {Snapshot} from '../protocol/index.js';
import {freezeJson} from '../protocol/codecs.js';
import {ownedWireFootprint,wireBudget} from '../protocol/budget.js';
import type {WireFootprint} from '../protocol/budget.js';
const sealedHistory=new WeakMap<Snapshot['history'],WireFootprint>();
/** Stage transactions never write history. Copy mutable authority while retaining only sealed history. */
export function stageCandidate(source:Snapshot):Snapshot {
 let history=sealedHistory.get(source.history);if(!history){freezeJson(source.history);history=ownedWireFootprint(source.history);sealedHistory.set(source.history,history);}
 const next=parseSnapshot({...source,history:[]}),hot=ownedWireFootprint(next);
 ensure(hot.nodes+history.nodes-1<=wireBudget.nodes&&Math.max(hot.depth,history.depth+1)<=wireBudget.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');
 ensure(hot.characters-2+history.characters<=wireBudget.characters,'INPUT_SIZE','At most 4 MB of finite JSON');
 next.history=source.history;return next;
}
