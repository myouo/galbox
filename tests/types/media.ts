import {audioTrack,audioFade,audioDuck,uiSound,expr as E} from '../../packages/galbox-sdk/src/program-tools/index.js';
import type {AssetRef} from '../../packages/galbox-sdk/src/program-tools/index.js';
import type {Player} from '../../packages/galbox-sdk/src/player/index.js';
export function mediaTypes(audio:AssetRef<'audio'>,image:AssetRef<'image'>,player:Player){audioTrack('track','voice',audio,{channel:'voice',gain:E.real(.6),loop:false,restore:'replay'});audioFade('fade','fade','bgm',.2,E.integer(500));audioDuck('duck',true,.3,100,200);void player.replayVoice();void player.playUISound(uiSound(audio,.5));
 // @ts-expect-error Interface cues use audio handles, not images.
 uiSound(image);
 // @ts-expect-error Cue gain must be numeric.
 player.playUISound({asset:audio.id,gain:true});
 // @ts-expect-error Audio track cannot use an image resource.
 audioTrack('bad','bad',image,{channel:'voice',restore:'stop'});
 // @ts-expect-error Gain is a numeric expression.
 audioTrack('bad','bad',audio,{channel:'voice',gain:E.flag(true),restore:'stop'});
 // @ts-expect-error Loop times require integer expressions.
 audioTrack('bad','bad',audio,{channel:'voice',loopEndMs:E.real(500),restore:'stop'});
 // @ts-expect-error Native media roles are finite.
 audioFade('bad','bad','arbitrary',.5,500);
}
