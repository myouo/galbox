import {it,expect} from 'vitest';
import {ProgramBuilder,uiSound} from 'galbox-sdk/port-kit';
import {parseUISoundRequest} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
it('real cue factories associate audio handles and schema rejects unsupported gain or fields',()=>{
 const b=new ProgramBuilder({gameId:'ui-cues',release:'v1',entry:'main'}),audio=b.asset('audio',{id:'click',path:'click.wav',mime:'audio/wav',sha256:'a'.repeat(64)}),image=b.asset('image',{id:'picture',path:'picture.png',mime:'image/png',sha256:'b'.repeat(64)});
 expect(uiSound(audio)).toEqual({asset:'click',gain:1});
 // @ts-expect-error Interface sounds require audio resources.
 expect(()=>uiSound(image)).toThrow('ASSET_KIND');
 for(const gain of [-1,1.01])expect(()=>uiSound(audio,gain)).toThrow('SCHEMA_UI_SOUND');
 for(const gain of [NaN,Infinity])expect(()=>uiSound(audio,gain)).toThrow('INPUT_JSON');
 expect(()=>parseUISoundRequest({asset:'click',gain:1,loop:true})).toThrow('SCHEMA_UI_SOUND');
});
it('cue messages roundtrip through protobuf and detach mutable external requests',()=>{
 const input={asset:'click',gain:.25},request=parseUISoundRequest(input);input.gain=1;expect(request.gain).toBe(.25);for(const gain of [0,.25,1]){const cue=parseUISoundRequest({asset:'click',gain});expect(decodeWire('UISoundRequest',encodeWire('UISoundRequest',cue))).toEqual(cue);}expect(()=>parseUISoundRequest({asset:'../file.wav',gain:1})).toThrow('SCHEMA_UI_SOUND');
});
