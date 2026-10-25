import type {Player} from '../../packages/galbox-sdk/src/player/index.js';
import type {PreferencesPatch} from '../../packages/galbox-sdk/src/settings/index.js';
import {mergePreferences,defaultPreferences} from '../../packages/galbox-sdk/src/settings/index.js';
export function preferencesTypes(player:Player){
 const patch:PreferencesPatch={audio:{bgm:.5},text:{intervalMs:16},playback:{autoDelayMs:500,skipUnread:false},input:{advance:['KeyD']},display:{fontScale:1.25,windowOpacity:.8}};void player.updatePreferences(patch);mergePreferences(defaultPreferences(),patch);
 void player.setAuto(true);player.setFast(true);void player.resetPreferences();void player.importPreferences(player.exportPreferences());
 // @ts-expect-error Unsupported physical keys cannot be published as implemented bindings.
 const invalid:PreferencesPatch={input:{advance:['UnknownKey']}};void invalid;
 // @ts-expect-error Playback modes are a finite public union.
 const mode:typeof player.getSnapshot extends ()=>{playback:{mode:infer T}}?T:never='turbo';void mode;
 // @ts-expect-error Public view settings are recursively readonly.
 player.getSnapshot().preferences.value.audio.master=0;
 // @ts-expect-error An unimplemented setting is not a published typed capability.
 const unsupported:PreferencesPatch={autoPlay:true};void unsupported;
}
