import {cgExtra,musicExtra,sceneExtra,sceneMarker,achievement,extrasCatalog,unlockExtra,expr} from 'galbox-sdk/port-kit';
import type {AssetRef} from 'galbox-sdk/port-kit';
import type {Player} from 'galbox-sdk/player';
export function extrasTypes(image:AssetRef<'image'>,audio:AssetRef<'audio'>,player:Player,mount:HTMLElement){const cg=cgExtra('cg',[image],{title:'CG'}),music=musicExtra('music',audio,{title:'音乐',loop:true}),scene=sceneExtra('scene','memory',{title:'场景'}),badge=achievement('badge',{title:'成就',icon:image});extrasCatalog('extras','v1',[cg,music,scene,badge]);unlockExtra('unlock',cg);sceneMarker('scene:start',scene);void player.openCG(cg.id,mount);void player.openSceneReplay(scene.id,mount);void player.playMusic(music.id);
 // @ts-expect-error CG requires image resources.
 cgExtra('bad',[audio],{title:'bad'});
 // @ts-expect-error Music requires an audio resource.
 musicExtra('bad',image,{title:'bad'});
 // @ts-expect-error Scene markers are associated with scene references.
 sceneMarker('bad',cg);
 // @ts-expect-error Unlock conditions must be boolean expressions.
 achievement('bad',{title:'bad',unlock:expr.integer(1)});
 // @ts-expect-error Readonly catalog projection cannot be mutated.
 player.getSnapshot().extras!.entries[0]!.unlocked=true;
}
