import type {Player} from '../../packages/galbox-sdk/src/player/index.js';
import type {PreferencesPatch} from '../../packages/galbox-sdk/src/settings/index.js';
import {mergePreferences,defaultPreferences} from '../../packages/galbox-sdk/src/settings/index.js';
export function preferencesTypes(player:Player){
 const patch:PreferencesPatch={audio:{bgm:.5},text:{intervalMs:16}};void player.updatePreferences(patch);mergePreferences(defaultPreferences(),patch);
 // @ts-expect-error Public view settings are recursively readonly.
 player.getSnapshot().preferences.value.audio.master=0;
 // @ts-expect-error An unimplemented setting is not a published typed capability.
 const unsupported:PreferencesPatch={autoPlay:true};void unsupported;
}
