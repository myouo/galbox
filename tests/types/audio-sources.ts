import {ProgramBuilder,sfxTrack,audioSourceFade,audioFadeOutAndStop,expr} from 'galbox-sdk/port-kit';
const b=new ProgramBuilder({gameId:'typed-sources',release:'v1',entry:'main'});
const buffer=b.sfxBuffer('ambient'),audio=b.asset('audio',{id:'audio',path:'audio.wav',mime:'audio/wav',sha256:'0'.repeat(64)}),image=b.asset('image',{id:'image',path:'image.png',mime:'image/png',sha256:'0'.repeat(64)});
sfxTrack('play','ambient',audio,buffer,{loop:true,restore:'replay'});
audioFadeOutAndStop('fade','fade','ambient',expr.integer(500));
// @ts-expect-error A sound buffer is not an image resource.
sfxTrack('bad','bad',image,buffer,{restore:'replay'});
// @ts-expect-error An audio asset is not a declared SFX buffer.
sfxTrack('bad','bad',audio,audio,{restore:'replay'});
// @ts-expect-error SFX buffers cannot be moved to the voice role.
sfxTrack('bad','bad',audio,buffer,{channel:'voice',restore:'replay'});
// @ts-expect-error Source fade duration must be an integer expression.
audioFadeOutAndStop('bad','bad','ambient',expr.real(500));
// @ts-expect-error Source gain must be a numeric expression.
audioSourceFade('bad','bad','ambient',expr.flag(true),500);
