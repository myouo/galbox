import {defaultSavePolicy} from 'galbox-sdk/player';
import type {Player,TextRenderer} from 'galbox-sdk/player';
import {parseSaveGameOptions,parseSavePolicy} from 'galbox-sdk/protocol';
export function saveTypes(player:Player,renderer:TextRenderer){
 const policy=parseSavePolicy(defaultSavePolicy);void policy;void renderer.capture;
 void player.saveGame(parseSaveGameOptions({image:'required',kind:'manual',label:'灯塔'})).then(result=>{const committed:true=result.committed;const id:string=result.id;void committed;void id;});
 void player.load('manual:1','previous');
 // @ts-expect-error Image policy is finite, no stage-only success path.
 void player.saveGame({image:'stage-only'});
 // @ts-expect-error Only the declared save kinds are accepted.
 void player.saveGame({kind:'cloud'});
 // @ts-expect-error Slot revision is a number.
 void player.saveGame({expectedRevision:'latest'});
 // @ts-expect-error Library data is readonly.
 player.getSnapshot().slots[0]!.label='outside';
}
