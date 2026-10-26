import {historyPolicy} from 'galbox-sdk/port-kit';
import type {Player} from 'galbox-sdk/player';
import {parseHistoryCommit} from 'galbox-sdk/protocol';
export function historyTypes(player:Player){const policy=historyPolicy({maxEntries:16,rollback:true});void policy;const row=player.getSnapshot().backlog.entries[0];if(row){void player.replayHistory(row.id,player.getSnapshot().epoch);void player.rollback(row.id,player.getSnapshot().epoch);}
 // @ts-expect-error History epoch is a number.
 void player.rollback('id','epoch');
 // @ts-expect-error Bounded history options reject unknown controls.
 historyPolicy({seek:true});
 // @ts-expect-error Readonly history does not grant mutable text ownership.
 player.getSnapshot().backlog.entries[0]!.text.content='outside';
 const commit=parseHistoryCommit({});void commit;
}
