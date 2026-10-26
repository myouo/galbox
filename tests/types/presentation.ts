import {gamePresentation,ProgramBuilder} from 'galbox-sdk/port-kit';
import type {AssetRef} from 'galbox-sdk/port-kit';
import type {Player} from 'galbox-sdk/player';
export function presentationTypes(image:AssetRef<'image'>,audio:AssetRef<'audio'>,font:AssetRef<'font'>,player:Player){new ProgramBuilder({gameId:'g',release:'v1',entry:'main'}).presentation(gamePresentation({font:{family:'serif',asset:font},title:{background:image},toolbar:['menu','history','auto']}));void player.showSystemScreen('settings');
 // @ts-expect-error Artwork resources are images.
 gamePresentation({title:{background:audio}});
 // @ts-expect-error Interface fonts must use font resources.
 gamePresentation({font:{family:'serif',asset:image}});
 // @ts-expect-error System actions are a finite vocabulary.
 gamePresentation({toolbar:['menu','javascript']});
 // @ts-expect-error Arbitrary CSS is not a skin contract.
 gamePresentation({css:'body{display:none}'});
 // @ts-expect-error System pages are finite and do not expose arbitrary PC writes.
 void player.showSystemScreen('main:secret');
 // @ts-expect-error Authored skin projection is readonly.
 player.getSnapshot().presentation!.labels.start='changed';
}
